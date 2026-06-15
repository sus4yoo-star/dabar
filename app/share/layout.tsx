// 전도(복음 전하기) 서브트리 전용 레이아웃.
// 베소라 LanguageProvider 를 /share 안에서만 적용 + 다바르 보라 배경(테마 일치).
import { LanguageProvider } from "@/lib/besora/LanguageContext";
import { theme } from "@/lib/theme";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: theme.bgGrad, color: theme.text }}>
      <LanguageProvider>
        {children}
        {/* 🎤 음성 통역은 각 화면(허브·전도 도구)에 인라인으로 고정 임베드됨 (플로팅 버튼 제거) */}
      </LanguageProvider>
    </div>
  );
}
