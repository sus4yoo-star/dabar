// 전도(복음 전하기) 서브트리 전용 레이아웃.
// 베소라 LanguageProvider 를 /share 안에서만 적용 + 다바르 보라 배경(테마 일치).
import { LanguageProvider } from "@/lib/besora/LanguageContext";
import { theme } from "@/lib/theme";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: theme.bgGrad, color: theme.text }}>
      <LanguageProvider>{children}</LanguageProvider>
    </div>
  );
}
