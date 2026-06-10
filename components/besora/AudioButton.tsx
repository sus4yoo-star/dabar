"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";

// 짧은 언어코드 → BCP-47 로케일. 음성합성이 맞는 발음/목소리를 고르도록 돕는다.
const LOCALE: Record<string, string> = {
  ko: "ko-KR", en: "en-US", es: "es-ES", zh: "zh-CN",
  fr: "fr-FR", hi: "hi-IN", pt: "pt-BR", ar: "ar-SA",
};

export default function AudioButton({
  text, lang, audioUrl, label,
}: {
  text: string; lang: string; audioUrl?: string | null; label: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

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
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const locale = LOCALE[lang] ?? lang;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    const v = pickVoice(locale);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    synth.speak(u);
  }

  return (
    <button
      onClick={play}
      aria-pressed={playing}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", fontSize: 14, fontWeight: 700,
        borderRadius: 999, cursor: "pointer",
        color: "#173249", background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(23,50,73,0.25)",
      }}
    >
      <span>{playing ? "‖" : "▶"}</span>
      {label}
    </button>
  );
}
