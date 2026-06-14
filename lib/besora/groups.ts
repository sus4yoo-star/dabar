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
