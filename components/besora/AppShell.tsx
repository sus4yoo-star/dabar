"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { theme } from "@/lib/theme";
import LanguageToggle from "@/components/besora/LanguageToggle";
import TranslateSheet from "@/components/besora/TranslateSheet";
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
          background: "rgba(61,31,107,0.72)", backdropFilter: "blur(10px)",
        }}
      >
        <Link href="/share" style={{ fontSize: 18, fontWeight: 800, color: theme.gold, textDecoration: "none", letterSpacing: 0.3 }}>
          🕊️ {ui(myLang, "appName")}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TranslateSheet />
          <LanguageToggle />
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 24px" }}>{children}</main>
    </div>
  );
}
