"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader, SectionLabel, SACRED } from "@/lib/ui";
import MenuScanner from "@/components/MenuScanner";
import SosButton from "@/components/SosButton";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

// 선교 도구 — 실시간 통역(메인) + 이미지 번역 + 긴급 SOS. (환율 계산기 제거)
export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "0.55rem 1rem 0.9rem", minHeight: "100dvh" }}>
      <PageHeader title={t("reach.title")} subtitle={t("reach.sub")} onHome={() => router.push("/")} homeLabel={t("common.home")} accentColor={SACRED.fg} />

      {/* 실시간 통역 — 이 페이지의 메인. 크게(big) 표시 */}
      <SectionLabel icon="mic" accentColor={SACRED.fg}>{t("reach.secVoice")}</SectionLabel>
      <LanguageProvider><VoiceTranslator inline big /></LanguageProvider>

      {/* 이미지 번역 (자체 제목 있음) */}
      <div style={{ marginTop: 14 }}><MenuScanner /></div>

      {/* 🆘 긴급 SOS */}
      <div style={{ marginTop: 12 }}><SosButton /></div>
    </main>
  );
}
