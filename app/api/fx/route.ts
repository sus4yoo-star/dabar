import { NextResponse } from "next/server";

// 다국가 환율 — USD 기준 전체 시세표를 반환. (음성통역 지원 언어들의 통화 환전용)
// 매일 오전 9시(KST)를 경계로 하루 한 번만 갱신.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cache: { rates: Record<string, number>; asOf: string; bucket: string } | null = null;

function currentBucket(): string {
  const kst = new Date(Date.now() + 9 * 3600 * 1000); // UTC+9
  if (kst.getUTCHours() < 9) kst.setUTCDate(kst.getUTCDate() - 1);
  return kst.toISOString().slice(0, 10);
}

async function fetchRates(): Promise<Record<string, number> | null> {
  // 1순위 open.er-api(통화 폭넓음: LAK·MMK·BDT 등), 2순위 frankfurter(ECB, 주요 통화)
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); if (j?.rates && j.rates.KRW) return j.rates as Record<string, number>; }
  } catch { /* fall through */ }
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=USD", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); if (j?.rates) return { USD: 1, ...(j.rates as Record<string, number>) }; }
  } catch { /* fall through */ }
  return null;
}

export async function GET() {
  const bucket = currentBucket();
  if (cache && cache.bucket === bucket) {
    return NextResponse.json({ rates: cache.rates, asOf: cache.asOf, cached: true });
  }
  const rates = await fetchRates();
  if (!rates) {
    if (cache) return NextResponse.json({ rates: cache.rates, asOf: cache.asOf, stale: true });
    return NextResponse.json({ rates: {}, asOf: null, fallback: true });
  }
  const asOf = new Date().toISOString();
  cache = { rates, asOf, bucket };
  return NextResponse.json({ rates, asOf, cached: false });
}
