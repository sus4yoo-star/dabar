"use client";

// 🎤 실시간 양방향 통역 — /share 전체(도구 진행 중 포함)에 떠 있는 플로팅 버튼.
// 좌/우 2분할: 왼쪽=내 언어, 오른쪽=상대 언어.
//  - 각자 자기 칸에 말하거나(안드로이드 마이크) 입력하면(아이폰 키보드)
//    반대쪽 칸에 상대 언어로 자동 번역돼 떠서 서로 원문·번역을 모두 확인.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { speak } from "@/lib/besora/speak";

const LOCALE: Record<string, string> = {
  ko: "ko-KR", en: "en-US", es: "es-ES", zh: "zh-CN",
  fr: "fr-FR", hi: "hi-IN", pt: "pt-BR", ar: "ar-SA", th: "th-TH",
};

export default function VoiceTranslator() {
  const { myLang, seekerLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState<null | string>(null); // 듣는 중인 언어코드
  const [leftText, setLeftText] = useState("");   // 내 언어 칸
  const [rightText, setRightText] = useState(""); // 상대 언어 칸
  const [busy, setBusy] = useState<"" | "L" | "R">(""); // 번역 중인 도착 칸
  const [err, setErr] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  const leftTimer = useRef<any>(null);
  const rightTimer = useRef<any>(null);
  useEffect(() => setMounted(true), []);

  const seeker = seekerLang || "en";
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;

  const SR = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;
  // iOS 사파리는 웹 실시간 음성인식 미지원 → 키보드 받아쓰기로 입력
  const isIOS = typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.userAgent) ||
     (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));
  const useMic = !!SR && !isIOS;

  async function callApi(q: string, target: string, source: string) {
    const r = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, source, target }),
    });
    return { ok: r.ok, d: await r.json() };
  }

  // q(source 언어) → 반대 칸(dest)에 target 언어로 번역·재생
  async function translateInto(q: string, source: string, target: string, dest: "L" | "R") {
    if (!q.trim()) return;
    setBusy(dest); setErr("");
    try {
      const { ok, d } = await callApi(q, target, source);
      if (!ok || !d.text) {
        setErr(d.error === "no-key"
          ? "번역 키가 아직 설정되지 않았어요 (GOOGLE_TRANSLATE_API_KEY)"
          : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } else {
        if (dest === "R") setRightText(d.text); else setLeftText(d.text);
        speak(d.text, target);
      }
    } catch { setErr("네트워크 오류예요."); }
    setBusy("");
  }

  // 타이핑(디바운스) — 내가 친 칸의 언어를 반대 칸으로 자동 번역
  function onLeftType(v: string) {
    setLeftText(v);
    clearTimeout(leftTimer.current);
    if (!v.trim()) { setRightText(""); return; }
    leftTimer.current = setTimeout(() => translateInto(v, myLang, seeker, "R"), 700);
  }
  function onRightType(v: string) {
    setRightText(v);
    clearTimeout(rightTimer.current);
    if (!v.trim()) { setLeftText(""); return; }
    rightTimer.current = setTimeout(() => translateInto(v, seeker, myLang, "L"), 700);
  }

  function stopRec() { try { recRef.current?.stop(); } catch { /* ignore */ } }

  // 안드로이드: 해당 칸 언어로 받아쓰기 → 끝나면 반대 칸으로 번역
  function micFor(lang: string) {
    if (listening) { stopRec(); return; }
    if (!SR) return;
    const isLeft = lang === myLang;
    setErr(""); finalRef.current = "";
    if (isLeft) setLeftText(""); else setRightText("");
    const rec = new SR();
    recRef.current = rec;
    rec.lang = LOCALE[lang] ?? lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let interim = "", fin = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t; else interim += t;
      }
      const txt = fin || interim;
      finalRef.current = txt;
      if (isLeft) setLeftText(txt); else setRightText(txt);
    };
    rec.onend = () => {
      setListening(null);
      const txt = finalRef.current.trim();
      if (txt) translateInto(txt, lang, isLeft ? seeker : myLang, isLeft ? "R" : "L");
    };
    rec.onerror = () => { setListening(null); setErr("음성을 인식하지 못했어요. 다시 시도해 주세요."); };
    setListening(lang);
    try { rec.start(); } catch { setListening(null); }
  }

  function close() { if (listening) stopRec(); setOpen(false); }

  // 한 칸(패널) — 언어 라벨 + (마이크/듣기) + 입력·번역 텍스트
  const pane = (code: string, value: string, onType: (v: string) => void,
                side: "L" | "R", accent: string, bg: string, border: string) => {
    const on = listening === code;
    return (
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nameOf(code)}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {busy === side && <span style={{ fontSize: 11, color: theme.textFaint }}>…</span>}
            <button onClick={() => value.trim() && speak(value, code)} aria-label="듣기"
              style={{ fontSize: 15, color: accent, background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>▶</button>
            {useMic && (
              <button onClick={() => micFor(code)} aria-label="말하기"
                style={{ fontSize: 15, color: on ? "#fff" : accent, background: on ? "#e25555" : "transparent", border: "none", borderRadius: 999, width: 26, height: 26, cursor: "pointer", display: "grid", placeItems: "center", lineHeight: 1 }}>
                {on ? "■" : "🎤"}
              </button>
            )}
          </div>
        </div>
        <textarea value={value} onChange={(e) => onType(e.target.value)} rows={4}
          placeholder={useMic ? `${nameOf(code)} · 🎤` : nameOf(code)}
          style={{ width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${border}`, background: bg, padding: "9px 10px", fontSize: 15, color: theme.text, outline: "none", boxSizing: "border-box", minHeight: 88, lineHeight: 1.5 }} />
      </div>
    );
  };

  return (
    <>
      {/* 플로팅 마이크 버튼 — 통역 패널이 열려 있지 않을 때만 */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={ui(myLang, "voice")}
          style={{ position: "fixed", right: 16, bottom: 22, zIndex: 55, width: 62, height: 62, borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#3CAFFF,#92D700)", color: "#fff", fontSize: 27, boxShadow: "0 10px 28px rgba(23,50,73,0.35)", display: "grid", placeItems: "center" }}>
          🎤
        </button>
      )}

      {open && mounted && createPortal(
        // 배경 오버레이 없음 → 위의 전도 내용이 가려지지 않음
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, border: `1px solid ${theme.cardBorder}`, borderBottom: "none", background: "#ffffff", padding: "10px 16px 16px", boxShadow: "0 -12px 36px rgba(23,50,73,0.20)", maxHeight: "56dvh", overflowY: "auto" }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, color: theme.text, margin: 0 }}>🎤 {ui(myLang, "voice")}</h2>
              <button onClick={close} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: "pointer" }}>닫기 ✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              {pane(myLang, leftText, onLeftType, "L", theme.primarySoft, theme.primaryBg, theme.cardBorder)}
              {seeker !== myLang && pane(seeker, rightText, onRightType, "R", theme.gold, theme.goldLight, theme.goldBorder)}
            </div>

            <p style={{ marginTop: 8, fontSize: 12, color: listening ? "#e25555" : theme.textMuted, fontWeight: listening ? 700 : 500, textAlign: "center" }}>
              {listening ? ui(myLang, "listening") : ui(myLang, "twoPaneHint")}
            </p>
            {err && <p style={{ fontSize: 12.5, color: theme.wrong, margin: "6px 0 0", textAlign: "center" }}>{err}</p>}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
