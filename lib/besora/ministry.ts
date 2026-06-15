import { getSupabase } from "@/lib/besora/supabase";

// 사역 일정 / 사역 공지사항 — 관리자·리더가 등록, 전체 열람. (besora-ministry.sql)
// DB 미적용 시에도 앱이 죽지 않게 read 는 try/catch 로 빈 배열 폴백.
export type MinistryEvent = { id: string; title: string; starts_at: string; place: string | null; note: string | null; created_at: string };
export type MinistryNotice = { id: string; title: string; body: string | null; created_at: string };

async function uid(): Promise<string | null> {
  try { const { data } = await getSupabase().auth.getUser(); return data.user?.id ?? null; } catch { return null; }
}

export async function fetchEvents(): Promise<MinistryEvent[]> {
  try {
    const cutoff = new Date(Date.now() - 18 * 3600 * 1000).toISOString(); // 오늘 지난 일정도 잠깐 보이게
    const { data, error } = await getSupabase().from("ministry_events").select("*").gte("starts_at", cutoff).order("starts_at", { ascending: true }).limit(50);
    if (error) return [];
    return (data ?? []) as MinistryEvent[];
  } catch { return []; }
}

export async function addEvent(e: { title: string; starts_at: string; place?: string; note?: string }): Promise<MinistryEvent | null> {
  const { data, error } = await getSupabase().from("ministry_events")
    .insert({ title: e.title.trim(), starts_at: e.starts_at, place: e.place?.trim() || null, note: e.note?.trim() || null, created_by: await uid() })
    .select("*").maybeSingle();
  if (error) throw error;
  return (data as MinistryEvent) ?? null;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await getSupabase().from("ministry_events").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchNotices(): Promise<MinistryNotice[]> {
  try {
    const { data, error } = await getSupabase().from("ministry_notices").select("*").order("created_at", { ascending: false }).limit(30);
    if (error) return [];
    return (data ?? []) as MinistryNotice[];
  } catch { return []; }
}

export async function addNotice(n: { title: string; body?: string }): Promise<MinistryNotice | null> {
  const { data, error } = await getSupabase().from("ministry_notices")
    .insert({ title: n.title.trim(), body: n.body?.trim() || null, created_by: await uid() })
    .select("*").maybeSingle();
  if (error) throw error;
  return (data as MinistryNotice) ?? null;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await getSupabase().from("ministry_notices").delete().eq("id", id);
  if (error) throw error;
}
