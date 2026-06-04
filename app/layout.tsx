import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DABAR · 다바르",
  description: "말씀 퀴즈 — 성경을 즐겁게 배워요",
  manifest: "/manifest.json",
  themeColor: "#3b1f6b",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DABAR" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head><link rel="apple-touch-icon" href="/icons/icon-192.png" /></head>
      <body>{children}</body>
    </html>
  );
}
