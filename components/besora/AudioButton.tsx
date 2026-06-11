"use client";

import { useEffect, useRef, useState } from "react";
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
  const uRef = useRef<SpeechSynthesisUtterance | null>(null); // GC 방지(일부 브라우저)

  useEffect(() => {
    // 음성 목록을 미리 깨워둔다(첫 호출에서 비어있는 브라우저 대응)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
    const vs = window.speechSynthesis.getVoices();
    if (!vs.length) return undefined;
    const target = locale.toLowerCase();
    const base = target.split("-")[0];
    return (
      vs.find((v) => v.lang.toLowerCase() === target) ||
      vs.find((v) => v.lang.toLowerCase().startsWith(base)) ||
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
    const locale = LOCALE[lang] ?? lang;

    const fire = () => {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale;
      const v = pickVoice(locale);
      if (v) u.voice = v;
      u.rate = 0.95;
      u.onstart = () => setPlaying(true);
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      uRef.current = u; // 참조 유지(Chrome GC 버그)
      // cancel 직후 곧장 speak 하면 무음인 안드로이드 대응 → 살짝 지연
      setTimeout(() => {
        synth.speak(u);
        // 일부 안드로이드 Chrome 은 바로 일시정지됨 → resume 로 깨움
        setTimeout(() => { try { synth.resume(); } catch { /* ignore */ } }, 200);
      }, 60);
    };

    // 음성이 아직 로드 안 된 경우 한 번 기다렸다 발화
    if (!synth.getVoices().length) {
      let done = false;
      const go = () => { if (done) return; done = true; fire(); };
      synth.onvoiceschanged = () => { synth.getVoices(); go(); };
      setTimeout(go, 350); // onvoiceschanged 가 안 오는 브라우저 대비
    } else {
      fire();
    }
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
