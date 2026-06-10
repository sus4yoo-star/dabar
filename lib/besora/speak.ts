// 브라우저 음성합성으로 텍스트를 해당 언어로 읽어준다.
// 언어에 맞는 voice 를 골라 지정 (한국어 음성이 외국어를 읽는 문제 방지).

const LOCALE: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
  fr: "fr-FR",
  hi: "hi-IN",
  pt: "pt-BR",
  ar: "ar-SA",
};

export function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const locale = LOCALE[lang] ?? lang;
  const target = locale.toLowerCase();
  const base = target.split("-")[0];
  const voices = synth.getVoices();
  const voice =
    voices.find((v) => v.lang.toLowerCase() === target) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base));

  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  if (voice) u.voice = voice;
  u.rate = 0.95;
  synth.speak(u);
}
