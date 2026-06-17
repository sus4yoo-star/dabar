"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import HomeFxCard from "@/components/HomeFxCard";
import MenuScanner from "@/components/MenuScanner";
import SosButton from "@/components/SosButton";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

// 사역 · 선교 · 전도 여정 — 현장 도구: 환율 계산기 + 음성 통역.
export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "0.7rem 1rem 1.2rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer" }}>{t("common.home")}</button>
        <h1 className="serif" style={{ fontSize: 18, fontWeight: 700, color: theme.gold, margin: 0, textAlign: "center", flex: 1, letterSpacing: -0.2 }}>{t("reach.title")}</h1>
        <span style={{ width: 52 }} />
      </div>

      {/* 환율 계산기(왼쪽) + 이미지 번역(오른쪽) 반반 · 박스 높이 동일(stretch) */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, alignItems: "stretch" }}>
        <HomeFxCard />
        <MenuScanner />
      </div>

      {/* 음성 통역 — 크게(세로 배치): 내 언어 한 줄, 상대 언어 한 줄 */}
      <LanguageProvider><VoiceTranslator inline big /></LanguageProvider>

      {/* 🆘 긴급 SOS — 동행 문자 + 긴급기관 전화 */}
      <SosButton />
    </main>
  );
}
