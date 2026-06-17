"use client";

// 🌱 선교 여정 — 홈 카드. /reach(환율 계산 · 번역 도구)로 진입.
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { serif, softShadow } from "@/lib/ui";

export default function HomeReachCard() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button onClick={() => router.push("/reach")} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 11, padding: "14px 16px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: softShadow }}>
      <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 13, background: "var(--a-blue-chip)", display: "grid", placeItems: "center", fontSize: 22 }}>🌍</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: serif, display: "block", fontSize: 16.5, fontWeight: 700, color: theme.text, letterSpacing: -0.2 }}>{t("home.reachTitle")}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>
          <span style={{ color: theme.wrong, fontWeight: 800 }}>{t("home.sosTag")}</span> · {t("home.reachSub")}
        </span>
      </span>
      <span style={{ fontSize: 16, color: theme.textFaint }}>›</span>
    </button>
  );
}
