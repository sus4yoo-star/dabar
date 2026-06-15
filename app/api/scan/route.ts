import { NextRequest, NextResponse } from "next/server";

// 📷 이미지 번역 — 사진 속 글자를 읽어(OCR) 설정 언어로 번역. 읽기 쉬운 "줄 목록"으로 반환.
// Anthropic(Claude) 비전.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-haiku-4-5-20251001"; // 가장 빠른 비전 모델 — OCR+번역 목록

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

type Item = { original: string; translated: string };

function extractJson(s: string): { items?: unknown } | null {
  try { return JSON.parse(s); } catch { /* find block */ }
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
    `You help a traveler understand a foreign sign, menu, label, or notice from a photo. ` +
    `Read the text in reading order (top to bottom, grouping each menu item / line). For each line return ` +
    `"original" = the text as printed, and "translated" = its ${langName} translation. Keep prices and numbers. ` +
    `Merge a dish name and its price into ONE line. Output ONLY JSON (no markdown): ` +
    `{"items":[{"original":"...","translated":"..."}]}. If there is no readable text, {"items":[]}.`;

  const content: unknown[] = [
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
    { type: "text", text: `사진 속 글자를 줄 단위로 읽고 ${langName}로 번역해 주세요. JSON만 반환.` },
  ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, messages: [{ role: "user", content }] }),
    });
    if (!r.ok) {
      const ed = await r.json().catch(() => null);
      return NextResponse.json({ error: "scan-failed", detail: ed?.error?.message ?? null }, { status: 502 });
    }
    const d = await r.json();
    const text = (d?.content?.[0]?.text ?? "").trim();
    const parsed = extractJson(text);
    const raw = Array.isArray(parsed?.items) ? (parsed!.items as unknown[]) : [];
    const items: Item[] = [];
    for (const it of raw) {
      const o = it as { original?: unknown; translated?: unknown };
      const translated = typeof o.translated === "string" ? o.translated.trim() : "";
      if (!translated) continue;
      items.push({ original: typeof o.original === "string" ? o.original.trim() : "", translated });
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
