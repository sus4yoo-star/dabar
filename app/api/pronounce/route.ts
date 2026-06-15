import { NextRequest, NextResponse } from "next/server";

// 발음 가이드 — 어떤 언어의 문장을, 읽는 사람 언어의 글자로 "어떻게 소리나는지" 표기.
// 예) 태국어 "สวัสดี" → 한국어 글자로 "사왓디". (말하는 사람이 보고 따라 말할 수 있게)
// Anthropic(Claude) 서버사이드. 실패해도 빈 문자열로 graceful 반환.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5-20251001"; // 최신·빠른 모델 (구 sonnet-4-20250514 폐기 대응)

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

export async function POST(req: NextRequest) {
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
    `You write pronunciation guides. Given a phrase written in ${langName}, write how it SOUNDS using ${scriptName} script/letters ONLY, ` +
    `so that a ${scriptName} speaker can read it out loud and be understood by a ${langName} speaker. ` +
    `Output ONLY the pronunciation in ${scriptName} letters — no original text, no quotes, no romanization (unless ${scriptName} is English), no notes, no extra words.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        temperature: 0,
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
