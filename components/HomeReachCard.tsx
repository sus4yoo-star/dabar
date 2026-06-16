"use client";

// 🌱 선교 여정 — 홈 카드. /reach(환율 계산 · 번역 도구)로 진입.
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export default function HomeReachCard() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button onClick={() => router.push("/reach")} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 9, padding: "12px 16px", borderRadius: 16, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, cursor: "pointer", color: theme.text }}>
      <span style={{ fontSize: 24, lineHeight: 1 }}>🌍</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: theme.gold }}>{t("home.reachTitle")}</span>
        <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
          <span style={{ color: theme.wrong, fontWeight: 800 }}>{t("home.sosTag")}</span> · {t("home.reachSub")}
        </span>
      </span>
      <span style={{ fontSize: 18, color: theme.gold }}>→</span>
    </button>
  );
}
