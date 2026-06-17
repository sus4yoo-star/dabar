import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 가벼운 클라이언트 오류 수집 — 외부 서비스 없이 Netlify 함수 로그로 남겨
// 운영 중 실제 사용자 오류를 파악할 수 있게 한다. (PII 최소화·길이 제한·레이트리밋)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "clientlog", 30, 60_000);
  if (!rl.ok) return new NextResponse(null, { status: 429 });

  let b: { kind?: string; message?: string; stack?: string; url?: string; ua?: string };
  try { b = await req.json(); } catch { return new NextResponse(null, { status: 204 }); }

  const msg = String(b.message ?? "").trim().slice(0, 500);
  if (!msg) return new NextResponse(null, { status: 204 });
  const kind = String(b.kind ?? "error").slice(0, 30);
  const stack = String(b.stack ?? "").slice(0, 1500);
  const url = String(b.url ?? "").slice(0, 300);
  const ua = String(b.ua ?? "").slice(0, 200);

  console.error(`[client:${kind}] ${msg}\n  at ${url}\n  ua ${ua}${stack ? `\n  ${stack}` : ""}`);
  return new NextResponse(null, { status: 204 });
}
