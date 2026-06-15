"use client";

// 🎤 홈 화면에 '박아두는' 인라인 음성 통역기.
// /share 의 플로팅 VoiceTranslator 와 같은 로직이지만, besora LanguageProvider 없이
// 자체 언어 선택(내 언어 / 상대 언어)을 가진 독립 컴포넌트.
import { useEffect, useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { LANG_META, SUPPORTED_LANGS, ui } from "@/lib/besora/i18n";
import { speak } from "@/lib/besora/speak";
import { startRecording, canRecord, type Recorder } from "@/lib/besora/recorder";

const LOCALE: Record<string, string> = {
  ko: "ko-KR", en: "en-US", es: "es-ES", zh: "zh-CN", fr: "fr-FR", hi: "hi-IN",
  pt: "pt-BR", ar: "ar-SA", th: "th-TH", lo: "lo-LA", fa: "fa-IR", my: "my-MM",
  ms: "ms-MY", vi: "vi-VN", id: "id-ID", bn: "bn-IN", ja: "ja-JP", ur: "ur-PK", ru: "ru-RU", sw: "sw-KE",
};
const nameOf = (c: string) => LANG_META[c]?.name_native ?? c;
const rtlOf = (c: string) => !!LANG_META[c]?.rtl;
const LANGS = SUPPORTED_LANGS.filter((c) => LANG_META[c]);

export default function HomeTranslator() {
  const { lang } = useI18n();
  const [myLang, setMyLang] = useState("ko");
  const [otherLang, setOtherLang] = useState("en");
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [listening, setListening] = useState<null | string>(null);
  const [busy, setBusy] = useState<"" | "L" | "R">("");
  const [err, setErr] = useState("");
  const recRef = useRef<any>(null);            // Web Speech 인스턴스 (브라우저 타입 없음)
  const recorderRef = useRef<Recorder | null>(null);
  const finalRef = useRef("");
  const leftTimer = useRef<any>(null);
  const rightTimer = useRef<any>(null);

  // 초기 언어: 내 언어 = 앱 언어, 상대 = 다른 언어. localStorage 복원.
  useEffect(() => {
    const m = (typeof localStorage !== "undefined" && localStorage.getItem("dabar_tr_my")) || (LANG_META[lang] ? lang : "ko");
    const o = (typeof localStorage !== "undefined" && localStorage.getItem("dabar_tr_other")) || (m === "en" ? "ko" : "en");
    setMyLang(m); setOtherLang(o === m ? (m === "en" ? "ko" : "en") : o);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pickMy = (v: string) => { setMyLang(v); try { localStorage.setItem("dabar_tr_my", v); } catch { /* */ } };
  const pickOther = (v: string) => { setOtherLang(v); try { localStorage.setItem("dabar_tr_other", v); } catch { /* */ } };

  const SR = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
  const micAvailable = !!SR || canRecord();

  async function callApi(q: string, target: string, source: string) {
    const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, source, target }) });
    return { ok: r.ok, d: await r.json() };
  }
  async function translateInto(q: string, source: string, target: string, dest: "L" | "R") {
    if (!q.trim()) return;
    setBusy(dest); setErr("");
    try {
      const { ok, d } = await callApi(q, target, source);
      if (!ok || !d.text) {
        setErr(d.error === "no-key" ? "번역 키가 설정되지 않았어요 (GOOGLE_TRANSLATE_API_KEY)" : "번역에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } else { if (dest === "R") setRightText(d.text); else setLeftText(d.text); speak(d.text, target); }
    } catch { setErr("네트워크 오류예요."); }
    setBusy("");
  }
  function onLeftType(v: string) { setLeftText(v); clearTimeout(leftTimer.current); if (!v.trim()) { setRightText(""); return; } leftTimer.current = setTimeout(() => translateInto(v, myLang, otherLang, "R"), 700); }
  function onRightType(v: string) { setRightText(v); clearTimeout(rightTimer.current); if (!v.trim()) { setLeftText(""); return; } rightTimer.current = setTimeout(() => translateInto(v, otherLang, myLang, "L"), 700); }

  function micFor(code: string) {
    if (listening) { stopMic(); return; }
    if (SR) startSR(code);
    else if (canRecord()) startRecorder(code);
    else setErr("이 브라우저에서는 음성 입력을 지원하지 않아요. 직접 입력해 주세요.");
  }
  function stopMic() { if (recRef.current) { try { recRef.current.stop(); } catch { /* */ } } else if (recorderRef.current) { finishRecorder(listening || myLang); } }

  function startSR(code: string) {
    const isLeft = code === myLang;
    setErr(""); finalRef.current = "";
    if (isLeft) setLeftText(""); else setRightText("");
    const rec = new SR(); recRef.current = rec;
    rec.lang = LOCALE[code] ?? code; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e: any) => {
      let interim = "", fin = "";
      for (let i = 0; i < e.results.length; i++) { const tx = e.results[i][0].transcript; if (e.results[i].isFinal) fin += tx; else interim += tx; }
      const txt = fin || interim; finalRef.current = txt; if (isLeft) setLeftText(txt); else setRightText(txt);
    };
    rec.onend = () => { recRef.current = null; setListening(null); const txt = finalRef.current.trim(); if (txt) translateInto(txt, code, isLeft ? otherLang : myLang, isLeft ? "R" : "L"); };
    rec.onerror = () => { recRef.current = null; setListening(null); setErr("음성을 인식하지 못했어요. 다시 시도해 주세요."); };
    setListening(code); try { rec.start(); } catch { recRef.current = null; setListening(null); }
  }
  async function startRecorder(code: string) {
    const isLeft = code === myLang; setErr("");
    if (isLeft) setLeftText(""); else setRightText("");
    try { recorderRef.current = await startRecording(); setListening(code); }
    catch { recorderRef.current = null; setErr("마이크 권한이 필요해요. 권한을 허용해 주세요."); }
  }
  async function finishRecorder(code: string) {
    const rec = recorderRef.current; recorderRef.current = null; setListening(null);
    if (!rec) return;
    const isLeft = code === myLang; setBusy(isLeft ? "R" : "L");
    try {
      const { base64, rate } = await rec.stop();
      const r = await fetch("/api/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audio: base64, lang: code, rate }) });
      const d = await r.json();
      if (!r.ok || !d.text) { setErr(d.error === "no-key" ? "음성 인식 키가 설정되지 않았어요" : d.error === "stt-disabled" ? "Google Cloud에서 Speech-to-Text API를 켜주세요." : "음성을 인식하지 못했어요."); setBusy(""); return; }
      if (isLeft) setLeftText(d.text); else setRightText(d.text);
      await translateInto(d.text, code, isLeft ? otherLang : myLang, isLeft ? "R" : "L");
    } catch { setErr("네트워크 오류예요."); setBusy(""); }
  }

  const pane = (code: string, value: string, onType: (v: string) => void, side: "L" | "R", accent: string, bgSoft: string, border: string, pick: (v: string) => void) => {
    const on = listening === code; const has = !!value.trim();
    return (
      <div dir={rtlOf(code) ? "rtl" : "ltr"} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <select value={code} onChange={(e) => pick(e.target.value)} dir="ltr"
          style={{ fontSize: 11.5, fontWeight: 800, color: accent, background: "transparent", border: "none", outline: "none", cursor: "pointer", maxWidth: "100%", padding: 0 }}>
          {LANGS.map((c) => <option key={c} value={c}>{nameOf(c)}{busy === side ? " · 번역 중…" : ""}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => micFor(code)} disabled={!micAvailable} aria-label={ui(myLang, "micSpeak")}
            style={{ flex: 1, minWidth: 0, height: 48, borderRadius: 13, border: "none", cursor: micAvailable ? "pointer" : "default", background: on ? "#e25555" : bgSoft, color: on ? "#fff" : accent, fontSize: 22, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: on ? "0 0 0 5px rgba(226,85,85,0.15)" : "none", opacity: micAvailable ? 1 : 0.5 }}>
            {on ? "■" : "🎤"}
          </button>
          <button onClick={() => has && speak(value, code)} disabled={!has} aria-label={ui(myLang, "micListen")}
            style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, border: `1px solid ${has ? "transparent" : border}`, cursor: has ? "pointer" : "default", background: has ? bgSoft : theme.card, color: has ? accent : theme.textFaint, fontSize: 20, display: "grid", placeItems: "center" }}>▶</button>
        </div>
        <textarea value={value} onChange={(e) => onType(e.target.value)} rows={2} placeholder={nameOf(code)}
          style={{ width: "100%", resize: "none", borderRadius: 11, border: `1px solid ${border}`, background: bgSoft, padding: "7px 9px", fontSize: 14, color: theme.text, outline: "none", boxSizing: "border-box", minHeight: 46, lineHeight: 1.4 }} />
      </div>
    );
  };

  return (
    <div style={{ marginTop: 12, padding: "12px 13px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>🎤 {ui(myLang, "voice")}</span>
        <span style={{ fontSize: 16, color: theme.textFaint }}>↔</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {pane(myLang, leftText, onLeftType, "L", theme.primarySoft, theme.primaryBg, theme.cardBorder, pickMy)}
        {pane(otherLang, rightText, onRightType, "R", theme.gold, theme.goldLight, theme.goldBorder, pickOther)}
      </div>
      <p style={{ marginTop: 7, fontSize: 11, color: listening ? "#e25555" : theme.textMuted, fontWeight: listening ? 700 : 500, textAlign: "center" }}>
        {listening ? ui(myLang, "listening") : ui(myLang, "twoPaneHint")}
      </p>
      {err && <p style={{ fontSize: 11.5, color: theme.wrong, margin: "5px 0 0", textAlign: "center" }}>{err}</p>}
    </div>
  );
}
