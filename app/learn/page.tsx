"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { PageHeader, ACCENT, softShadow, type Accent } from "@/lib/ui";
import MenuIcon from "@/components/MenuIcon";

// 양육·교육 과정 (성경퀴즈 제외 — 새신자부터 소요리문답까지)
const COURSE_MENU: { icon: string; href: string; tk: string; accent: Accent }[] = [
  { icon: "sprout", href: "/course/newcomer", tk: "menu.newcomer", accent: ACCENT.green },
  { icon: "book", href: "/course/deep", tk: "menu.deep", accent: ACCENT.blue },
  { icon: "droplet", href: "/course/baptism", tk: "menu.baptism", accent: ACCENT.blue },
  { icon: "cross", href: "/course/confirmation", tk: "menu.confirmation", accent: ACCENT.amber },
  { icon: "clipboard", href: "/catechism", tk: "menu.catechism", accent: ACCENT.violet },
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
            style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", padding: "14px 15px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, minHeight: 92, boxShadow: softShadow }}>
            <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 13, background: m.accent.chip, display: "grid", placeItems: "center" }}><MenuIcon name={m.icon} color={m.accent.fg} /></span>
            <span className="serif" style={{ display: "block", fontSize: 16, fontWeight: 700, color: theme.text, lineHeight: 1.25, letterSpacing: -0.2 }}>{t(m.tk + ".t")}</span>
            <span style={{ display: "block", fontSize: 13, color: theme.textMuted, lineHeight: 1.35 }}>{t(m.tk + ".s")}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
