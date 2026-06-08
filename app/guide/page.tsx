"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { emoji: "🙌", tk: "g.step1t", dk: "g.step1d" },
  { emoji: "📖", tk: "g.step2t", dk: "g.step2d" },
  { emoji: "💧", tk: "g.step3t", dk: "g.step3d" },
  { emoji: "✝️", tk: "g.step4t", dk: "g.step4d" },
];

export default function GuidePage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("common.home")}</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>📋</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>{t("g.title")}</h1>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>{t("g.sub")}</p>
      </div>

      <div style={{ position: "relative" }}>
        {STEPS.map((s, i) => (
          <div key={s.tk} style={{ display: "flex", gap: 14, marginBottom: i < STEPS.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
              {i < STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: theme.cardBorder, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 2 }}>
              <p style={{ fontSize: 15.5, fontWeight: 800, color: theme.text, margin: "0 0 5px" }}>{i + 1}. {t(s.tk)}</p>
              <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.65 }}>{t(s.dk)}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 14, padding: "14px 16px", marginTop: "1.5rem" }}>
        <p style={{ fontSize: 13.5, color: theme.text, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>
          {t("g.callout")}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
        <button onClick={() => router.push("/course/newcomer")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>{t("g.btnNew")}</button>
        <button onClick={() => router.push("/course/baptism")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>{t("g.btnBap")}</button>
        <button onClick={() => router.push("/course/confirmation")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>{t("g.btnConf")}</button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem" }}>{t("g.footer")}</p>
    </main>
  );
}
