// 베소라(전도) 서브트리 전용 레이아웃.
// - 베소라 LanguageProvider 를 /share 안에서만 적용 (다바르 기존 컨텍스트와 별개)
// - 베소라 다크(ink) 배경을 /share 영역에만 입힘 (다바르 보라색 홈은 그대로)
import { LanguageProvider } from "@/lib/besora/LanguageContext";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        color: "#f5f1e8",
        background:
          "radial-gradient(120% 70% at 50% -8%, rgba(227,178,60,0.13), transparent 58%)," +
          "radial-gradient(100% 55% at 50% 116%, rgba(90,164,118,0.10), transparent 60%)," +
          "#15121e",
      }}
    >
      <LanguageProvider>{children}</LanguageProvider>
    </div>
  );
}
