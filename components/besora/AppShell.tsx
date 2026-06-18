"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { fetchUnreadTotal } from "@/lib/besora/companions";

export default function AppShell({ children }: { children: ReactNode }) {
  const { myLang, rtlFor } = useLang();
  const [unread, setUnread] = useState(0);
  useEffect(() => { fetchUnreadTotal().then(setUnread).catch(() => {}); }, []);
  // 전도자(내) 언어가 RTL(아랍어·페르시아어·우르두어)이면 전도 도구 UI 전체를 오른쪽→왼쪽으로.
  // (콘텐츠 카드는 상대 언어 기준으로 StepView 가 따로 방향을 잡는다.)
  return (
    <div dir={rtlFor(myLang) ? "rtl" : "ltr"} style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          padding: "12px 18px",
          borderBottom: `1px solid ${theme.cardBorder}`,
          background: "var(--t-glass)", backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link href="/" aria-label={ui(myLang, "home")} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "6px 11px", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            ← {ui(myLang, "home")}
          </Link>
          <Link href="/share" style={{ fontSize: 18, fontWeight: 800, color: "var(--t-sacred)", textDecoration: "none", letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            🕊️ {ui(myLang, "appName")}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* 좌상단 언어선택 자리에 '나의 전도 기록' (언어 선택은 아래 음성 통역에서) */}
          <Link href="/share/me" aria-label={ui(myLang, "myRecords")} title={ui(myLang, "myRecords")}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: "6px 13px", textDecoration: "none", whiteSpace: "nowrap" }}>
            📖 {ui(myLang, "myRecords")}
            {unread > 0 && (
              <span style={{ position: "absolute", top: -5, insetInlineEnd: -5, minWidth: 17, height: 17, padding: "0 5px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 0 0 2px #fff" }}>{unread > 99 ? "99+" : unread}</span>
            )}
          </Link>
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px 24px" }}>{children}</main>
    </div>
  );
}
