"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import HomeFxCard from "@/components/HomeFxCard";
import MenuScanner from "@/components/MenuScanner";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

// 사역 · 선교 · 전도 여정 — 현장 도구: 환율 계산기 + 음성 통역.
export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer" }}>{t("common.home")}</button>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: theme.gold, margin: 0, textAlign: "center", flex: 1 }}>{t("reach.title")}</h1>
        <span style={{ width: 52 }} />
      </div>

      {/* 환율 계산기 (바트 ↔ 원) */}
      <HomeFxCard />

      {/* 📷 메뉴·간판 번역 (사진 → 글자 읽어 설정 언어로) */}
      <MenuScanner />

      {/* 음성 통역 — 크게(세로 배치): 내 언어 한 줄, 상대 언어 한 줄 */}
      <LanguageProvider><VoiceTranslator inline big /></LanguageProvider>
    </main>
  );
}
