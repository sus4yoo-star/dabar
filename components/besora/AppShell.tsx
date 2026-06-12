"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { theme } from "@/lib/theme";
import LanguageToggle from "@/components/besora/LanguageToggle";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function AppShell({ children }: { children: ReactNode }) {
  const { myLang } = useLang();
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          padding: "12px 18px",
          borderBottom: `1px solid ${theme.cardBorder}`,
          background: "rgba(255,255,255,0.86)", backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link href="/" aria-label={ui(myLang, "home")} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "6px 11px", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            ← {ui(myLang, "home")}
          </Link>
          <Link href="/share" style={{ fontSize: 18, fontWeight: 800, color: theme.gold, textDecoration: "none", letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            🕊️ {ui(myLang, "appName")}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/share/me" aria-label={ui(myLang, "companions")} title={ui(myLang, "companions")}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: "6px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
            🤝 {ui(myLang, "companionsNav")}
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 100px" }}>{children}</main>
    </div>
  );
}
