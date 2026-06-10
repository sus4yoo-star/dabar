"use client";

// 🎤 실시간 음성 통역 — /share 전체(도구 진행 중 포함)에 떠 있는 플로팅 버튼.
// 말하면(Web Speech API) → 번역(/api/translate) → 상대 언어로 읽어줌(TTS).
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
  const [dir, setDir] = useState<"out" | "in">("out"); // out: 나→상대, in: 상대→나
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [typed, setTyped] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  useEffect(() => setMounted(true), []);

  const seeker = seekerLang || "en";
  const from = dir === "out" ? myLang : seeker;
  const to = dir === "out" ? seeker : myLang;
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;

  const SR = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  async function translate(q: string) {
    if (!q.trim()) return;
    setBusy(true); setErr(""); setOut("");
    try {
      const r = await fetch("/api/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: from, target: to }),
      });
      const d = await r.json();
      if (!r.ok || !d.text) {
        setErr(d.error === "no-key" ? "번역 키가 아직 설정되지 않았어요 (GOOGLE_TRANSLATE_API_KEY)" : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } else { setOut(d.text); speak(d.text, to); }
    } catch { setErr("네트워크 오류예요."); }
    setBusy(false);
  }

  function stopRec() { try { recRef.current?.stop(); } catch { /* ignore */ } }

  function toggleMic() {
    if (listening) { stopRec(); return; }
    if (!SR) return;
    setHeard(""); setOut(""); setErr(""); finalRef.current = "";
    const rec = new SR();
    recRef.current = rec;
    rec.lang = LOCALE[from] ?? from;
    rec.interimResults = true;   // 말하는 동안 실시간으로 자막 표시
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
    rec.onend = () => { setListening(false); if (finalRef.current.trim()) translate(finalRef.current); };
    rec.onerror = () => { setListening(false); setErr("음성을 인식하지 못했어요. 다시 시도해 주세요."); };
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  }

  function pickDir(d: "out" | "in") {
    if (listening) stopRec();
    setDir(d); setHeard(""); setOut(""); setErr("");
  }
  function close() { if (listening) stopRec(); setOpen(false); }

  const dirBtn = (d: "out" | "in", label: string, color: string, bgOn: string, border: string) => {
    const on = dir === d;
    return (
      <button onClick={() => pickDir(d)}
        style={{ flex: 1, borderRadius: 14, padding: "10px 8px", fontSize: 13.5, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? border : theme.cardBorder}`, background: on ? bgOn : theme.card, color: on ? color : theme.textMuted }}>
        {label}
      </button>
    );
  };

  return (
    <>
      {/* 플로팅 마이크 버튼 — 통역 패널이 열려 있지 않을 때만 (열리면 패널이 대신 표시) */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={ui(myLang, "voice")}
          style={{ position: "fixed", right: 16, bottom: 22, zIndex: 55, width: 62, height: 62, borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#3CAFFF,#92D700)", color: "#fff", fontSize: 27, boxShadow: "0 10px 28px rgba(23,50,73,0.35)", display: "grid", placeItems: "center" }}>
          🎤
        </button>
      )}

      {open && mounted && createPortal(
        // 배경 오버레이 없음 → 위의 전도 내용이 가려지지 않음. 하단에 작은 패널로만 표시.
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, border: `1px solid ${theme.cardBorder}`, borderBottom: "none", background: "#ffffff", padding: "12px 16px 22px", boxShadow: "0 -12px 36px rgba(23,50,73,0.20)", maxHeight: "62dvh", overflowY: "auto" }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, color: theme.text, margin: 0 }}>🎤 {ui(myLang, "voice")}</h2>
              <button onClick={close} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: "pointer" }}>닫기 ✕</button>
            </div>

            {/* 방향 선택: 파랑=내가 말함, 초록=상대가 말함 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {dirBtn("out", `${nameOf(myLang)} → ${nameOf(seeker)}`, theme.primarySoft, theme.primaryBg, theme.primary)}
              {dirBtn("in", `${nameOf(seeker)} → ${nameOf(myLang)}`, theme.gold, theme.goldLight, theme.goldSoft)}
            </div>

            {SR ? (
              <div style={{ textAlign: "center" }}>
                <button onClick={toggleMic}
                  style={{ width: 84, height: 84, borderRadius: 999, border: "none", cursor: "pointer", fontSize: 36, color: "#fff", background: listening ? "#e25555" : theme.primary, boxShadow: listening ? "0 0 0 10px rgba(226,85,85,0.15)" : "0 8px 22px rgba(31,155,239,0.35)", transition: "background .2s" }}>
                  {listening ? "■" : "🎤"}
                </button>
                <p style={{ marginTop: 10, fontSize: 13, color: listening ? "#e25555" : theme.textMuted, fontWeight: listening ? 700 : 500 }}>
                  {listening ? ui(myLang, "listening") : ui(myLang, "tapToTalk")}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 8px" }}>이 브라우저는 음성 인식을 지원하지 않아요 — 입력으로 번역해 드릴게요.</p>
                <textarea value={typed} onChange={(e) => setTyped(e.target.value)} rows={2} placeholder={`${nameOf(from)}로 입력`}
                  style={{ width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: "#f2f7fb", padding: "8px 12px", fontSize: 14, color: theme.text, outline: "none", boxSizing: "border-box" }} />
                <button onClick={() => translate(typed)} disabled={busy || !typed.trim()}
                  style={{ marginTop: 8, width: "100%", borderRadius: 999, background: theme.primary, padding: "10px 0", fontSize: 14, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer", opacity: busy || !typed.trim() ? 0.4 : 1 }}>
                  {busy ? "번역 중…" : `${nameOf(to)}로 번역·들려주기`}
                </button>
              </div>
            )}

            {(heard || busy || out || err) && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {heard && (
                  <div style={{ borderRadius: 12, background: "#f2f7fb", border: `1px solid ${theme.cardBorder}`, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: theme.textFaint, margin: "0 0 3px" }}>{nameOf(from)}</p>
                    <p style={{ fontSize: 15, color: theme.text, margin: 0, lineHeight: 1.5 }}>{heard}</p>
                  </div>
                )}
                {busy && <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, textAlign: "center" }}>번역 중…</p>}
                {out && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, padding: "10px 12px" }}>
                    <div>
                      <p style={{ fontSize: 11, color: theme.goldSoft, margin: "0 0 3px", fontWeight: 700 }}>{nameOf(to)}</p>
                      <p style={{ fontSize: 17, color: theme.text, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>{out}</p>
                    </div>
                    <button onClick={() => speak(out, to)} aria-label="다시 듣기" style={{ flexShrink: 0, fontSize: 18, color: theme.gold, background: "none", border: "none", cursor: "pointer" }}>▶</button>
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
