import { NextRequest } from "next/server";

// 서버가 Google 번역 TTS(gTTS 방식)를 대신 받아 같은 출처로 MP3 를 스트리밍한다.
// → 브라우저는 audio.src="/api/tts?..." 로 재생 (referer/CORS/iOS 제스처 문제 회피).
// Google Cloud TTS 는 라오스어(lo)를 지원하지 않으므로 번역 TTS(tl=lo)를 사용.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 200자 제한에 맞춰 (가능하면 공백 기준) 분할
function chunkText(text: string, max = 190): string[] {
  const out: string[] = [];
  let s = text.replace(/\s+/g, " ").trim();
  while (s.length > max) {
    let cut = s.lastIndexOf(" ", max);
    if (cut <= 0) cut = max;
    out.push(s.slice(0, cut).trim());
    s = s.slice(cut).trim();
  }
  if (s) out.push(s);
  return out;
}

const SHORT: Record<string, string> = { ko: "ko", en: "en", th: "th", lo: "lo" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").trim();
  const rawLang = (searchParams.get("lang") ?? "").trim();
  if (!text) return new Response("bad-request", { status: 400 });

  const base = rawLang.toLowerCase().split("-")[0];
  const tl = SHORT[base] ?? base;
  const chunks = chunkText(text);

  try {
    const buffers: Buffer[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&total=${chunks.length}&idx=${i}&textlen=${c.length}&q=${encodeURIComponent(c)}`;
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept": "audio/mpeg,*/*",
        },
      });
      if (!r.ok) continue;
      const ct = r.headers.get("content-type") ?? "";
      if (!ct.includes("audio")) continue; // 에러 페이지(HTML) 방어
      buffers.push(Buffer.from(await r.arrayBuffer()));
    }
    if (!buffers.length) return new Response("tts-failed", { status: 502 });
    const mp3 = Buffer.concat(buffers);
    return new Response(mp3, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("network", { status: 502 });
  }
}
