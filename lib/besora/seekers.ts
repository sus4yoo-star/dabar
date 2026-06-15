import { getSupabase } from "@/lib/besora/supabase";

// 전도 여정 — 내가 전하는 사람들(태신자) 트래커. 본인만 접근(RLS owner).
export type Stage = "interest" | "heard" | "decided" | "settled";
export const STAGES: Stage[] = ["interest", "heard", "decided", "settled"];
export type Seeker = { id: string; owner: string; name: string; stage: Stage; note: string | null; created_at: string; updated_at: string };

async function myId(): Promise<string | null> {
  try { const { data } = await getSupabase().auth.getUser(); return data.user?.id ?? null; } catch { return null; }
}

export async function fetchSeekers(): Promise<Seeker[]> {
  try {
    const { data, error } = await getSupabase().from("seekers").select("*").order("updated_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Seeker[];
  } catch { return []; }
}

export async function addSeeker(name: string, note: string, stage: Stage = "interest"): Promise<Seeker | null> {
  const uid = await myId(); if (!uid) throw new Error("login required");
  const { data, error } = await getSupabase().from("seekers")
    .insert({ owner: uid, name: name.trim(), note: note.trim() || null, stage }).select("*").maybeSingle();
  if (error) throw error;
  return (data as Seeker) ?? null;
}

export async function updateSeeker(id: string, patch: { name?: string; note?: string | null; stage?: Stage }): Promise<void> {
  const { error } = await getSupabase().from("seekers").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteSeeker(id: string): Promise<void> {
  try { await getSupabase().from("seekers").delete().eq("id", id); } catch { /* */ }
}

// 홈 카드용 단계별 카운트
export async function seekerCounts(): Promise<{ total: number; byStage: Record<Stage, number> }> {
  const list = await fetchSeekers();
  const byStage: Record<Stage, number> = { interest: 0, heard: 0, decided: 0, settled: 0 };
  list.forEach((s) => { if (byStage[s.stage] !== undefined) byStage[s.stage]++; });
  return { total: list.length, byStage };
}
