import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 발음 가이드 — 어떤 언어의 문장을, 읽는 사람 언어의 글자로 "어떻게 소리나는지" 표기.
// 예) 태국어 "สวัสดี" → 한국어 글자로 "사왓디". (말하는 사람이 보고 따라 말할 수 있게)
// Anthropic(Claude) 서버사이드. 실패해도 빈 문자열로 graceful 반환.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6"; // 음차 품질을 위해 Sonnet 4.6 (Haiku는 태국어→한글 음차 부정확)

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "pronounce", 80, 60_000);
  if (!rl.ok) return NextResponse.json({ pron: "" }); // 발음은 부가기능 — 막혀도 빈 값(graceful)

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ pron: "" });

  let body: { text?: string; lang?: string; script?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ pron: "" }); }

  const text = (body.text ?? "").trim().slice(0, 400);
  const lang = body.lang && LANG_NAME[body.lang] ? body.lang : "";
  const script = body.script && LANG_NAME[body.script] ? body.script : "";
  // 같은 언어거나 빠진 값이면 발음 표기 불필요
  if (!text || !lang || !script || lang === script) return NextResponse.json({ pron: "" });

  const langName = LANG_NAME[lang];
  const scriptName = LANG_NAME[script];
  const system =
    `You are a pronunciation transcriber. The user message is a phrase in ${langName}. ` +
    `Transcribe ONLY how it SOUNDS, written purely in ${scriptName} characters, so a ${scriptName} reader can say it aloud. ` +
    `Hard rules: (1) Output MUST be in ${scriptName} characters only. (2) Do NOT repeat or include the original ${langName} text or its script. ` +
    `(3) No "=", no quotes, no parentheses, no notes, no romanization (unless ${scriptName} is English). ` +
    `(4) Separate words with spaces. Reply with the transcription and nothing else.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!r.ok) return NextResponse.json({ pron: "" });
    const d = await r.json();
    const pron = (d?.content?.[0]?.text ?? "").trim();
    return NextResponse.json({ pron });
  } catch {
    return NextResponse.json({ pron: "" });
  }
}
