"use client";

import { getSupabase } from "@/lib/besora/supabase";

// 전도 간증 — 전한 이야기를 공유하고 '아멘'으로 격려. (besora.testimonies)
export type Testimony = {
  id: string; owner: string; display_name: string | null; body: string;
  tool_slug: string | null; amen_count: number; created_at: string;
};

async function myId(): Promise<string | null> {
  try { const { data } = await getSupabase().auth.getUser(); return data.user?.id ?? null; } catch { return null; }
}

export async function fetchTestimonies(): Promise<{ items: Testimony[]; amened: Set<string> }> {
  const sb = getSupabase();
  const { data, error } = await sb.from("testimonies").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return { items: [], amened: new Set() };
  const items = (data ?? []) as Testimony[];
  const amened = new Set<string>();
  try {
    const { data: a } = await sb.from("testimony_amens").select("testimony_id");
    (a ?? []).forEach((r: { testimony_id: string }) => amened.add(r.testimony_id));
  } catch { /* 비로그인/미적용 */ }
  return { items, amened };
}

export async function addTestimony(body: string, opts: { anonymous: boolean; displayName?: string; toolSlug?: string | null }): Promise<void> {
  const uid = await myId(); if (!uid) throw new Error("login required");
  const { error } = await getSupabase().from("testimonies").insert({
    owner: uid,
    body: body.trim().slice(0, 1500),
    display_name: opts.anonymous ? null : (opts.displayName?.trim().slice(0, 40) || null),
    tool_slug: opts.toolSlug ?? null,
  });
  if (error) throw error;
}

export async function deleteTestimony(id: string): Promise<void> {
  try { await getSupabase().from("testimonies").delete().eq("id", id); } catch { /* */ }
}

export async function toggleAmen(id: string): Promise<{ count: number; on: boolean } | null> {
  const { data, error } = await getSupabase().rpc("toggle_amen", { p_testimony: id });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? { count: (row as { new_count: number }).new_count, on: (row as { amened: boolean }).amened } : null;
}
