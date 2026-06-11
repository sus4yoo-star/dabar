import { NextRequest, NextResponse } from "next/server";

// 서버에서만 구글 키 사용. 화면 마이크로 녹음한 PCM(LINEAR16)을 받아 음성 → 텍스트.
// ※ 같은 GOOGLE_TRANSLATE_API_KEY 를 쓰되, 해당 GCP 프로젝트에서 "Cloud Speech-to-Text API"가 사용 설정돼 있어야 함.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANG: Record<string, string> = { ko: "ko-KR", en: "en-US", th: "th-TH" };

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { audio?: string; lang?: string; rate?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const audio = (body.audio ?? "").trim();
  const lang = body.lang ?? "ko";
  const rate = body.rate ?? 16000;
  if (!audio) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  try {
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: rate,
            languageCode: LANG[lang] ?? lang,
            enableAutomaticPunctuation: true,
          },
          audio: { content: audio },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: "stt-failed", detail: data?.error?.message ?? null },
        { status: 502 }
      );
    }
    const text: string = (data?.results ?? [])
      .map((r: any) => r?.alternatives?.[0]?.transcript ?? "")
      .join(" ")
      .trim();
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
