import { NextRequest } from "next/server";
import crypto from "node:crypto";
import WebSocket from "ws";
import { limitByIp } from "@/lib/rateLimit";

// 서버 TTS — 브라우저에 음성이 없는 언어(라오스어 등)를 위해 같은 출처로 MP3 스트리밍.
//  1순위: Microsoft Edge TTS (키 불필요, lo-LA 정식 지원, 데이터센터에서도 안정적)
//  2순위(폴백): Google 번역 TTS (gTTS 방식)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 짧은 코드 → Edge 음성/언어
const VOICE: Record<string, { voice: string; lang: string }> = {
  lo: { voice: "lo-LA-KeomanyNeural", lang: "lo-LA" },
  ko: { voice: "ko-KR-SunHiNeural", lang: "ko-KR" },
  en: { voice: "en-US-AriaNeural", lang: "en-US" },
  th: { voice: "th-TH-PremwadeeNeural", lang: "th-TH" },
  es: { voice: "es-ES-ElviraNeural", lang: "es-ES" },
  pt: { voice: "pt-BR-FranciscaNeural", lang: "pt-BR" },
  zh: { voice: "zh-CN-XiaoxiaoNeural", lang: "zh-CN" },
  hi: { voice: "hi-IN-SwaraNeural", lang: "hi-IN" },
  ar: { voice: "ar-SA-ZariyahNeural", lang: "ar-SA" },
  fa: { voice: "fa-IR-DilaraNeural", lang: "fa-IR" },
  ms: { voice: "ms-MY-YasminNeural", lang: "ms-MY" },
  vi: { voice: "vi-VN-HoaiMyNeural", lang: "vi-VN" },
  id: { voice: "id-ID-GadisNeural", lang: "id-ID" },
  bn: { voice: "bn-IN-TanishaaNeural", lang: "bn-IN" },
  ja: { voice: "ja-JP-NanamiNeural", lang: "ja-JP" },
  ur: { voice: "ur-PK-UzmaNeural", lang: "ur-PK" },
  fr: { voice: "fr-FR-DeniseNeural", lang: "fr-FR" },
  ru: { voice: "ru-RU-SvetlanaNeural", lang: "ru-RU" },
  sw: { voice: "sw-KE-ZuriNeural", lang: "sw-KE" },
  // ※ 미얀마어(my)는 Azure TTS 미지원 — 기기 음성 없으면 무음일 수 있음
};

const TRUSTED = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED}`;
const GEC_VERSION = "1-130.0.2849.68";

// Microsoft 요구 토큰 (edge-tts 알고리즘). 값이 1e17 규모라 BigInt 로 정확히 계산해야 함.
function secMsGec(): string {
  // ticks = (현재시각 ms → 100ns 단위) + (Windows epoch 보정), 5분(3e9 ticks) 단위로 내림
  let ticks = BigInt(Date.now()) * 10000n + 11644473600n * 10000000n;
  ticks -= ticks % 3000000000n;
  return crypto.createHash("sha256").update(`${ticks.toString()}${TRUSTED}`, "ascii").digest("hex").toUpperCase();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ── 1순위: Microsoft Azure Speech (키 방식 — 라오스어 lo-LA 정식 지원, 서버 IP 차단/403 없음) ──
async function azureTTS(text: string, voice: string, xmlLang: string): Promise<Buffer | null> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${xmlLang}'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "dabar",
    },
    body: ssml,
  });
  if (!r.ok) throw new Error(`azure-${r.status}`);
  return Buffer.from(await r.arrayBuffer());
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
  const rl = limitByIp(req, "tts", 80, 60_000);
  if (!rl.ok) return new Response("rate-limited", { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").trim().slice(0, 1200);
  const base = (searchParams.get("lang") ?? "").trim().toLowerCase().split("-")[0];
  if (!text) return new Response("bad-request", { status: 400 });

  const ok = (mp3: Buffer) =>
    new Response(new Uint8Array(mp3), { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });

  let reason = "";
  const v = VOICE[base];
  // 1) Azure Speech (키가 있으면 — 가장 확실)
  if (v) {
    try {
      const mp3 = await azureTTS(text, v.voice, v.lang);
      if (mp3 && mp3.length) return ok(mp3);
    } catch (e) { reason = "azure:" + (e instanceof Error ? e.message : "err"); }
  }
  // 2) Edge TTS (키 없을 때 시도 — 다만 MS DRM 으로 403 날 수 있음)
  if (v) {
    try {
      const mp3 = await edgeTTS(text, v.voice, v.lang);
      if (mp3.length) return ok(mp3);
      reason += " edge-empty";
    } catch (e) { reason += " edge:" + (e instanceof Error ? e.message : "err"); }
  }
  // 2) Google 번역 TTS 폴백
  try {
    const mp3 = await googleTTS(text, base || "en");
    if (mp3) return ok(mp3);
    reason += " google-empty";
  } catch (e) { reason += " google:" + (e instanceof Error ? e.message : "err"); }

  return new Response(`tts-failed ${reason}`.trim(), { status: 502 });
}
