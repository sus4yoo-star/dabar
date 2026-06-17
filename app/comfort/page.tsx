"use client";

import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import HomeComfort from "@/components/HomeComfort";

// 💛 마음에 닿는 말씀 — 지금 감정/상황(글·사진)에 맞는 위로의 성구를 받는 페이지.
export default function ComfortPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("cf.title")}</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("r.home")}</button>
      </div>
      <HomeComfort />
    </main>
  );
}
