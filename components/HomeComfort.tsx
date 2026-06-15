"use client";

// 💛 마음에 닿는 말씀 — 지금 감정/상황을 적으면 위로·치유·용기가 되는 말씀이 나오고,
// 탭하면 연관된 다음 말씀이 최대 10개까지 이어진다.
import { useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

type Verse = { ref: string; text: string; note: string };
const RTL = new Set(["ar", "fa", "ur"]);
const EMO = ["cf.e1", "cf.e2", "cf.e3", "cf.e4", "cf.e5", "cf.e6"];

export default function HomeComfort() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const dir = RTL.has(lang) ? "rtl" : "ltr";

  async function ask(feeling: string) {
    const f = feeling.trim();
    if (!f || loading) return;
    setLoading(true); setErr(""); setVerses([]);
    try {
      const r = await fetch("/api/comfort", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feeling: f, lang }) });
      const d = await r.json();
      if (!r.ok || !d.verses?.length) setErr(d.error === "no-key" ? t("cf.errKey") : t("cf.err"));
      else { setVerses(d.verses as Verse[]); setIdx(0); }
    } catch { setErr(t("cf.err")); }
    setLoading(false);
  }
  function reset() { setVerses([]); setIdx(0); setInput(""); setErr(""); }
  function next() { setIdx((i) => Math.min(i + 1, verses.length - 1)); }

  const card: React.CSSProperties = { marginTop: 12, padding: "13px 14px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card };

  // 결과 보기
  if (verses.length > 0) {
    const v = verses[idx];
    const atLast = idx >= verses.length - 1;
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{t("cf.title")}</span>
          <button onClick={reset} style={{ fontSize: 11.5, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer" }}>{t("cf.again")}</button>
        </div>

        <button onClick={atLast ? undefined : next} disabled={atLast}
          style={{ display: "block", width: "100%", textAlign: dir === "rtl" ? "right" : "left", cursor: atLast ? "default" : "pointer", background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 14, padding: "15px 16px" }}>
          <p key={idx} dir={dir} className="fade-in" style={{ margin: 0, fontSize: 17, lineHeight: 1.7, fontWeight: 600, color: theme.text }}>“{v.text}”</p>
          {v.ref && <p dir={dir} style={{ margin: "8px 0 0", fontSize: 12.5, fontWeight: 800, color: theme.gold }}>— {v.ref}</p>}
          {v.note && <p dir={dir} style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.6, color: theme.textMuted }}>{v.note}</p>}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span className={atLast ? "" : "anim-pop"} style={{ fontSize: 12, fontWeight: 700, color: atLast ? theme.textFaint : theme.primarySoft }}>
            {atLast ? t("cf.last") : t("cf.tapNext")}
          </span>
          <span style={{ display: "flex", gap: 4 }}>
            {verses.map((_, i) => (
              <span key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 999, background: i === idx ? theme.gold : "rgba(13,52,84,0.18)", transition: "width .2s" }} />
            ))}
          </span>
        </div>
      </div>
    );
  }

  // 입력 보기
  return (
    <div style={card}>
      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: theme.text }}>{t("cf.title")}</p>
      <p style={{ margin: "3px 0 9px", fontSize: 12, color: theme.textMuted }}>{t("cf.sub")}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
        {EMO.map((k) => (
          <button key={k} onClick={() => { setInput(t(k)); ask(t(k)); }} disabled={loading}
            style={{ fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>{t(k)}</button>
        ))}
      </div>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} placeholder={t("cf.placeholder")}
        style={{ width: "100%", boxSizing: "border-box", resize: "none", fontSize: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none", lineHeight: 1.5 }} />

      <button onClick={() => ask(input)} disabled={loading || !input.trim()}
        style={{ width: "100%", marginTop: 8, padding: 12, fontSize: 14.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 12, cursor: loading || !input.trim() ? "default" : "pointer", opacity: loading || !input.trim() ? 0.55 : 1 }}>
        {loading ? t("cf.loading") : t("cf.submit")}
      </button>
      {err && <p style={{ margin: "8px 0 0", fontSize: 12, color: theme.wrong, textAlign: "center" }}>{err}</p>}
    </div>
  );
}
