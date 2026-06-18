"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader, ACCENT } from "@/lib/ui";
import HomeComfort from "@/components/HomeComfort";

// 💛 마음에 닿는 말씀 — 지금 감정/상황(글·사진)에 맞는 위로의 성구를 받는 페이지. (앰버 컨셉)
export default function ComfortPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "0.9rem 1.25rem 2rem", minHeight: "100dvh" }}>
      <PageHeader title={t("cf.title")} subtitle={t("cf.sub")} onHome={() => router.push("/")} homeLabel={t("r.home")} accentColor={ACCENT.amber.fg} />
      <HomeComfort />
    </main>
  );
}
