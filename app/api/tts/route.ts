import { NextRequest } from "next/server";
import crypto from "node:crypto";
import WebSocket from "ws";

// 서버 TTS — 브라우저에 음성이 없는 언어(라오스어 등)를 위해 같은 출처로 MP3 스트리밍.
//  1순위: Microsoft Edge TTS (키 불필요, lo-LA 정식 지원, 데이터센터에서도 안정적)
//  2순위(폴백): Google 번역 TTS (gTTS 방식)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 짧은 코드 → Edge 음성/언어
const VOICE: Record<string, { voice: string; lang: string }> = {
  lo: { voice: "lo-LA-ChanthavongNeural", lang: "lo-LA" },
  ko: { voice: "ko-KR-SunHiNeural", lang: "ko-KR" },
  en: { voice: "en-US-AriaNeural", lang: "en-US" },
  th: { voice: "th-TH-PremwadeeNeural", lang: "th-TH" },
};

const TRUSTED = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED}`;
const GEC_VERSION = "1-130.0.2849.68";

// Microsoft 요구 토큰 (edge-tts 알고리즘과 동일하게 float 연산으로 계산)
function secMsGec(): string {
  let ticks = Math.floor(Date.now() / 1000) + 11644473600;
  ticks -= ticks % 300; // 5분 단위로 내림
  const val = ticks * 1e7; // 100ns 단위 (double 연산 — edge-tts와 동일)
  return crypto.createHash("sha256").update(`${val.toFixed(0)}${TRUSTED}`, "ascii").digest("hex").toUpperCase();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function edgeTTS(text: string, voice: string, xmlLang: string, timeoutMs = 12000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const uuid = () => crypto.randomUUID().replace(/-/g, "");
    const url = `${WSS}&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=${GEC_VERSION}&ConnectionId=${uuid()}`;
    const ws = new WebSocket(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const chunks: Buffer[] = [];
    let settled = false;
    const finish = (fn: () => void) => { if (settled) return; settled = true; clearTimeout(timer); try { ws.close(); } catch { /* */ } fn(); };
    const timer = setTimeout(() => finish(() => reject(new Error("edge-timeout"))), timeoutMs);

    ws.on("open", () => {
      const now = new Date().toString();
      ws.send(`X-Timestamp:${now}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${xmlLang}'><voice name='${voice}'><prosody rate='-5%'>${escapeXml(text)}</prosody></voice></speak>`;
      ws.send(`X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${now}\r\nPath:ssml\r\n\r\n${ssml}`);
    });
    ws.on("message", (data: WebSocket.RawData, isBinary: boolean) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
      if (isBinary) {
        const headerLen = buf.readUInt16BE(0);
        const header = buf.subarray(2, 2 + headerLen).toString();
        if (header.includes("Path:audio")) chunks.push(buf.subarray(2 + headerLen));
      } else if (buf.toString().includes("Path:turn.end")) {
        finish(() => (chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error("edge-empty"))));
      }
    });
    ws.on("error", (e) => finish(() => reject(e)));
    ws.on("close", () => finish(() => (chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error("edge-closed")))));
  });
}

// ── 폴백: Google 번역 TTS ──────────────────────────────────────────
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
async function googleTTS(text: string, tl: string): Promise<Buffer | null> {
  const chunks = chunkText(text);
  const buffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&total=${chunks.length}&idx=${i}&textlen=${c.length}&q=${encodeURIComponent(c)}`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "audio/mpeg,*/*" } });
    if (!r.ok || !(r.headers.get("content-type") ?? "").includes("audio")) continue;
    buffers.push(Buffer.from(await r.arrayBuffer()));
  }
  return buffers.length ? Buffer.concat(buffers) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").trim().slice(0, 1200);
  const base = (searchParams.get("lang") ?? "").trim().toLowerCase().split("-")[0];
  if (!text) return new Response("bad-request", { status: 400 });

  const ok = (mp3: Buffer) =>
    new Response(new Uint8Array(mp3), { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });

  // 1) Edge TTS
  const v = VOICE[base];
  if (v) {
    try {
      const mp3 = await edgeTTS(text, v.voice, v.lang);
      if (mp3.length) return ok(mp3);
    } catch { /* 폴백으로 진행 */ }
  }
  // 2) Google 번역 TTS 폴백
  try {
    const mp3 = await googleTTS(text, base || "en");
    if (mp3) return ok(mp3);
  } catch { /* */ }

  return new Response("tts-failed", { status: 502 });
}
