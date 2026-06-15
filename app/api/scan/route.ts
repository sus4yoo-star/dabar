import { NextRequest, NextResponse } from "next/server";

// 📷 메뉴·간판 번역 — 사진 속 글자를 읽어(OCR) 위치(박스)와 함께 설정 언어로 번역.
// 프론트가 원문 위에 번역을 겹쳐 표시(구글 번역 카메라식). Anthropic(Claude) 비전.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-20250514";

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

type Item = { box: { x: number; y: number; w: number; h: number }; original: string; translated: string };

function extractJson(s: string): { items?: unknown } | null {
  try { return JSON.parse(s); } catch { /* find block */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* */ } }
  return null;
}

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : NaN);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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
    `Detect each distinct block of text (a line, a heading, or a menu item). For EACH block return: ` +
    `"box" = its bounding box as fractions of the image: {"x":<left>,"y":<top>,"w":<width>,"h":<height>}, each between 0 and 1 (x,y is the top-left corner); ` +
    `"original" = the text exactly as printed; "translated" = that text translated into ${langName}. ` +
    `Keep prices and numbers as printed. Order blocks top-to-bottom. ` +
    `Output ONLY JSON (no markdown): {"items":[{"box":{"x":0.1,"y":0.2,"w":0.3,"h":0.05},"original":"...","translated":"..."}]}. ` +
    `If there is no readable text, return {"items":[]}.`;

  const content: unknown[] = [
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
    { type: "text", text: `사진 속 글자를 블록별로 위치와 함께 인식하고 ${langName}로 번역해 주세요. JSON만 반환.` },
  ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 2500, temperature: 0.1, system, messages: [{ role: "user", content }] }),
    });
    if (!r.ok) return NextResponse.json({ error: "scan-failed" }, { status: 502 });
    const d = await r.json();
    const text = (d?.content?.[0]?.text ?? "").trim();
    const parsed = extractJson(text);
    const raw = Array.isArray(parsed?.items) ? (parsed!.items as unknown[]) : [];
    const items: Item[] = [];
    for (const it of raw) {
      const o = it as { box?: Record<string, unknown>; original?: unknown; translated?: unknown };
      const x = num(o.box?.x), y = num(o.box?.y), w = num(o.box?.w), h = num(o.box?.h);
      const translated = typeof o.translated === "string" ? o.translated.trim() : "";
      if (!translated || [x, y, w, h].some((v) => isNaN(v)) || w <= 0 || h <= 0) continue;
      items.push({
        box: { x: clamp01(x), y: clamp01(y), w: clamp01(w), h: clamp01(h) },
        original: typeof o.original === "string" ? o.original.trim() : "",
        translated,
      });
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
