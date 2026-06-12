// 브라우저 음성합성으로 텍스트를 해당 언어로 읽어준다.
// 언어에 맞는 voice 를 골라 지정 + 안드로이드 Chrome 무음/GC 버그 우회.

const LOCALE: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
  fr: "fr-FR",
  hi: "hi-IN",
  pt: "pt-BR",
  ar: "ar-SA",
  th: "th-TH",
  lo: "lo-LA",
};

// 발화 객체가 GC 되어 무음이 되는 버그 방지용 참조 유지
let _keep: SpeechSynthesisUtterance | null = null;
// 폴백 TTS 재생용 오디오 (재사용 — iOS 제스처 정책 대응)
let _audio: HTMLAudioElement | null = null;

// 브라우저에 음성이 없는 언어 → 서버가 아니라 "브라우저에서 직접" Google 번역 TTS 재생.
// (호스팅 서버 IP 는 Google/Edge TTS 가 차단하지만, 사용자 브라우저의 실제 IP 는 접근 가능)
const NO_LOCAL_VOICE = new Set(["lo"]);

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

// 서버 프록시 TTS(같은 출처) — Azure Speech 등으로 합성된 MP3 스트리밍.
export function ttsUrl(text: string, locale: string): string {
  return `/api/tts?lang=${encodeURIComponent(locale)}&text=${encodeURIComponent(text.slice(0, 900))}`;
}

// 라오스어 등 서버 TTS 가 필요한 언어인지
export function needsServerTTS(lang: string): boolean {
  const base = (LOCALE[lang] ?? lang).toLowerCase().split("-")[0];
  return NO_LOCAL_VOICE.has(base);
}

// 합성된 음성을 브라우저에 캐시 (같은 글은 즉시 재생) — key: "locale|text"
const _ttsCache = new Map<string, string>();
const ttsKey = (text: string, locale: string) => `${locale}|${text.slice(0, 900)}`;

// 서버에서 음성을 받아 Blob URL 로 캐시 (재생은 안 함) — 미리 받아두면 ▶ 즉시 재생
export async function fetchTTS(text: string, locale: string): Promise<string | null> {
  if (typeof window === "undefined" || !text) return null;
  const key = ttsKey(text, locale);
  const hit = _ttsCache.get(key);
  if (hit) return hit;
  try {
    const res = await fetch(ttsUrl(text, locale));
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    const url = URL.createObjectURL(blob);
    _ttsCache.set(key, url);
    return url;
  } catch { return null; }
}

// 단계가 보이면 미리 음성을 받아둠 (재생 X)
export function prefetchTTS(text: string, locale: string) {
  if (typeof window === "undefined" || !text) return;
  if (_ttsCache.has(ttsKey(text, locale))) return;
  fetchTTS(text, locale);
}

// 동기 캐시 조회 (있으면 제스처 내 즉시 재생 가능)
export function getCachedTTS(text: string, locale: string): string | null {
  return _ttsCache.get(ttsKey(text, locale)) ?? null;
}

// Google 번역 TTS(gTTS 방식) URL — 브라우저 <audio> 로 직접 재생 (서버 실패 시 폴백)
export function gttsUrls(text: string, locale: string): string[] {
  const tl = locale.toLowerCase().split("-")[0];
  const chunks = chunkText(text);
  return chunks.map((c, i) =>
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&total=${chunks.length}&idx=${i}&textlen=${c.length}&q=${encodeURIComponent(c)}`
  );
}

// 라오스어 등: (1) 캐시 있으면 즉시 재생 (2) 서버 /api/tts(Azure) (3) 실패 시 브라우저 Google 폴백
export function fallbackSpeak(text: string, locale: string) {
  if (typeof window === "undefined" || !text) return;
  if (!_audio) _audio = new Audio();
  const a = _audio;
  a.pause();
  a.onended = null;

  let usedFallback = false;
  const playClient = () => {
    if (usedFallback) return;
    usedFallback = true;
    const urls = gttsUrls(text, locale);
    let i = 0;
    const next = () => { if (i >= urls.length) { a.onended = null; return; } a.src = urls[i++]; a.play().catch(() => {}); };
    a.onended = next;
    next();
  };

  // 1) 캐시된 음성 → 즉시 재생 (제스처 유지)
  const cached = _ttsCache.get(ttsKey(text, locale));
  if (cached) { a.src = cached; a.play().catch(() => playClient()); return; }

  // 2) 캐시 없으면 서버에서 받아 재생하고 캐시에 저장, 실패하면 Google 폴백
  fetchTTS(text, locale).then((url) => {
    if (url) { a.src = url; a.play().catch(() => playClient()); }
    else playClient();
  });
}

// 현재 기기에 target/base 로케일 음성이 있는지
function hasLocalVoice(synth: SpeechSynthesis, target: string, base: string) {
  const vs = synth.getVoices();
  if (!vs.length) return null; // 아직 미로딩
  return vs.some((v) => v.lang.toLowerCase() === target || v.lang.toLowerCase().startsWith(base));
}

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !text) return;
  const locale = LOCALE[lang] ?? lang;
  const target = locale.toLowerCase();
  const base = target.split("-")[0];

  // 라오스어 등은 브라우저에 음성이 없으니 바로 Google TTS (제스처 유지 — iOS 대응)
  if (NO_LOCAL_VOICE.has(base)) { fallbackSpeak(text, locale); return; }

  const synth = window.speechSynthesis;
  if (!synth) { fallbackSpeak(text, locale); return; }

  const fire = () => {
    const has = hasLocalVoice(synth, target, base);
    if (has === false) { fallbackSpeak(text, locale); return; } // 로컬 음성 없음 → Google TTS
    synth.cancel();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === target) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base));
    if (!voice) { fallbackSpeak(text, locale); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    u.voice = voice;
    u.rate = 0.95;
    _keep = u;
    setTimeout(() => {
      synth.speak(u);
      setTimeout(() => { try { synth.resume(); } catch { /* ignore */ } }, 200);
    }, 60);
  };

  if (!synth.getVoices().length) {
    let done = false;
    const go = () => { if (done) return; done = true; fire(); };
    synth.onvoiceschanged = () => { synth.getVoices(); go(); };
    setTimeout(go, 350);
  } else {
    fire();
  }
}
