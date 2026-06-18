"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { serif } from "@/lib/ui";
import MenuIcon from "@/components/MenuIcon";
import HomeFxCard from "@/components/HomeFxCard";
import MenuScanner from "@/components/MenuScanner";
import SosButton from "@/components/SosButton";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

// 작은 섹션 라벨 — 골드 라인 아이콘 + 세리프 제목 (선교 여정 전용 구조)
function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 2px 9px" }}>
      <MenuIcon name={icon} size={18} color="var(--t-sacred)" />
      <span className="serif" style={{ fontSize: 16, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: -0.2 }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: "var(--t-sacredBorder)", marginLeft: 4 }} />
    </div>
  );
}

// 사역 · 선교 · 전도 여정 — 현장 도구: 환율 계산기 + 이미지 번역 + 실시간 통역.
export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "0.7rem 1rem 1.4rem", minHeight: "100dvh" }}>
      {/* 헤더 — 골드 세리프 + 부제 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <button onClick={() => router.push("/")} aria-label={t("common.back")} style={{ flexShrink: 0, fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{t("common.home")}</button>
        <span style={{ flex: 1 }} />
      </div>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 className="serif" style={{ fontSize: 25, fontWeight: 700, color: "var(--t-sacred)", margin: 0, letterSpacing: -0.2 }}>{t("reach.title")}</h1>
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, margin: "5px 0 3px" }}>
          <span style={{ width: 26, height: 1, background: "linear-gradient(90deg, transparent, var(--t-sacred))" }} />
          <span style={{ color: "var(--t-sacred)", fontSize: 9, lineHeight: 1 }}>✦</span>
          <span style={{ width: 26, height: 1, background: "linear-gradient(90deg, var(--t-sacred), transparent)" }} />
        </div>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{t("reach.sub")}</p>
      </div>

      <SectionLabel icon="calc">{t("reach.secTools")}</SectionLabel>
      {/* 환율 계산기(왼쪽) + 이미지 번역(오른쪽) 반반 · 높이 동일 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, alignItems: "stretch" }}>
        <HomeFxCard />
        <MenuScanner />
      </div>

      <SectionLabel icon="mic">{t("reach.secVoice")}</SectionLabel>
      {/* 음성 통역 — 크게(세로 배치) */}
      <LanguageProvider><VoiceTranslator inline big /></LanguageProvider>

      {/* 🆘 긴급 SOS */}
      <div style={{ marginTop: 18 }}><SosButton /></div>
    </main>
  );
}
