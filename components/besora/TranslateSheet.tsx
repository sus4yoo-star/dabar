"use client";

import { useState } from "react";
import { useLang } from "@/lib/besora/LanguageContext";
import { speak } from "@/lib/besora/speak";

// 한 방향(예: 나 → 상대) 번역 입력 + 결과 + 음성
function Direction({
  from,
  to,
  fromName,
  toName,
}: {
  from: string;
  to: string;
  fromName: string;
  toName: string;
}) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    setErr("");
    setOut("");
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: from, target: to }),
      });
      const d = await r.json();
      if (!r.ok || !d.text) {
        setErr(
          d.error === "no-key"
            ? "번역 키가 아직 설정되지 않았어요 (Netlify 환경변수 GOOGLE_TRANSLATE_API_KEY)"
            : "번역에 실패했어요. 잠시 후 다시 시도해 주세요."
        );
      } else {
        setOut(d.text);
        speak(d.text, to);
      }
    } catch {
      setErr("네트워크 오류예요.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-2 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-gospel-parch">{fromName}</span>
        <span>→</span>
        <span className="rounded-full bg-gospel-gold/20 px-2 py-0.5 text-gospel-gold">{toName}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={`${fromName}로 입력`}
        className="w-full resize-none rounded-xl border border-white/10 bg-ink-3 px-3 py-2 text-sm text-gospel-parch outline-none placeholder:text-muted"
      />
      <button
        onClick={go}
        disabled={busy || !text.trim()}
        className="mt-2 w-full rounded-full bg-gospel-gold py-2 text-sm font-semibold text-ink active:scale-95 disabled:opacity-40"
      >
        {busy ? "번역 중…" : `${toName}로 번역·들려주기`}
      </button>
      {err && <p className="mt-2 text-xs text-gospel-crimson">{err}</p>}
      {out && (
        <div className="mt-2 flex items-start justify-between gap-2 rounded-xl bg-ink-3 px-3 py-2">
          <p className="text-sm text-gospel-parch">{out}</p>
          <button onClick={() => speak(out, to)} aria-label="다시 듣기" className="shrink-0 text-gospel-gold">
            ▶
          </button>
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
      <button
        onClick={() => setOpen(true)}
        aria-label="음성 번역"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-base text-gospel-parch active:scale-95"
      >
        🌐
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/55 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto w-full max-w-md rounded-t-3xl border-t border-white/10 bg-ink p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-gospel-parch">음성 번역</h2>
              <button onClick={() => setOpen(false)} className="text-sm text-muted">
                닫기 ✕
              </button>
            </div>
            <div className="space-y-3">
              <Direction from={myLang} to={seeker} fromName={nameOf(myLang)} toName={nameOf(seeker)} />
              <Direction from={seeker} to={myLang} fromName={nameOf(seeker)} toName={nameOf(myLang)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
