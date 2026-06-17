"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { PageHeader, ACCENT, softShadow, type Accent } from "@/lib/ui";

// 양육·교육 과정 (성경퀴즈 제외 — 새신자부터 소요리문답까지)
const COURSE_MENU: { emoji: string; href: string; tk: string; accent: Accent }[] = [
  { emoji: "🌱", href: "/course/newcomer", tk: "menu.newcomer", accent: ACCENT.green },
  { emoji: "📚", href: "/course/deep", tk: "menu.deep", accent: ACCENT.blue },
  { emoji: "💧", href: "/course/baptism", tk: "menu.baptism", accent: ACCENT.blue },
  { emoji: "✝️", href: "/course/confirmation", tk: "menu.confirmation", accent: ACCENT.amber },
  { emoji: "📜", href: "/catechism", tk: "menu.catechism", accent: ACCENT.violet },
];

export default function LearnPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <main className="fade-in" style={{ maxWidth: 440, margin: "0 auto", padding: "0.85rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <PageHeader title={t("home.growSection")} homeLabel={t("common.home")} onHome={() => router.push("/")} />
      <p style={{ fontSize: 13.5, color: theme.textMuted, margin: "-0.6rem 0 1.2rem 2px", lineHeight: 1.5 }}>{t("home.growSub")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {COURSE_MENU.map(m => (
          <button key={m.href} onClick={() => router.push(m.href)} className="fade-in-2"
            style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", padding: "14px 15px", borderRadius: 16, border: `1px solid ${m.accent.border}`, background: m.accent.bg, cursor: "pointer", color: theme.text, minHeight: 92, boxShadow: softShadow }}>
            <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: m.accent.chip, display: "grid", placeItems: "center", fontSize: 23 }}>{m.emoji}</span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: m.accent.fg, lineHeight: 1.25 }}>{t(m.tk + ".t")}</span>
            <span style={{ display: "block", fontSize: 13, color: theme.textMuted, lineHeight: 1.35 }}>{t(m.tk + ".s")}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
