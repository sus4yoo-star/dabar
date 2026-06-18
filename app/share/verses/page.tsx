"use client";
import { useState } from "react";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import { useLang } from "@/lib/besora/LanguageContext";
import { useI18n } from "@/lib/i18n";
import { gospelPassages } from "@/lib/besora/verses";

export default function ParallelVersesPage() {
  const { t } = useI18n();
  const { myLang, seekerLang, setMyLang, setSeekerLang, languages, rtlFor } = useLang();
  const [pick, setPick] = useState<null | "my" | "seeker">(null);

  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;
  const mine = gospelPassages(myLang);
  const theirs = seekerLang ? gospelPassages(seekerLang) : null;

  function swap() {
    if (!seekerLang) return;
    const a = myLang, b = seekerLang;
    setMyLang(b); setSeekerLang(a);
  }

  return (
    <AppShell title={t("pv.title")} subtitle={t("pv.entrySub")}>
      {/* 언어 쌍 바 — 내 언어(파랑) ↔ 상대 언어(골드) */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setPick(pick === "my" ? null : "my")}
          style={{ flex: 1, borderRadius: 14, border: `1px solid ${pick === "my" ? theme.primary : theme.cardBorder}`, background: theme.primaryBg, padding: "9px 12px", textAlign: "left", cursor: "pointer" }}>
          <span style={{ display: "block", fontSize: 10.5, letterSpacing: 0.5, color: theme.textMuted }}>{t("pv.myLang")}</span>
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: theme.primarySoft }}>{nameOf(myLang)}</span>
        </button>
        <button onClick={swap} aria-label={t("pv.swap")} disabled={!seekerLang}
          style={{ flexShrink: 0, borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 16, fontWeight: 800, padding: "0 12px", cursor: seekerLang ? "pointer" : "default", opacity: seekerLang ? 1 : 0.4 }}>↔</button>
        <button onClick={() => setPick(pick === "seeker" ? null : "seeker")}
          style={{ flex: 1, borderRadius: 14, border: `1px solid ${pick === "seeker" ? "var(--t-sacredSoft)" : "var(--t-sacredBorder)"}`, background: "var(--t-sacredLight)", padding: "9px 12px", textAlign: "left", cursor: "pointer" }}>
          <span style={{ display: "block", fontSize: 10.5, letterSpacing: 0.5, color: theme.textMuted }}>{t("pv.seekerLang")}</span>
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: "var(--t-sacred)" }}>{seekerLang ? nameOf(seekerLang) : t("pv.pickSeeker")}</span>
        </button>
      </div>

      {/* 언어 선택 그리드 */}
      {pick && (
        <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {languages.map((l) => {
            const on = pick === "my" ? l.code === myLang : l.code === seekerLang;
            const onBg = pick === "my" ? theme.primary : "var(--t-sacred)";
            return (
              <button key={l.code}
                onClick={() => { (pick === "my" ? setMyLang : setSeekerLang)(l.code); setPick(null); }}
                style={{ borderRadius: 12, padding: "8px", fontSize: 13.5, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? onBg : theme.card, color: on ? "#fff" : theme.text, fontWeight: on ? 800 : 500 }}>
                {l.name_native}
              </button>
            );
          })}
        </div>
      )}

      {/* 본문 — 구절마다 두 언어 나란히 */}
      {!seekerLang ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: theme.textMuted }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>📖</div>
          <p style={{ fontSize: 14, margin: 0 }}>{t("pv.pickSeeker")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mine.map((m, i) => {
            const o = theirs![i];
            return (
              <div key={m.key} style={{ borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, overflow: "hidden" }}>
                <div style={{ padding: "7px 12px", borderBottom: `1px solid ${theme.cardBorder}`, fontSize: 12.5, fontWeight: 800, color: "var(--t-sacred)", background: "var(--t-sacredLight)" }}>
                  {m.label}{o && o.label !== m.label ? `  ·  ${o.label}` : ""}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <VerseBlock name={nameOf(myLang)} text={m.text} rtl={rtlFor(myLang)} accent={theme.primarySoft} border />
                  <VerseBlock name={nameOf(seekerLang)} text={o?.text ?? ""} rtl={rtlFor(seekerLang)} accent="var(--t-sacred)" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function VerseBlock({ name, text, rtl, accent, border }: { name: string; text: string; rtl: boolean; accent: string; border?: boolean }) {
  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ padding: "10px 12px", borderInlineEnd: border ? `1px solid ${theme.cardBorder}` : undefined, textAlign: "start" }}>
      <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, color: accent, marginBottom: 4, letterSpacing: 0.3 }}>{name}</span>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: theme.text, margin: 0 }}>{text}</p>
    </div>
  );
}
