"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { getTraining } from "@/lib/besora/training";

type Msg = { role: "evangelist" | "seeker"; content: string };
const PERSONAS: { key: string; icon: string; labelKey: string }[] = [
  { key: "curious", icon: "🙂", labelKey: "personaCurious" },
  { key: "tired", icon: "😔", labelKey: "personaTired" },
  { key: "skeptic", icon: "🤨", labelKey: "personaSkeptic" },
  { key: "busy", icon: "⏳", labelKey: "personaBusy" },
];

export default function PracticePage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = use(params);
  const router = useRouter();
  const { myLang } = useLang();
  const data = getTraining(tool);
  const T = (k: string) => ui(myLang, k as Parameters<typeof ui>[1]);

  const [persona, setPersona] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking, feedback]);

  async function call(mode: "chat" | "feedback", next: Msg[]) {
    setErr(false);
    const res = await fetch("/api/roleplay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool, persona, lang: myLang, mode, messages: next }),
    }).catch(() => null);
    if (!res || !res.ok) { setErr(true); return null; }
    const j = await res.json().catch(() => null) as { reply?: string } | null;
    return j?.reply ?? null;
  }

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const next = [...msgs, { role: "evangelist" as const, content: text }];
    setMsgs(next); setInput(""); setThinking(true);
    const reply = await call("chat", next);
    setThinking(false);
    if (reply) setMsgs([...next, { role: "seeker", content: reply }]);
  }

  async function getFeedback() {
    if (thinking || msgs.length === 0) return;
    setThinking(true); setFeedback(null);
    const fb = await call("feedback", msgs);
    setThinking(false);
    if (fb) setFeedback(fb);
  }

  function restart() { setMsgs([]); setFeedback(null); setInput(""); setErr(false); setPersona(null); }

  if (!data) {
    return <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center", color: theme.textMuted }}>—</main>;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0.6rem 1rem 0.4rem" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, marginBottom: 8 }}>
          <button onClick={() => (history.length > 1 ? history.back() : router.push(`/share/train/${tool}`))}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer" }}>
            <span aria-hidden>←</span>{data.name}
          </button>
          <span style={{ flex: 1 }} />
          {msgs.length > 0 && <button onClick={restart} style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>{T("practiceRestart")}</button>}
        </div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1 className="serif" style={{ fontSize: 20, fontWeight: 800, color: "var(--t-sacred)", margin: 0 }}>{T("practiceTitle")}</h1>
          <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "3px 0 0" }}>{T("practiceSub")}</p>
        </div>

        {/* 상대 고르기 */}
        {!persona && (
          <div style={{ marginTop: 6 }}>
            <p style={{ textAlign: "center", fontSize: 13.5, fontWeight: 700, color: theme.text, margin: "6px 0 12px" }}>{T("practicePick")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PERSONAS.map((p) => (
                <button key={p.key} onClick={() => setPersona(p.key)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "18px 10px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text }}>
                  <span style={{ fontSize: 30 }}>{p.icon}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{T(p.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 대화 */}
        {persona && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, paddingBottom: 6 }}>
            {msgs.length === 0 && (
              <p style={{ textAlign: "center", fontSize: 12.5, color: theme.textFaint, lineHeight: 1.6, padding: "1.5rem 1rem" }}>
                {PERSONAS.find((p) => p.key === persona)?.icon} {T(PERSONAS.find((p) => p.key === persona)!.labelKey)}
                <br />{T("practiceInput")}
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "evangelist" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", padding: "10px 13px", borderRadius: 16, fontSize: 14, lineHeight: 1.55,
                  background: m.role === "evangelist" ? "var(--t-sacred)" : theme.card,
                  color: m.role === "evangelist" ? "#fff" : theme.text,
                  border: m.role === "evangelist" ? "none" : `1px solid ${theme.cardBorder}`,
                  borderBottomRightRadius: m.role === "evangelist" ? 5 : 16,
                  borderBottomLeftRadius: m.role === "seeker" ? 5 : 16 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && !feedback && <div style={{ alignSelf: "flex-start", fontSize: 12.5, color: theme.textMuted, padding: "4px 6px" }}>{T("practiceThinking")}</div>}
            {err && <p style={{ textAlign: "center", fontSize: 12.5, color: theme.wrong }}>{T("practiceError")}</p>}

            {/* 코치 피드백 */}
            {feedback && (
              <div style={{ marginTop: 6, background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", borderRadius: 16, padding: "14px 16px" }}>
                <p className="serif" style={{ fontSize: 14.5, fontWeight: 800, color: "var(--t-sacred)", margin: "0 0 8px" }}>🎓 {T("practiceCoach")}</p>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: theme.text, whiteSpace: "pre-wrap" }}>{feedback}</p>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </main>

      {/* 입력 바 */}
      {persona && (
        <div style={{ position: "sticky", bottom: 0, background: theme.bgGrad, borderTop: `1px solid ${theme.cardBorder}`, padding: "9px 1rem calc(9px + env(safe-area-inset-bottom))" }}>
          {msgs.length >= 2 && !feedback && (
            <button onClick={getFeedback} disabled={thinking}
              style={{ width: "100%", marginBottom: 8, padding: "9px", borderRadius: 11, border: "1px solid var(--t-sacredBorder)", background: "var(--t-sacredLight)", color: "var(--t-sacred)", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
              🎓 {T("practiceFeedback")}
            </button>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={T("practiceInput")} rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              style={{ flex: 1, resize: "none", boxSizing: "border-box", padding: "11px 13px", fontSize: 14.5, border: `1px solid ${theme.border}`, borderRadius: 14, outline: "none", background: theme.card, color: theme.text, maxHeight: 120, lineHeight: 1.4 }} />
            <button onClick={send} disabled={!input.trim() || thinking}
              style={{ flexShrink: 0, padding: "11px 16px", borderRadius: 14, border: "none", background: "var(--t-sacred)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: input.trim() && !thinking ? "pointer" : "default", opacity: input.trim() && !thinking ? 1 : 0.5 }}>
              {T("practiceSend")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
