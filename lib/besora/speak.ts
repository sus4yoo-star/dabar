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
};

// 발화 객체가 GC 되어 무음이 되는 버그 방지용 참조 유지
let _keep: SpeechSynthesisUtterance | null = null;

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const synth = window.speechSynthesis;
  const locale = LOCALE[lang] ?? lang;
  const target = locale.toLowerCase();
  const base = target.split("-")[0];

  const fire = () => {
    synth.cancel();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === target) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    if (voice) u.voice = voice;
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
