// 전도(복음 전하기) 서브트리 전용 레이아웃.
// 베소라 LanguageProvider 를 /share 안에서만 적용 + 다바르 보라 배경(테마 일치).
import { LanguageProvider } from "@/lib/besora/LanguageContext";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { theme } from "@/lib/theme";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: theme.bgGrad, color: theme.text }}>
      <LanguageProvider>
        {children}
        {/* 🎤 음성 통역 — 전도 도구 진행 중에도 항상 떠 있음 */}
        <VoiceTranslator />
      </LanguageProvider>
    </div>
  );
}
