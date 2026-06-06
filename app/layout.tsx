import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/lib/AuthGate";

export const metadata: Metadata = {
  title: "DABAR · 다바르",
  description: "말씀 퀴즈 — 성경을 즐겁게 배워요",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DABAR" },
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
