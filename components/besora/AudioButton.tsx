"use client";

import { useEffect, useRef, useState } from "react";
import { gttsUrls } from "@/lib/besora/speak";

// 짧은 언어코드 → BCP-47 로케일. 음성합성이 맞는 발음/목소리를 고르도록 돕는다.
const LOCALE: Record<string, string> = {
  ko: "ko-KR", en: "en-US", es: "es-ES", zh: "zh-CN",
  fr: "fr-FR", hi: "hi-IN", pt: "pt-BR", ar: "ar-SA", th: "th-TH", lo: "lo-LA",
};

export default function AudioButton({
  text, lang, audioUrl, label,
}: {
  text: string; lang: string; audioUrl?: string | null; label: string;
}) {
  const [playing, setPlaying] = useState(false); // 발화/재생이 진행 중(일시정지 포함)
  const [paused, setPaused] = useState(false);    // 일시정지 상태
  const uRef = useRef<SpeechSynthesisUtterance | null>(null); // GC 방지(일부 브라우저)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modeRef = useRef<"synth" | "audio">("synth"); // 현재 재생 방식

  useEffect(() => {
    // 음성 목록을 미리 깨워둔다(첫 호출에서 비어있는 브라우저 대응)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
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

  // 들려주기 토글: 재생 중이면 일시정지 / 일시정지 중이면 재개 / 아니면 처음부터 재생
  function toggle() {
    if (typeof window === "undefined") return;

    // 1) 미리 녹음된 오디오 파일
    if (audioUrl) {
      const a = audioRef.current;
      if (playing && a) {
        if (paused) { a.play().catch(() => {}); setPaused(false); }
        else { a.pause(); setPaused(true); }
        return;
      }
      const el = new Audio(audioUrl);
      audioRef.current = el;
      el.onended = () => { setPlaying(false); setPaused(false); };
      el.onpause = () => { /* 사용자가 명시적으로 멈춘 경우만 위에서 처리 */ };
      el.play().then(() => { setPlaying(true); setPaused(false); }).catch(() => setPlaying(false));
      return;
    }

    // 2) 음성합성(TTS) — 로컬 음성이 없으면 서버 TTS(MP3)로 폴백 (예: 라오스어)
    const synth = window.speechSynthesis;
    const locale = LOCALE[lang] ?? lang;
    if (!text) return;

    // 재생 중 → 일시정지/재개 (모드별)
    if (playing) {
      if (modeRef.current === "audio") {
        const a = audioRef.current;
        if (a) { if (paused) { a.play().catch(() => {}); setPaused(false); } else { a.pause(); setPaused(true); } }
      } else if (synth) {
        if (paused) { try { synth.resume(); } catch { /* ignore */ } setPaused(false); }
        else { try { synth.pause(); } catch { /* ignore */ } setPaused(true); }
      }
      return;
    }

    // Google 번역 TTS 로 순차 재생 (라오스어 등 로컬 음성 없음)
    const playServer = () => {
      modeRef.current = "audio";
      const urls = gttsUrls(text, locale);
      if (!urls.length) return;
      const el = audioRef.current ?? new Audio();
      audioRef.current = el;
      setPlaying(true); setPaused(false);
      let i = 0;
      const playNext = () => {
        if (i >= urls.length) { el.onended = null; setPlaying(false); setPaused(false); return; }
        el.src = urls[i++];
        el.play().catch(() => setPlaying(false));
      };
      el.onended = playNext;
      playNext();
    };

    const fireSynth = () => {
      modeRef.current = "synth";
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale;
      const v = pickVoice(locale);
      u.voice = v ?? null;
      u.rate = 0.95;
      u.onstart = () => { setPlaying(true); setPaused(false); };
      u.onend = () => { setPlaying(false); setPaused(false); };
      u.onerror = () => { setPlaying(false); setPaused(false); };
      uRef.current = u; // 참조 유지(Chrome GC 버그)
      setTimeout(() => {
        synth.speak(u);
        setTimeout(() => { try { synth.resume(); } catch { /* ignore */ } }, 200);
      }, 60);
    };

    if (!synth) { playServer(); return; }

    const decide = () => {
      const t = locale.toLowerCase();
      const base = t.split("-")[0];
      const has = synth.getVoices().some((v) => v.lang.toLowerCase() === t || v.lang.toLowerCase().startsWith(base));
      if (has) fireSynth(); else playServer();
    };

    if (!synth.getVoices().length) {
      let done = false;
      const go = () => { if (done) return; done = true; decide(); };
      synth.onvoiceschanged = () => { synth.getVoices(); go(); };
      setTimeout(go, 350);
    } else {
      decide();
    }
  }

  const showPause = playing && !paused; // 재생 중(일시정지 아님) → ‖, 그 외 → ▶
  return (
    <button
      onClick={toggle}
      aria-pressed={showPause}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", fontSize: 14, fontWeight: 700,
        borderRadius: 999, cursor: "pointer",
        color: "#173249", background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(23,50,73,0.25)",
      }}
    >
      <span>{showPause ? "‖" : "▶"}</span>
      {label}
    </button>
  );
}
