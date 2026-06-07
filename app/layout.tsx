import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/lib/AuthGate";

export const metadata: Metadata = {
  metadataBase: new URL("https://dabar.theamov.com"),
  title: "DABAR · 다바르",
  description: "성경 퀴즈로 말씀을 즐겁게! 같이 풀고 랭킹에 도전해요 🏆",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DABAR" },
  openGraph: {
    title: "DABAR · 다바르 — 말씀 퀴즈",
    description: "성경 퀴즈로 말씀을 즐겁게! 같이 풀고 랭킹에 도전해요 🏆",
    url: "https://dabar.theamov.com",
    siteName: "DABAR",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "DABAR" }],
    locale: "ko_KR",
    type: "website",
  },
};

// Next 14 권장 방식: themeColor / viewport 는 metadata 가 아닌 viewport 로 분리
export const viewport: Viewport = {
  themeColor: "#3b1f6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head><link rel="apple-touch-icon" href="/icons/icon-192.png" /></head>
      <body>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
