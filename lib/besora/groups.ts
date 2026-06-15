import { getSupabase } from "@/lib/besora/supabase";
import { supabase as publicSb } from "@/lib/supabase";

// 나눔 모임(오프라인) — 리더 개설, 공개 목록 참여, 그룹 나눔 채팅.
// DB(besora-groups.sql) 미적용 시에도 앱이 죽지 않도록 모두 try/catch 로 안전 폴백.

export type Group = {
  id: string;
  leader: string;
  name: string;
  place: string | null;
  schedule: string | null;
  description: string | null;
  notice: string | null;
  is_public: boolean;
  member_count: number;
  created_at: string;
  last_at: string;
};

// 한 모임 최대 인원 (오프라인 나눔 — 6명 이하)
export const MAX_MEMBERS = 6;

export type GroupMessage = { id: string; group_id: string; sender: string; body: string; created_at: string };
export type GroupMember = { user_id: string; role: string; joined_at: string; nickname: string; avatarUrl: string | null };

async function myId(): Promise<string | null> {
  try { const { data } = await getSupabase().auth.getUser(); return data.user?.id ?? null; } catch { return null; }
}

// 공개 모임 목록 (최근 활동 순)
export async function fetchPublicGroups(): Promise<Group[]> {
  try {
    const { data, error } = await getSupabase().from("groups").select("*").eq("is_public", true).order("last_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Group[];
  } catch { return []; }
}

// 내가 속한 모임 id 집합
export async function fetchMyGroupIds(): Promise<Set<string>> {
  try {
    const id = await myId(); if (!id) return new Set();
    const { data } = await getSupabase().from("group_members").select("group_id").eq("user_id", id);
    return new Set((data ?? []).map((r: any) => r.group_id as string));
  } catch { return new Set(); }
}

// 내가 속한 모임 전체(전도 여정 기도 공유 등에서 사용)
export async function fetchMyGroups(): Promise<Group[]> {
  try {
    const ids = [...(await fetchMyGroupIds())];
    if (!ids.length) return [];
    const { data } = await getSupabase().from("groups").select("*").in("id", ids).order("last_at", { ascending: false });
    return (data ?? []) as Group[];
  } catch { return []; }
}

export async function createGroup(p: { name: string; place: string; schedule: string; description: string }): Promise<string> {
  const { data, error } = await getSupabase().rpc("create_group", {
    p_name: p.name, p_place: p.place, p_schedule: p.schedule, p_desc: p.description,
  });
  if (error) throw error;
  return data as string;
}

export async function joinGroup(groupId: string): Promise<void> {
  const id = await myId(); if (!id) throw new Error("login required");
  // 정원 체크 (6명 이하)
  const g = await fetchGroup(groupId);
  if (g && g.member_count >= MAX_MEMBERS) throw new Error("full");
  const { error } = await getSupabase().from("group_members").insert({ group_id: groupId, user_id: id, role: "member" });
  if (error && !/duplicate|unique/i.test(error.message)) throw error;
}

export async function leaveGroup(groupId: string): Promise<void> {
  const id = await myId(); if (!id) return;
  try { await getSupabase().from("group_members").delete().eq("group_id", groupId).eq("user_id", id); } catch { /* */ }
}

// 모임 공지 수정 (리더만 — RLS로 강제)
export async function updateNotice(groupId: string, notice: string): Promise<void> {
  const { error } = await getSupabase().from("groups").update({ notice: notice.trim() || null }).eq("id", groupId);
  if (error) throw error;
}

// 모임 공개/비공개 전환 (리더만 — RLS로 강제)
export async function setGroupPublic(groupId: string, isPublic: boolean): Promise<void> {
  const { error } = await getSupabase().from("groups").update({ is_public: isPublic }).eq("id", groupId);
  if (error) throw error;
}

// 모임 삭제 (리더만 — RLS로 강제). 멤버·메시지·사진은 DB cascade 로 정리.
export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await getSupabase().from("groups").delete().eq("id", groupId);
  if (error) throw error;
}

export async function fetchGroup(groupId: string): Promise<Group | null> {
  try { const { data } = await getSupabase().from("groups").select("*").eq("id", groupId).maybeSingle(); return (data as Group) ?? null; } catch { return null; }
}

