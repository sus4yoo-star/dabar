"use client";

import { useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { speak } from "@/lib/besora/speak";

function Direction({ from, to, fromName, toName }: { from: string; to: string; fromName: string; toName: string }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true); setErr(""); setOut("");
    try {
      const r = await fetch("/api/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: from, target: to }),
      });
      const d = await r.json();
      if (!r.ok || !d.text) {
        setErr(d.error === "no-key" ? "번역 키가 아직 설정되지 않았어요 (환경변수 GOOGLE_TRANSLATE_API_KEY)" : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } else { setOut(d.text); speak(d.text, to); }
    } catch { setErr("네트워크 오류예요."); }
    setBusy(false);
  }

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 12 }}>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: theme.textMuted }}>
        <span style={{ borderRadius: 999, background: "rgba(255,255,255,0.1)", padding: "2px 8px", color: theme.text }}>{fromName}</span>
        <span>→</span>
        <span style={{ borderRadius: 999, background: theme.goldLight, padding: "2px 8px", color: theme.gold }}>{toName}</span>
      </div>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={`${fromName}로 입력`}
        style={{ width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: "rgba(0,0,0,0.25)", padding: "8px 12px", fontSize: 14, color: theme.text, outline: "none", boxSizing: "border-box" }}
      />
      <button onClick={go} disabled={busy || !text.trim()} style={{ marginTop: 8, width: "100%", borderRadius: 999, background: theme.gold, padding: "8px 0", fontSize: 14, fontWeight: 700, color: "#08263a", border: "none", cursor: busy ? "default" : "pointer", opacity: busy || !text.trim() ? 0.4 : 1 }}>
        {busy ? "번역 중…" : `${toName}로 번역·들려주기`}
      </button>
      {err && <p style={{ marginTop: 8, fontSize: 12, color: theme.wrong }}>{err}</p>}
      {out && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, borderRadius: 12, background: "rgba(0,0,0,0.25)", padding: "8px 12px" }}>
          <p style={{ fontSize: 14, color: theme.text, margin: 0 }}>{out}</p>
          <button onClick={() => speak(out, to)} aria-label="다시 듣기" style={{ flexShrink: 0, color: theme.gold, background: "none", border: "none", cursor: "pointer" }}>▶</button>
        </div>
      )}
    </div>
  );
}

export default function TranslateSheet() {
  const { myLang, seekerLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;
  const seeker = seekerLang || "en";

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="음성 번역"
        style={{ display: "grid", placeItems: "center", height: 36, width: 36, borderRadius: 999, border: `1px solid ${theme.cardBorder}`, fontSize: 16, color: theme.text, background: "transparent", cursor: "pointer" }}>
        🌐
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ margin: "0 auto", width: "100%", maxWidth: 480, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: `1px solid ${theme.cardBorder}`, background: "#0a2236", padding: "16px 16px 32px" }}>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: theme.text, margin: 0 }}>음성 번역</h2>
              <button onClick={() => setOpen(false)} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: "pointer" }}>닫기 ✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Direction from={myLang} to={seeker} fromName={nameOf(myLang)} toName={nameOf(seeker)} />
              <Direction from={seeker} to={myLang} fromName={nameOf(seeker)} toName={nameOf(myLang)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
