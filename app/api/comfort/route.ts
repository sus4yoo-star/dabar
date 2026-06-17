import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 마음의 말씀 — 사용자의 감정/상황을 받아 위로·치유·용기가 되는 성경 구절을 최대 10개 반환.
// Anthropic(Claude) 서버사이드 호출. 키는 환경변수에만.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6"; // 최신 Sonnet (구 claude-sonnet-4-20250514는 폐기 예정 → 교체)

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "comfort", 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { feeling?: string; lang?: string; images?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }
  const feeling = (body.feeling ?? "").trim().slice(0, 600);
  const images = (Array.isArray(body.images) ? body.images : [])
    .filter((s) => typeof s === "string" && s.length > 0 && s.length < 5_000_000)
    .slice(0, 4);
  const lang = body.lang && LANG_NAME[body.lang] ? body.lang : "ko";
  if (!feeling && images.length === 0) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  const langName = LANG_NAME[lang];

  const system =
    `You are a warm, compassionate Christian companion who comforts people with Scripture. ` +
    `A person shares how they feel or what they are going through. Respond with Bible verses that bring genuine comfort, healing, courage, or hope for THAT specific feeling. ` +
    `Output ONLY a JSON array (no markdown, no prose) of EXACTLY 8 objects, ordered from the most fitting verse to related ones that naturally follow. ` +
    `Each object: {"ref": "<book chapter:verse>", "text": "<the verse text>", "note": "<one short, warm, personal sentence connecting this verse to their feeling>"}. ` +
    `Write "ref", "text", and "note" ALL in ${langName}. ` +
    (lang === "ko"
      ? `For "text", quote the verse EXACTLY as written in the 성경전서 개역개정판 (Korean Revised Version, NKRV) — word for word, including its spacing and endings. Do NOT paraphrase, modernize, or shorten it. For "ref" use the standard Korean book name (예: "시편 23:4", "여호수아 1:9"). `
      : `For "text", quote a well-known standard ${langName} Bible translation accurately, word for word. `) +
    `If image(s) are attached, interpret them (a photo, a scene, or a screenshot of a conversation) and let them — together with any text — guide which verses bring comfort. ` +
    `Keep notes to one short sentence. Tone: gentle and personal, never preachy. Return strictly valid JSON.`;

  const content: unknown[] = [];
  if (images.length) {
    for (const data of images) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  }
  content.push({ type: "text", text: feeling || "(여기 첨부한 이미지를 보고 지금 상황과 마음을 헤아려, 위로가 되는 말씀을 찾아주세요.)" });

  // 스트리밍 — 모델이 구절을 만드는 즉시 한 개씩(NDJSON 한 줄씩) 흘려보낸다.
  // 화면은 한 구절씩 보는 캐러셀이라, 첫 구절이 도착하자마자 바로 읽을 수 있다.
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1700, // 8개 구절 + 잘림 방지 여유 (스트리밍이라 첫 구절은 즉시 도착)
      stream: true,
      system,
      messages: [{ role: "user", content }],
    }),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await upstream.text().catch(() => "") : "";
    return NextResponse.json({ error: "api-failed", detail: detail.slice(0, 300) }, { status: 502 });
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sse = "";                                          // SSE 라인 버퍼
      let txt = "";                                          // 누적된 모델 텍스트(JSON 배열)
      let scanned = 0, depth = 0, inStr = false, esc = false, objStart = -1, count = 0;

      const emit = (jsonStr: string) => {
        try {
          const v = JSON.parse(jsonStr) as { ref?: string; text?: string; note?: string };
          const out = { ref: String(v.ref ?? "").trim(), text: String(v.text ?? "").trim(), note: String(v.note ?? "").trim() };
          if (out.ref || out.text) { controller.enqueue(encoder.encode(JSON.stringify(out) + "\n")); count++; }
        } catch { /* 미완성/이상 객체는 무시 */ }
      };
      // 누적 텍스트에서 완성된 최상위 객체 {…} 가 닫힐 때마다 방출 (문자열/이스케이프 인지)
      const scan = () => {
        for (; scanned < txt.length; scanned++) {
          const c = txt[scanned];
          if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
          if (c === '"') { inStr = true; continue; }
          if (c === "{") { if (depth === 0) objStart = scanned; depth++; }
          else if (c === "}" && depth > 0) { depth--; if (depth === 0 && objStart >= 0) { emit(txt.slice(objStart, scanned + 1)); objStart = -1; } }
        }
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          sse += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = sse.indexOf("\n")) >= 0) {
            const s = sse.slice(0, nl).trim(); sse = sse.slice(nl + 1);
            if (!s.startsWith("data:")) continue;
            const data = s.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try { const ev = JSON.parse(data); const t = ev?.delta?.text; if (typeof t === "string") { txt += t; scan(); } } catch { /* */ }
          }
        }
      } catch { /* 업스트림 중단 — 이미 보낸 구절은 유효 */ }
      if (count === 0) controller.enqueue(encoder.encode(JSON.stringify({ error: "empty" }) + "\n"));
      controller.close();
    },
    cancel() { reader.cancel().catch(() => {}); },
  });

  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
