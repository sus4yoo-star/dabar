import { NextRequest, NextResponse } from "next/server";

// 서버에서 Google Cloud Text-to-Speech 로 음성을 합성한다.
// 브라우저에 해당 언어 음성이 없을 때(예: 라오스어 lo-LA) 폴백으로 사용.
// ※ 번역과 같은 GOOGLE_TRANSLATE_API_KEY 를 쓰되, 해당 GCP 프로젝트에서
//   "Cloud Text-to-Speech API" 가 사용 설정돼 있어야 함.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 짧은 코드 → BCP-47 로케일
const LANG: Record<string, string> = {
  ko: "ko-KR", en: "en-US", th: "th-TH", lo: "lo-LA",
  es: "es-ES", zh: "zh-CN", fr: "fr-FR", hi: "hi-IN", pt: "pt-BR", ar: "ar-SA",
};

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const raw = (body.lang ?? "").trim();
  if (!text) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  // "lo" / "lo-LA" 모두 허용
  const languageCode = LANG[raw] ?? (raw.includes("-") ? raw : LANG[raw.split("-")[0]] ?? raw);

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data?.audioContent) {
      return NextResponse.json(
        { error: "tts-failed", detail: data?.error?.message ?? null },
        { status: 502 }
      );
    }
    // base64 MP3
    return NextResponse.json({ audio: data.audioContent });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
