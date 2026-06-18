import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/lib/AuthGate";
import { I18nProvider } from "@/lib/i18n";
import ChunkGuard from "./ChunkGuard";
import OfflineBanner from "@/components/OfflineBanner";
import ErrorReporter from "@/components/ErrorReporter";

export const metadata: Metadata = {
  metadataBase: new URL("https://dabar.theamov.com"),
  title: "DABAR · 다바르",
  description: "복음 전하기 · 다국어 통역 · 이미지 번역 · 성경 퀴즈 · 소그룹 · 긴급 SOS — 선교 현장의 동행자 🕊️",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DABAR" },
  openGraph: {
    title: "DABAR · 다바르 — 선교 현장의 동행자",
    description: "복음 전하기 · 다국어 통역 · 이미지 번역 · 성경 퀴즈 · 소그룹 · 긴급 SOS",
    url: "https://dabar.theamov.com",
    siteName: "DABAR",
    images: [{ url: "/og.png?v=3", width: 1200, height: 630, alt: "DABAR · 다바르 — 선교 현장의 동행자" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DABAR · 다바르 — 선교 현장의 동행자",
    description: "복음 전하기 · 다국어 통역 · 이미지 번역 · 성경 퀴즈 · 소그룹 · 긴급 SOS",
    images: ["/og.png?v=3"],
  },
};

// Next 14 권장 방식: themeColor / viewport 는 metadata 가 아닌 viewport 로 분리
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // iOS Safari: 입력창 탭 시 자동 확대(줌) 방지
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* 페인트 전에 저장된 언어로 html lang/dir 설정 — 하이드레이션 불일치·RTL 깜빡임 방지(정적 스크립트, 사용자 입력 없음) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('dabar_lang');if(l){var e=document.documentElement;e.lang=l;e.dir=(l==='ar'||l==='fa'||l==='ur')?'rtl':'ltr';}}catch(e){}})();`,
          }}
        />
        {/* 화면 설정(큰 글씨·야간 모드)을 페인트 전에 적용 — 깜빡임 방지 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=document.documentElement;if(localStorage.getItem('dabar_bigtext')==='1')e.classList.add('big-text');if(localStorage.getItem('dabar_night')==='1'){e.classList.add('night');document.addEventListener('DOMContentLoaded',function(){var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content','#0e1620');});}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ChunkGuard />
        <ErrorReporter />
        <I18nProvider>
          <OfflineBanner />
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
