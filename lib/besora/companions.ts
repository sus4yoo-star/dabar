import { getSupabase } from "@/lib/besora/supabase";
import { supabase as publicSb } from "@/lib/supabase";

export type Companion = {
  id: string;
  otherId: string;
  nickname: string;
  avatarUrl: string | null;
  lastAt: string;
};

export type ChatMessage = {
  id: string;
  companion_id: string;
  sender: string;
  body: string;
  created_at: string;
};

export type ChatListItem = {
  id: string;          // companion id
  otherId: string;
  nickname: string;
  avatarUrl: string | null;
  lastBody: string | null;
  lastAt: string | null;
  lastSender: string | null;
  unread: number;
};

export async function getMyId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getUser();
  return data.user?.id ?? null;
}

// 초대 코드 생성 → 링크에 붙일 코드 반환
export async function createInvite(): Promise<string> {
  const { data, error } = await getSupabase().rpc("create_invite");
  if (error) throw error;
  return data as string;
}

// 초대 수락 → 동행 id 반환
export async function acceptInvite(code: string): Promise<string> {
  const { data, error } = await getSupabase().rpc("accept_invite", { p_code: code });
  if (error) throw error;
  return data as string;
}

// 내 동행 목록 (상대 프로필까지 합쳐서)
export async function fetchCompanions(): Promise<Companion[]> {
  const sb = getSupabase();
  const myId = await getMyId();
  if (!myId) return [];
  const { data, error } = await sb.from("companions").select("*").order("last_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as { id: string; user_a: string; user_b: string; last_at: string }[];
  if (rows.length === 0) return [];

  const otherIds = rows.map((r) => (r.user_a === myId ? r.user_b : r.user_a));
  const { data: profs } = await publicSb.from("profiles").select("id, nickname, avatar_url").in("id", otherIds);
  const byId = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));

  return rows.map((r) => {
    const otherId = r.user_a === myId ? r.user_b : r.user_a;
    const p = byId[otherId];
    return {
      id: r.id,
      otherId,
      nickname: p?.nickname ?? "동행자",
      avatarUrl: p?.avatar_url ?? null,
      lastAt: r.last_at,
    };
  });
}

// 한 동행의 상대 프로필 (채팅 헤더용)
export async function fetchCompanion(companionId: string): Promise<Companion | null> {
  const list = await fetchCompanions();
  return list.find((c) => c.id === companionId) ?? null;
}

export async function fetchMessages(companionId: string): Promise<ChatMessage[]> {  const { data, error } = await getSupabase()
    .from("messages").select("*").eq("companion_id", companionId).order("created_at");
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

// 받은편지함(채팅 리스트) — 마지막 메시지 미리보기 + 안읽음 수.
// chat_list RPC 가 아직 없으면(SQL 미실행) 동행 목록으로 자연스럽게 폴백.
export async function fetchChatList(): Promise<ChatListItem[]> {
  const sb = getSupabase();
  const myId = await getMyId();
  if (!myId) return [];

  const { data, error } = await sb.rpc("chat_list");
  if (error || !data) {
    // 폴백: 미리보기/안읽음 없이 동행 목록만
    const comps = await fetchCompanions();
    return comps.map((c) => ({
      id: c.id, otherId: c.otherId, nickname: c.nickname, avatarUrl: c.avatarUrl,
      lastBody: null, lastAt: c.lastAt, lastSender: null, unread: 0,
    }));
  }

  const rows = data as any[];
  if (rows.length === 0) return [];
  const otherIds = rows.map((r) => r.other_id);
  const { data: profs } = await publicSb.from("profiles").select("id, nickname, avatar_url").in("id", otherIds);
  const byId = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));

  return rows.map((r) => ({
    id: r.companion_id,
    otherId: r.other_id,
    nickname: byId[r.other_id]?.nickname ?? "동행자",
    avatarUrl: byId[r.other_id]?.avatar_url ?? null,
    lastBody: r.last_body ?? null,
    lastAt: r.last_at ?? null,
    lastSender: r.last_sender ?? null,
    unread: r.unread ?? 0,
  }));
}

// 채팅방을 열거나 새 메시지를 봤을 때 — 내 쪽 읽음 처리
export async function markRead(companionId: string): Promise<void> {
  try { await getSupabase().rpc("mark_read", { p_companion: companionId }); } catch { /* ignore */ }
}

// 채팅 리스트용 시간 표기 (방금 / N분 전 / 오늘 시:분 / 어제 / 월 일)
export function chatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (new Date().toDateString() === d.toDateString())
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  if (new Date(now - 86400000).toDateString() === d.toDateString()) return "어제";
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export async function sendMessage(companionId: string, body: string): Promise<void> {
  const myId = await getMyId();
  if (!myId) throw new Error("login required");
  const { error } = await getSupabase()
    .from("messages").insert({ companion_id: companionId, sender: myId, body });
  if (error) throw error;
}

// 실시간 구독 — 새 메시지가 오면 콜백. 해제 함수 반환.
export function subscribeMessages(companionId: string, onInsert: (m: ChatMessage) => void): () => void {
  const sb = getSupabase();
  const ch = sb
    .channel(`messages:${companionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "besora", table: "messages", filter: `companion_id=eq.${companionId}` },
      (payload: any) => onInsert(payload.new as ChatMessage)
    )
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch { /* ignore */ } };
}
