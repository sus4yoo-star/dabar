import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/lib/AuthGate";
import { I18nProvider } from "@/lib/i18n";
import ChunkGuard from "./ChunkGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://dabar.theamov.com"),
  title: "DABAR · 다바르",
  description: "성경 퀴즈 · 양육 · 복음 전하기 — 말씀을 즐겁게, 함께 자라요 🕊️",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DABAR" },
  openGraph: {
    title: "DABAR · 다바르",
    description: "성경 퀴즈 · 양육 · 복음 전하기 — 말씀을 즐겁게, 함께 자라요 🕊️",
    url: "https://dabar.theamov.com",
    siteName: "DABAR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "DABAR · 다바르" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DABAR · 다바르",
    description: "성경 퀴즈 · 양육 · 복음 전하기 — 말씀을 즐겁게, 함께 자라요 🕊️",
    images: ["/og.png"],
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
      <head><link rel="apple-touch-icon" href="/icons/icon-192.png" /></head>
      <body>
        <ChunkGuard />
        <I18nProvider>
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
