import { NextResponse } from "next/server";

// 태국 바트(THB) → 대한민국 원(KRW) 기준 환율.
// 매일 오전 9시(KST)를 경계로 하루 한 번만 갱신한다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cache: { rate: number; asOf: string; bucket: string } | null = null;

// 현재 "환율 기준일 버킷"(YYYY-MM-DD, KST). 오늘 09:00 이전이면 어제 날짜.
function currentBucket(): string {
  const kst = new Date(Date.now() + 9 * 3600 * 1000); // UTC+9
  if (kst.getUTCHours() < 9) kst.setUTCDate(kst.getUTCDate() - 1);
  return kst.toISOString().slice(0, 10);
}

async function fetchRate(): Promise<number | null> {
  // 1순위 frankfurter(ECB 기준), 2순위 open.er-api
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=THB&to=KRW", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); const v = Number(j?.rates?.KRW); if (v > 0) return v; }
  } catch { /* fall through */ }
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/THB", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); const v = Number(j?.rates?.KRW); if (v > 0) return v; }
  } catch { /* fall through */ }
  return null;
}

export async function GET() {
  const bucket = currentBucket();
  if (cache && cache.bucket === bucket) {
    return NextResponse.json({ rate: cache.rate, asOf: cache.asOf, cached: true });
  }
  const rate = await fetchRate();
  if (rate == null) {
    if (cache) return NextResponse.json({ rate: cache.rate, asOf: cache.asOf, stale: true });
    return NextResponse.json({ rate: 46.5, asOf: null, fallback: true }); // 최후 근사값
  }
  const asOf = new Date().toISOString();
  cache = { rate, asOf, bucket };
  return NextResponse.json({ rate, asOf, cached: false });
}
