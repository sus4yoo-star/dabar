import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 여러 문자열을 한 번에 번역 (요리문답·교재 등 대량 번역용).
// Google Translate v2 는 q 배열을 받아 같은 순서로 translations 를 돌려준다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "translate-batch", 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { q?: string[]; source?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const q = (body.q ?? []).filter((s) => typeof s === "string");
  const target = body.target;
  const source = body.source;
  if (!q.length || !target) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, target, source, format: "text" }),
      }
    );
    const data = await res.json();
    const translations: string[] | undefined = data?.data?.translations?.map(
      (t: { translatedText: string }) => t.translatedText
    );
    if (!res.ok || !translations) {
      return NextResponse.json(
        { error: "translate-failed", detail: data?.error?.message ?? null },
        { status: 502 }
      );
    }
    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
