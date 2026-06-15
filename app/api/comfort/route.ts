import { NextRequest, NextResponse } from "next/server";

// 마음의 말씀 — 사용자의 감정/상황을 받아 위로·치유·용기가 되는 성경 구절을 최대 10개 반환.
// Anthropic(Claude) 서버사이드 호출. 키는 환경변수에만.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-20250514"; // 프로젝트 표준 모델

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { feeling?: string; lang?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }
  const feeling = (body.feeling ?? "").trim().slice(0, 600);
  const lang = body.lang && LANG_NAME[body.lang] ? body.lang : "ko";
  if (!feeling) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const langName = LANG_NAME[lang];

  const system =
    `You are a warm, compassionate Christian companion who comforts people with Scripture. ` +
    `A person shares how they feel or what they are going through. Respond with Bible verses that bring genuine comfort, healing, courage, or hope for THAT specific feeling. ` +
    `Output ONLY a JSON array (no markdown, no prose) of 6 to 8 objects, ordered from the most fitting verse to related ones that naturally follow. ` +
    `Each object: {"ref": "<book chapter:verse>", "text": "<the verse text>", "note": "<one short, warm, personal sentence connecting this verse to their feeling>"}. ` +
    `Write "ref", "text", and "note" ALL in ${langName}. ` +
    (lang === "ko"
      ? `For "text", quote the verse EXACTLY as written in the 성경전서 개역개정판 (Korean Revised Version, NKRV) — word for word, including its spacing and endings. Do NOT paraphrase, modernize, or shorten it. For "ref" use the standard Korean book name (예: "시편 23:4", "여호수아 1:9"). `
      : `For "text", quote a well-known standard ${langName} Bible translation accurately, word for word. `) +
    `Keep notes to one short sentence. Tone: gentle and personal, never preachy. Return strictly valid JSON.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content: feeling }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return NextResponse.json({ error: "api-failed", detail: detail.slice(0, 300) }, { status: 502 });
    }
    const d = await r.json();
    const raw: string = d?.content?.[0]?.text ?? "";
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start < 0 || end < 0) return NextResponse.json({ error: "parse-failed" }, { status: 502 });
    let arr: { ref?: string; text?: string; note?: string }[];
    try { arr = JSON.parse(raw.slice(start, end + 1)); } catch { return NextResponse.json({ error: "parse-failed" }, { status: 502 }); }
    const verses = (Array.isArray(arr) ? arr : [])
      .filter((v) => v && (v.ref || v.text))
      .slice(0, 10)
      .map((v) => ({ ref: String(v.ref ?? "").trim(), text: String(v.text ?? "").trim(), note: String(v.note ?? "").trim() }));
    if (!verses.length) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json({ verses });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
