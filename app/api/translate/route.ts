import { NextRequest, NextResponse } from "next/server";

// 서버에서만 Google 번역 키를 사용 (클라이언트에 노출 안 함)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "no-key" }, { status: 500 });
  }

  let body: { q?: string; source?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const q = (body.q ?? "").trim();
  const target = body.target;
  const source = body.source;
  if (!q || !target) {
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
    const tr = data?.data?.translations?.[0];
    const text: string | undefined = tr?.translatedText;
    if (!res.ok || !text) {
      return NextResponse.json(
        { error: "translate-failed", detail: data?.error?.message ?? null },
        { status: 502 }
      );
    }
    // source 를 생략하면 구글이 언어를 자동 감지 → 감지된 언어 코드도 함께 반환
    return NextResponse.json({ text, detected: tr?.detectedSourceLanguage ?? null });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
