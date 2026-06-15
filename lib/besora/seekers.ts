import { getSupabase } from "@/lib/besora/supabase";

// 전도 여정 — 내가 전하는 사람들(태신자) 트래커. 본인만 접근(RLS owner).
export type Stage = "interest" | "heard" | "decided" | "settled";
export const STAGES: Stage[] = ["interest", "heard", "decided", "settled"];
export type Seeker = { id: string; owner: string; name: string; stage: Stage; note: string | null; phone: string | null; next_action: string | null; next_at: string | null; created_at: string; updated_at: string };

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

export async function addSeeker(name: string, note: string, opts?: { stage?: Stage; phone?: string }): Promise<Seeker | null> {
  const uid = await myId(); if (!uid) throw new Error("login required");
  const { data, error } = await getSupabase().from("seekers")
    .insert({ owner: uid, name: name.trim(), note: note.trim() || null, stage: opts?.stage ?? "interest", phone: opts?.phone?.trim() || null }).select("*").maybeSingle();
  if (error) throw error;
  return (data as Seeker) ?? null;
}

export async function updateSeeker(id: string, patch: { name?: string; note?: string | null; stage?: Stage; phone?: string | null; next_action?: string | null; next_at?: string | null }): Promise<void> {
  const { error } = await getSupabase().from("seekers").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteSeeker(id: string): Promise<void> {
  try { await getSupabase().from("seekers").delete().eq("id", id); } catch { /* */ }
}

// 홈 카드용 단계별 카운트 + 오늘(이전 포함) 챙길 수
export async function seekerCounts(): Promise<{ total: number; byStage: Record<Stage, number>; due: number }> {
  const list = await fetchSeekers();
  const byStage: Record<Stage, number> = { interest: 0, heard: 0, decided: 0, settled: 0 };
  const today = new Date().toLocaleDateString("en-CA");
  let due = 0;
  list.forEach((s) => { if (byStage[s.stage] !== undefined) byStage[s.stage]++; if (s.next_at && s.next_at <= today) due++; });
  return { total: list.length, byStage, due };
}
