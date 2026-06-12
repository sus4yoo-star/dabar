"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 양육·교육 과정 (성경퀴즈 제외 — 새신자부터 소교리문답까지)
const COURSE_MENU = [
  { emoji: "🌱", href: "/course/newcomer", tk: "menu.newcomer" },
  { emoji: "💧", href: "/course/baptism", tk: "menu.baptism" },
  { emoji: "✝️", href: "/course/confirmation", tk: "menu.confirmation" },
  { emoji: "📚", href: "/course/deep", tk: "menu.deep" },
  { emoji: "📜", href: "/catechism", tk: "menu.catechism" },
];

export default function LearnPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <main className="fade-in" style={{ maxWidth: 440, margin: "0 auto", padding: "0.85rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: "1.1rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>{t("common.home")}</button>
        <h1 style={{ fontSize: 19, fontWeight: 800, color: theme.text, margin: 0 }}>{t("home.growSection")}</h1>
        <span style={{ width: 56 }} />
      </div>
      <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 1.1rem 2px" }}>{t("home.growSub")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {COURSE_MENU.map(m => (
          <button key={m.href} onClick={() => router.push(m.href)}
            style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", padding: "13px 14px", borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, minHeight: 76 }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{m.emoji}</span>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.text, lineHeight: 1.25 }}>{t(m.tk + ".t")}</span>
            <span style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.3 }}>{t(m.tk + ".s")}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
