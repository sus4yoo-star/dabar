"use client";

import { useEffect, useState } from "react";

// 짧은 언어코드 → BCP-47 로케일. 음성합성이 맞는 발음/목소리를 고르도록 돕는다.
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

export default function AudioButton({
  text,
  lang,
  audioUrl,
  label,
}: {
  text: string;
  lang: string;
  audioUrl?: string | null;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 브라우저 음성 목록은 비동기로 로드된다. 처음엔 비어 있을 수 있어 이벤트로도 받는다.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 상대 언어에 가장 잘 맞는 목소리를 고른다 (정확히 일치 → 같은 언어군 순).
  function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
    if (!voices.length) return undefined;
    const target = locale.toLowerCase();
    const base = target.split("-")[0];
    return (
      voices.find((v) => v.lang.toLowerCase() === target) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
      undefined
    );
  }

  function play() {
    if (typeof window === "undefined") return;

    if (audioUrl) {
      const a = new Audio(audioUrl);
      setPlaying(true);
      a.onended = () => setPlaying(false);
      a.play().catch(() => setPlaying(false));
      return;
    }

    // 폴백: 브라우저 음성합성으로 상대 언어 낭독 (녹음 파일 없이도 작동)
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();

    const locale = LOCALE[lang] ?? lang;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    const v = pickVoice(locale);
    if (v) u.voice = v; // 언어에 맞는 목소리를 명시 → 한국어 음성이 영어를 읽는 문제 방지
    u.rate = 0.95;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    synth.speak(u);
  }

  return (
    <button
      onClick={play}
      className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-5 py-2.5 text-sm backdrop-blur transition active:scale-95"
      aria-pressed={playing}
    >
      <span>{playing ? "‖" : "▶"}</span>
      {label}
    </button>
  );
}
