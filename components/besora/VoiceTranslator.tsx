"use client";

// 🎤 실시간 양방향 통역 — /share 전체(도구 진행 중 포함)에 떠 있는 플로팅 버튼.
// 좌/우 2분할: 왼쪽=내 언어, 오른쪽=상대 언어.
//  - 각 칸의 화면 마이크를 탭하면 그 칸 언어로 받아쓰기 → 반대 칸으로 자동 번역.
//  - 음성인식: 지원 브라우저(안드로이드/크롬)는 Web Speech, 아이폰은 직접 녹음 → 서버 구글 STT.
//  - 키보드로 직접 입력해도 자동 번역.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { speak } from "@/lib/besora/speak";
import { startRecording, canRecord, type Recorder } from "@/lib/besora/recorder";

const LOCALE: Record<string, string> = {
  ko: "ko-KR", en: "en-US", es: "es-ES", zh: "zh-CN",
  fr: "fr-FR", hi: "hi-IN", pt: "pt-BR", ar: "ar-SA", th: "th-TH", lo: "lo-LA",
  fa: "fa-IR", my: "my-MM", ms: "ms-MY", vi: "vi-VN", id: "id-ID",
  bn: "bn-IN", ja: "ja-JP", ur: "ur-PK", ru: "ru-RU", sw: "sw-KE",
};

