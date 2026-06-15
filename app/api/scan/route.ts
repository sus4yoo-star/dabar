import { NextRequest, NextResponse } from "next/server";

// 📷 메뉴·간판 번역 — 사진 속 글자를 읽어(OCR) 설정한 언어로 번역.
// Anthropic(Claude) 비전. 키는 환경변수에만.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-20250514";

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

function extractJson(s: string): { translated?: string; original?: string } | null {
  try { return JSON.parse(s); } catch { /* try to find a JSON block */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* */ } }
  return null;
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { image?: string; lang?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }

  const image = (body.image ?? "").trim();
  const lang = body.lang && LANG_NAME[body.lang] ? body.lang : "ko";
  if (!image || image.length > 6_000_000) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const langName = LANG_NAME[lang];

  const system =
    `You help a traveler/missionary understand a foreign sign, menu, label, or notice from a photo. ` +
    `Read ALL the text in the image, then translate it into ${langName}. ` +
    `Preserve the layout: keep menu items / lines separated with line breaks, and keep prices and numbers as printed. ` +
    `Output ONLY a JSON object (no markdown): {"translated":"<full text translated into ${langName}, line breaks preserved>","original":"<the original text exactly as printed>"}. ` +
    `If there is no readable text, return {"translated":"","original":""}.`;

  const content: unknown[] = [
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
    { type: "text", text: `이 사진의 글자를 읽고 ${langName}로 번역해 주세요. JSON만 반환.` },
  ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, temperature: 0.2, system, messages: [{ role: "user", content }] }),
    });
    if (!r.ok) return NextResponse.json({ error: "scan-failed" }, { status: 502 });
    const d = await r.json();
    const text = (d?.content?.[0]?.text ?? "").trim();
    const parsed = extractJson(text);
    return NextResponse.json({
      translated: (parsed?.translated ?? "").trim(),
      original: (parsed?.original ?? "").trim(),
    });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
