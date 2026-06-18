"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader, SectionLabel, SACRED } from "@/lib/ui";
import HomeFxCard from "@/components/HomeFxCard";
import MenuScanner from "@/components/MenuScanner";
import SosButton from "@/components/SosButton";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

// 사역 · 선교 · 전도 여정 — 현장 도구: 환율 계산기 + 이미지 번역 + 실시간 통역. (디자인 모범 페이지)
export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "0.7rem 1rem 1.4rem", minHeight: "100dvh" }}>
      <PageHeader title={t("reach.title")} subtitle={t("reach.sub")} onHome={() => router.push("/")} homeLabel={t("common.home")} accentColor={SACRED.fg} />

      <SectionLabel icon="calc" accentColor={SACRED.fg}>{t("reach.secTools")}</SectionLabel>
      {/* 환율 계산기(왼쪽) + 이미지 번역(오른쪽) 반반 · 높이 동일 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, alignItems: "stretch" }}>
        <HomeFxCard />
        <MenuScanner />
      </div>

      <SectionLabel icon="mic" accentColor={SACRED.fg}>{t("reach.secVoice")}</SectionLabel>
      {/* 음성 통역 — 크게(세로 배치) */}
      <LanguageProvider><VoiceTranslator inline big /></LanguageProvider>

      {/* 🆘 긴급 SOS */}
      <div style={{ marginTop: 18 }}><SosButton /></div>
    </main>
  );
}