export default function VoiceTranslator({ inline = false }: { inline?: boolean } = {}) {
  const { myLang, seekerLang, languages, rtlFor } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState<null | string>(null); // 듣는 중인 언어코드
  const [leftText, setLeftText] = useState("");   // 내 언어 칸
  const [rightText, setRightText] = useState(""); // 상대 언어 칸
  const [busy, setBusy] = useState<"" | "L" | "R">(""); // 번역 중인 도착 칸
  const [err, setErr] = useState("");
  const recRef = useRef<any>(null);           // Web Speech 인스턴스
  const recorderRef = useRef<Recorder | null>(null); // 녹음 인스턴스(iOS 등)
  const finalRef = useRef("");
  const leftTimer = useRef<any>(null);
  const rightTimer = useRef<any>(null);
  useEffect(() => setMounted(true), []);

  // 전도 도구 진행 화면에서는 통역 패널을 바로 펼쳐 띄운다 (마이크 버튼 없이)
  useEffect(() => {
    if (pathname?.startsWith("/share/present")) setOpen(true);
  }, [pathname]);

  // 패널이 열리면 본문에 아래 여백을 줘서, 전도 도구의 '이전/다음' 버튼을
  // 패널 위로 스크롤해 올려 누를 수 있게 한다. (패널이 가려 막던 문제 해결)
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.paddingBottom = open ? "46dvh" : "";
    return () => { document.body.style.paddingBottom = ""; };
  }, [open]);

  const seeker = seekerLang || "en";
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;

  const SR = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;
  // 화면 마이크 사용 가능 여부: Web Speech 또는 직접 녹음(getUserMedia) 중 하나라도 되면 OK
  const micAvailable = !!SR || canRecord();

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

  // 화면 마이크 탭 — 듣는 중이면 멈추고, 아니면 그 칸 언어로 받아쓰기 시작
  function micFor(lang: string) {
    if (listening) { stopMic(); return; }
    if (SR) startSR(lang);
    else if (canRecord()) startRecorder(lang);
    else setErr("이 브라우저에서는 음성 입력을 지원하지 않아요. 직접 입력해 주세요.");
  }

  function stopMic() {
    if (recRef.current) { try { recRef.current.stop(); } catch { /* ignore */ } }
    else if (recorderRef.current) { finishRecorder(listening || myLang); }
  }

  // Web Speech (안드로이드/크롬): 실시간 자막
  function startSR(lang: string) {
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
      recRef.current = null;
      setListening(null);
      const txt = finalRef.current.trim();
      if (txt) translateInto(txt, lang, isLeft ? seeker : myLang, isLeft ? "R" : "L");
    };
    rec.onerror = () => { recRef.current = null; setListening(null); setErr("음성을 인식하지 못했어요. 다시 시도해 주세요."); };
    setListening(lang);
    try { rec.start(); } catch { recRef.current = null; setListening(null); }
  }

  // 직접 녹음 (아이폰 등): 탭으로 시작/정지 → 서버 STT
  async function startRecorder(lang: string) {
    const isLeft = lang === myLang;
    setErr("");
    if (isLeft) setLeftText(""); else setRightText("");
    try {
      recorderRef.current = await startRecording();
      setListening(lang);
    } catch {
      recorderRef.current = null;
      setErr("마이크 권한이 필요해요. 권한을 허용해 주세요.");
    }
  }

  async function finishRecorder(lang: string) {
    const rec = recorderRef.current;
    recorderRef.current = null;
    setListening(null);
    if (!rec) return;
    const isLeft = lang === myLang;
    setBusy(isLeft ? "R" : "L");
    try {
      const { base64, rate } = await rec.stop();
      const r = await fetch("/api/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, lang, rate }),
      });
      const d = await r.json();
      if (!r.ok || !d.text) {
        setErr(
          d.error === "no-key"
            ? "음성 인식 키가 아직 설정되지 않았어요 (Speech-to-Text)"
            : d.error === "stt-disabled"
            ? "음성 인식이 꺼져 있어요. Google Cloud에서 'Cloud Speech-to-Text API'를 켜주세요."
            : "음성을 인식하지 못했어요. 다시 시도해 주세요.");
        setBusy(""); return;
      }
      if (isLeft) setLeftText(d.text); else setRightText(d.text);
      await translateInto(d.text, lang, isLeft ? seeker : myLang, isLeft ? "R" : "L");
    } catch {
      setErr("네트워크 오류예요."); setBusy("");
    }
  }

  function close() { if (listening) stopMic(); setOpen(false); }

  // 한 언어 칸 — 라벨 + [ 큰 마이크 | 큰 재생 ] + 원문·번역 텍스트
  const pane = (code: string, value: string, onType: (v: string) => void,
                side: "L" | "R", accent: string, bgSoft: string, border: string) => {
    const on = listening === code;
    const has = !!value.trim();
    const dir = rtlFor(code) ? "rtl" : "ltr";
    return (
      <div dir={dir} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(code)}{busy === side ? " · 번역 중…" : ""}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {/* 마이크 (크게, 가변폭) */}
          <button onClick={() => micFor(code)} disabled={!micAvailable} aria-label={ui(myLang, "micSpeak")}
            style={{ flex: 1, minWidth: 0, height: 54, borderRadius: 14, border: "none", cursor: micAvailable ? "pointer" : "default",
              background: on ? "#e25555" : bgSoft, color: on ? "#fff" : accent, fontSize: 24, fontWeight: 800,
              display: "grid", placeItems: "center", boxShadow: on ? "0 0 0 6px rgba(226,85,85,0.15)" : "none",
              transition: "background .2s", opacity: micAvailable ? 1 : 0.5 }}>
            {on ? "■" : "🎤"}
          </button>
          {/* 재생 (크게) */}
          <button onClick={() => has && speak(value, code)} disabled={!has} aria-label={ui(myLang, "micListen")}
            style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 14, border: `1px solid ${has ? "transparent" : border}`, cursor: has ? "pointer" : "default",
              background: has ? bgSoft : theme.card, color: has ? accent : theme.textFaint, fontSize: 22,
              display: "grid", placeItems: "center" }}>
            ▶
          </button>
        </div>
        <textarea value={value} onChange={(e) => onType(e.target.value)} rows={2}
          placeholder={nameOf(code)}
          style={{ width: "100%", resize: "none", borderRadius: 12, border: `1px solid ${border}`, background: bgSoft, padding: "8px 10px", fontSize: 14.5, color: theme.text, outline: "none", boxSizing: "border-box", minHeight: 52, lineHeight: 1.45 }} />
      </div>
    );
  };

  const twoWay = seeker !== myLang;

  const panes = (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {pane(myLang, leftText, onLeftType, "L", theme.primarySoft, theme.primaryBg, theme.cardBorder)}
      {twoWay && pane(seeker, rightText, onRightType, "R", theme.gold, theme.goldLight, theme.goldBorder)}
    </div>
  );
  const hint = (
    <p style={{ marginTop: 8, fontSize: 11.5, color: listening ? "#e25555" : theme.textMuted, fontWeight: listening ? 700 : 500, textAlign: "center" }}>
      {listening ? ui(myLang, "listening") : ui(myLang, "twoPaneHint")}
    </p>
  );

  // 인라인 모드 — 페이지에 그냥 박아두기 (플로팅/포털 없음, 항상 보임)
  if (inline) {
    return (
      <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: "#ffffff" }}>
        <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 15, fontWeight: 700, color: theme.text, margin: "0 0 8px" }}>🎤 {ui(myLang, "voice")}</h2>
        {panes}
        {hint}
        {err && <p style={{ fontSize: 12, color: theme.wrong, margin: "6px 0 0", textAlign: "center" }}>{err}</p>}
      </div>
    );
  }

  // 채팅·허브에서는 플로팅 FAB 숨김 (허브 /share 는 인라인으로 박아둠)
  if (pathname?.startsWith("/share/chat")) return null;
  if (pathname === "/share") return null;

  return (
    <>
      {/* 닫았을 때만 보이는 슬림 재열기 바 (큰 마이크 버튼 대신) */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={ui(myLang, "voice")}
          style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, zIndex: 55, padding: "9px 18px", borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#3CAFFF,#92D700)", color: "#fff", fontSize: 13, fontWeight: 800, boxShadow: "0 8px 22px rgba(23,50,73,0.3)" }}>
          🎤 {ui(myLang, "voice")} ▲
        </button>
      )}

      {open && mounted && createPortal(
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, borderTopLeftRadius: 22, borderTopRightRadius: 22, border: `1px solid ${theme.cardBorder}`, borderBottom: "none", background: "#ffffff", padding: "10px 16px 14px", boxShadow: "0 -12px 36px rgba(23,50,73,0.20)", maxHeight: "48dvh", overflowY: "auto" }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, color: theme.text, margin: 0 }}>🎤 {ui(myLang, "voice")}</h2>
              <button onClick={close} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: "pointer" }}>{ui(myLang, "close")} ✕</button>
            </div>
            {panes}
            {hint}
            {err && <p style={{ fontSize: 12, color: theme.wrong, margin: "6px 0 0", textAlign: "center" }}>{err}</p>}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
