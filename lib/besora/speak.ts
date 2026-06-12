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

// 서버 프록시 TTS URL — 같은 출처라 referer/CORS/iOS 제스처 문제 없음.
// 라오스어 등 브라우저에 음성이 없는 언어는 서버가 Google 번역 TTS 를 받아 MP3 로 스트리밍.
export function ttsUrl(text: string, locale: string): string {
  return `/api/tts?lang=${encodeURIComponent(locale)}&text=${encodeURIComponent(text.slice(0, 900))}`;
}

// 브라우저에 해당 언어 음성이 없을 때(예: 라오스어) 서버 TTS 로 재생
export function fallbackSpeak(text: string, locale: string) {
  if (typeof window === "undefined" || !text) return;
  if (!_audio) _audio = new Audio();
  const a = _audio;
  a.pause();
  a.onended = null;
  a.src = ttsUrl(text, locale);
  a.play().catch(() => {});
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
  const synth = window.speechSynthesis;

  // 음성합성 자체가 없으면 바로 서버 TTS
  if (!synth) { fallbackSpeak(text, locale); return; }

  const fire = () => {
    const has = hasLocalVoice(synth, target, base);
    if (has === false) { fallbackSpeak(text, locale); return; } // 로컬 음성 없음 → 서버 TTS
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
