import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 서버에서만 구글 키 사용. 화면 마이크로 녹음한 PCM(LINEAR16)을 받아 음성 → 텍스트.
// ※ 같은 GOOGLE_TRANSLATE_API_KEY 를 쓰되, 해당 GCP 프로젝트에서 "Cloud Speech-to-Text API"가 사용 설정돼 있어야 함.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANG: Record<string, string> = {
  ko: "ko-KR", en: "en-US", th: "th-TH", lo: "lo-LA",
  es: "es-ES", pt: "pt-BR", zh: "zh-CN", hi: "hi-IN", ar: "ar-SA", fa: "fa-IR",
  my: "my-MM", ms: "ms-MY", vi: "vi-VN", id: "id-ID", bn: "bn-IN", ja: "ja-JP",
  ur: "ur-PK", fr: "fr-FR", ru: "ru-RU", sw: "sw-KE",
};

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "transcribe", 50, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { audio?: string; lang?: string; rate?: number; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  const audio = (body.audio ?? "").trim();
  const lang = body.lang ?? "ko";
  const rate = body.rate ?? 16000;
  const target = body.target; // 있으면 음성인식 직후 서버에서 바로 번역까지 (클라이언트 왕복 1회 절약)
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
      const msg = String(data?.error?.message ?? "");
      // Cloud Speech-to-Text API 가 꺼져 있거나 권한이 없는 경우를 구분
      const disabled = /has not been used|is disabled|SERVICE_DISABLED|PERMISSION_DENIED|not enabled/i.test(msg);
      return NextResponse.json(
        { error: disabled ? "stt-disabled" : "stt-failed", detail: msg || null },
        { status: 502 }
      );
    }
    const text: string = (data?.results ?? [])
      .map((r: any) => r?.alternatives?.[0]?.transcript ?? "")
      .join(" ")
      .trim();

    // target 이 주어지면 같은 요청 안에서 번역까지 처리 → 모바일 왕복 지연 절감
    let translated: string | null = null;
    if (text && target && target !== lang) {
      try {
        const tr = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${key}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: text, target, source: lang, format: "text" }) }
        );
        const td = await tr.json();
        translated = td?.data?.translations?.[0]?.translatedText ?? null;
      } catch { /* 번역 실패 시 클라이언트가 별도 번역으로 폴백 */ }
    }
    return NextResponse.json({ text, translated });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
