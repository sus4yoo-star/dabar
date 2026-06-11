"use client";

// 🎤 실시간 음성 통역 — /share 전체(도구 진행 중 포함)에 떠 있는 플로팅 버튼.
// 방향 선택 없음: 입력/음성의 언어를 자동 감지해 반대 언어로 번역·재생.
//  - 안드로이드: 마이크 2개(말하는 사람 언어) → 실시간 자막 → 번역
//  - 아이폰: 입력칸 1개(키보드 받아쓰기) → 자동 감지 번역
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
  const [heard, setHeard] = useState("");
  const [out, setOut] = useState("");
  const [fromLang, setFromLang] = useState("");  // 감지/선택된 출발 언어
  const [toLang, setToLang] = useState("");      // 도착 언어 (재생용)
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [typed, setTyped] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  useEffect(() => setMounted(true), []);

  const seeker = seekerLang || "en";
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;

  const SR = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;
  // iOS 사파리는 웹 실시간 음성인식 미지원 → 키보드 받아쓰기 + 자동감지 번역으로
  const isIOS = typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.userAgent) ||
     (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));
  const useMic = !!SR && !isIOS;

  async function callApi(q: string, target: string, source?: string) {
    const r = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(source ? { q, source, target } : { q, target }),
    });
    return { ok: r.ok, d: await r.json() };
  }

  // 출발 언어를 아는 경우(안드로이드 마이크): 반대 언어로 바로 번역
  async function translateFrom(q: string, source: string) {
    if (!q.trim()) return;
    const target = source === myLang ? seeker : myLang;
    setBusy(true); setErr(""); setOut(""); setFromLang(source); setToLang(target);
    try {
      const { ok, d } = await callApi(q, target, source);
      if (!ok || !d.text) setErr(d.error === "no-key" ? "번역 키가 아직 설정되지 않았어요 (GOOGLE_TRANSLATE_API_KEY)" : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
      else { setOut(d.text); speak(d.text, target); }
    } catch { setErr("네트워크 오류예요."); }
    setBusy(false);
  }

  // 출발 언어를 모르는 경우(아이폰 입력): 자동 감지 → 반대 언어로
  async function translateAuto(q: string) {
    if (!q.trim()) return;
    setBusy(true); setErr(""); setOut("");
    try {
      // 1차: 상대 언어로 번역하며 언어 감지
      let { ok, d } = await callApi(q, seeker);
      if (!ok || !d.text) {
        setErr(d.error === "no-key" ? "번역 키가 아직 설정되지 않았어요 (GOOGLE_TRANSLATE_API_KEY)" : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
        setBusy(false); return;
      }
      let target = seeker;
      let detected: string = (d.detected || myLang).split("-")[0];
      // 상대 언어로 말한 거였다면 → 내 언어로 다시 번역
      if (detected === seeker && seeker !== myLang) {
        const second = await callApi(q, myLang, seeker);
        if (second.ok && second.d.text) { d = second.d; target = myLang; }
      }
      setHeard(q); setFromLang(detected); setToLang(target);
      setOut(d.text); speak(d.text, target);
    } catch { setErr("네트워크 오류예요."); }
    setBusy(false);
  }

  function stopRec() { try { recRef.current?.stop(); } catch { /* ignore */ } }

  // 안드로이드: 말하는 사람 언어의 마이크를 탭
  function micFor(lang: string) {
    if (listening) { stopRec(); return; }
    if (!SR) return;
    setHeard(""); setOut(""); setErr(""); finalRef.current = "";
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
      finalRef.current = fin || interim;
      setHeard(fin || interim);
    };
    rec.onend = () => { setListening(null); if (finalRef.current.trim()) translateFrom(finalRef.current, lang); };
    rec.onerror = () => { setListening(null); setErr("음성을 인식하지 못했어요. 다시 시도해 주세요."); };
    setListening(lang);
    try { rec.start(); } catch { setListening(null); }
  }

  function close() { if (listening) stopRec(); setOpen(false); }

  const micBtn = (lang: string, accent: string, bgOn: string) => {
    const on = listening === lang;
    return (
      <button onClick={() => micFor(lang)}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, padding: "14px 8px", fontSize: 15, fontWeight: 800, cursor: "pointer", border: "none", background: on ? "#e25555" : bgOn, color: on ? "#fff" : accent, boxShadow: on ? "0 0 0 6px rgba(226,85,85,0.15)" : "none", transition: "background .2s" }}>
        {on ? "■" : "🎤"} {nameOf(lang)}
      </button>
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
          <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, border: `1px solid ${theme.cardBorder}`, borderBottom: "none", background: "#ffffff", padding: "10px 16px 18px", boxShadow: "0 -12px 36px rgba(23,50,73,0.20)", maxHeight: "46dvh", overflowY: "auto" }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, color: theme.text, margin: 0 }}>🎤 {ui(myLang, "voice")}</h2>
              <button onClick={close} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: "pointer" }}>닫기 ✕</button>
            </div>

            {useMic ? (
              <>
                {/* 말하는 사람 언어의 마이크를 누르면 끝 — 방향 선택 없음 */}
                <div style={{ display: "flex", gap: 8 }}>
                  {micBtn(myLang, theme.primarySoft, theme.primaryBg)}
                  {seeker !== myLang && micBtn(seeker, theme.gold, theme.goldLight)}
                </div>
                <p style={{ marginTop: 8, fontSize: 12.5, color: listening ? "#e25555" : theme.textMuted, fontWeight: listening ? 700 : 500, textAlign: "center" }}>
                  {listening ? ui(myLang, "listening") : "말하는 사람의 언어를 탭하고 말하세요"}
                </p>
              </>
            ) : (
              <div>
                <textarea value={typed} onChange={(e) => setTyped(e.target.value)} rows={3}
                  placeholder="말하거나 입력하세요 (언어 자동 감지) — 키보드의 🎤로 받아쓰기"
                  style={{ width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: "#f2f7fb", padding: "10px 12px", fontSize: 16, color: theme.text, outline: "none", boxSizing: "border-box" }} />
                <button onClick={() => translateAuto(typed)} disabled={busy || !typed.trim()}
                  style={{ marginTop: 8, width: "100%", borderRadius: 999, background: theme.primary, padding: "12px 0", fontSize: 15, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer", opacity: busy || !typed.trim() ? 0.4 : 1 }}>
                  {busy ? "번역 중…" : "번역 · 들려주기 (자동 감지)"}
                </button>
              </div>
            )}

            {(heard || busy || out || err) && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {heard && (
                  <div style={{ borderRadius: 12, background: "#f2f7fb", border: `1px solid ${theme.cardBorder}`, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: theme.textFaint, margin: "0 0 3px" }}>{fromLang ? nameOf(fromLang) : "…"}</p>
                    <p style={{ fontSize: 15, color: theme.text, margin: 0, lineHeight: 1.5 }}>{heard}</p>
                  </div>
                )}
                {busy && <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, textAlign: "center" }}>번역 중…</p>}
                {out && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, padding: "10px 12px" }}>
                    <div>
                      <p style={{ fontSize: 11, color: theme.goldSoft, margin: "0 0 3px", fontWeight: 700 }}>{toLang ? nameOf(toLang) : ""}</p>
                      <p style={{ fontSize: 17, color: theme.text, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>{out}</p>
                    </div>
                    <button onClick={() => out && toLang && speak(out, toLang)} aria-label="다시 듣기" style={{ flexShrink: 0, fontSize: 18, color: theme.gold, background: "none", border: "none", cursor: "pointer" }}>▶</button>
                  </div>
                )}
                {err && <p style={{ fontSize: 12.5, color: theme.wrong, margin: 0 }}>{err}</p>}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
