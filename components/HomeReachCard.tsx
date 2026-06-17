"use client";

// 🌱 선교 여정 — 홈 카드. /reach(환율 계산 · 번역 도구)로 진입.
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { serif } from "@/lib/ui";

export default function HomeReachCard() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button onClick={() => router.push("/reach")} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", marginTop: 11, padding: "15px 17px", borderRadius: 18, border: `1px solid var(--t-sacredBorder)`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 8px 24px rgba(199,154,43,0.13)" }}>
      <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", display: "grid", placeItems: "center", fontSize: 24 }}>🌍</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: serif, display: "block", fontSize: 17, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: -0.2 }}>{t("home.reachTitle")}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>
          <span style={{ color: theme.wrong, fontWeight: 800 }}>{t("home.sosTag")}</span> · {t("home.reachSub")}
        </span>
      </span>
      <span style={{ fontSize: 16, color: "var(--t-sacred)" }}>›</span>
    </button>
  );
}