export async function fetchMembers(groupId: string): Promise<GroupMember[]> {
  try {
    const { data } = await getSupabase().from("group_members").select("user_id, role, joined_at").eq("group_id", groupId).order("joined_at");
    const rows = (data ?? []) as { user_id: string; role: string; joined_at: string }[];
    if (!rows.length) return [];
    const ids = rows.map(r => r.user_id);
    const { data: profs } = await publicSb.from("profiles").select("id, nickname, avatar_url").in("id", ids);
    const byId = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
    return rows.map(r => ({
      user_id: r.user_id, role: r.role, joined_at: r.joined_at,
      nickname: byId[r.user_id]?.nickname ?? "익명", avatarUrl: byId[r.user_id]?.avatar_url ?? null,
    }));
  } catch { return []; }
}

export async function fetchGroupMessages(groupId: string): Promise<GroupMessage[]> {
  try {
    const { data } = await getSupabase().from("group_messages").select("*").eq("group_id", groupId).order("created_at");
    return (data ?? []) as GroupMessage[];
  } catch { return []; }
}

export async function sendGroupMessage(groupId: string, body: string): Promise<void> {
  const id = await myId(); if (!id) throw new Error("login required");
  const { error } = await getSupabase().from("group_messages").insert({ group_id: groupId, sender: id, body });
  if (error) throw error;
}

// ───────── 모임 사진 (Supabase Storage: group-photos 버킷) ─────────
export type GroupPhoto = { id: string; group_id: string; uploader: string; path: string; created_at: string; url: string };
const PHOTO_BUCKET = "group-photos";

// 업로드 전 이미지 처리: HEIC 등 → JPEG 변환 + 긴 변 최대 1600px 로 축소.
// (브라우저가 디코드 못 하면 원본 그대로 — iOS Safari 는 HEIC 디코드 가능)
async function processImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return file;
  try {
    let w = 0, h = 0;
    let draw: (ctx: CanvasRenderingContext2D, dw: number, dh: number) => void;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      w = bmp.width; h = bmp.height; draw = (ctx, dw, dh) => ctx.drawImage(bmp, 0, 0, dw, dh);
    } catch {
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
      URL.revokeObjectURL(url);
      w = img.naturalWidth; h = img.naturalHeight; draw = (ctx, dw, dh) => ctx.drawImage(img, 0, 0, dw, dh);
    }
    if (!w || !h) return file;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const dw = Math.round(w * scale), dh = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = dw; canvas.height = dh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    draw(ctx, dw, dh);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch { return file; }
}

export async function fetchPhotos(groupId: string): Promise<GroupPhoto[]> {
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("group_photos").select("*").eq("group_id", groupId).order("created_at", { ascending: false });
    if (error) return [];
    const rows = (data ?? []) as Omit<GroupPhoto, "url">[];
    return rows.map(r => ({ ...r, url: sb.storage.from(PHOTO_BUCKET).getPublicUrl(r.path).data.publicUrl }));
  } catch { return []; }
}

export async function uploadPhoto(groupId: string, file: File): Promise<void> {
  const uid = await myId(); if (!uid) throw new Error("login required");
  const sb = getSupabase();
  const f = await processImage(file); // HEIC→JPEG + 축소
  const ext = ((f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")) || "jpg";
  const rand = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const path = `${groupId}/${rand}.${ext}`;
  const up = await sb.storage.from(PHOTO_BUCKET).upload(path, f, { upsert: false, contentType: f.type || undefined });
  if (up.error) throw up.error;
  const ins = await sb.from("group_photos").insert({ group_id: groupId, uploader: uid, path });
  if (ins.error) throw ins.error;
}

export async function deletePhoto(p: GroupPhoto): Promise<void> {
  const sb = getSupabase();
  try { await sb.storage.from(PHOTO_BUCKET).remove([p.path]); } catch { /* */ }
  try { await sb.from("group_photos").delete().eq("id", p.id); } catch { /* */ }
}

export function subscribeGroupMessages(groupId: string, onInsert: (m: GroupMessage) => void): () => void {
  const sb = getSupabase();
  const ch = sb
    .channel(`group_messages:${groupId}`)
    .on("postgres_changes",
      { event: "INSERT", schema: "besora", table: "group_messages", filter: `group_id=eq.${groupId}` },
      (payload: any) => onInsert(payload.new as GroupMessage))
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch { /* */ } };
}
