"use client";

import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import ShareSection from "@/components/besora/ShareSection";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { TRAININGS, TRAIN_INTRO } from "@/lib/besora/training";

// 도구 정체성 색(ToolCard 의 GRAD 와 동일 톤)
const GRAD: Record<string, { bg: string; dark?: boolean }> = {
  gold:    { bg: "linear-gradient(135deg,#D9B154,#B0821A)" },
  crimson: { bg: "linear-gradient(135deg,#C2493A,#8C2A20)" },
  parch:   { bg: "linear-gradient(135deg,#EDE7D8,#DAD2BF)", dark: true },
  green:   { bg: "linear-gradient(135deg,#3E9B6E,#236245)" },
  violet:  { bg: "linear-gradient(135deg,#7C6CB0,#534878)" },
};

// 전도자 교육 허브 — 5가지 도구를 깊이 이해·훈련하는 입구.
export default function TrainHome() {
  const { myLang } = useLang();

  return (
    <AppShell title={ui(myLang, "trainTitle")} subtitle={ui(myLang, "trainSub")}>
      {/* 도구보다 먼저: 전도자의 마음가짐(기본기) */}
      <div style={{ background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", borderLeft: "3px solid var(--t-sacred)", borderRadius: 14, padding: "14px 16px", margin: "2px 0 4px" }}>
        <p className="serif" style={{ fontSize: 15, fontWeight: 800, color: "var(--t-sacred)", margin: "0 0 8px" }}>🕊️ {TRAIN_INTRO.heading}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {TRAIN_INTRO.points.map((p, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.6, color: theme.text }}>
              <span aria-hidden style={{ color: "var(--t-sacred)", flexShrink: 0 }}>✦</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <ShareSection icon="grad">도구별 교육</ShareSection>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TRAININGS.map((t) => {
          const g = GRAD[t.color] ?? GRAD.gold;
          const fg = g.dark ? "#2A2440" : "#ffffff";
          return (
            <Link key={t.slug} href={`/share/train/${t.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ borderRadius: 18, background: g.bg, padding: "14px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span className="serif" style={{ fontSize: 18, fontWeight: 800, color: fg }}>{t.name}</span>
                  <span aria-hidden style={{ fontSize: 16, color: fg, opacity: 0.85 }}>›</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.45, color: fg, opacity: 0.9 }}>{t.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 11.5, lineHeight: 1.6, color: theme.textMuted }}>
        각 도구를 눌러 한눈에 · 복음의 핵심 · 단계별 이해 · 자주 나오는 질문 · 현장 팁 · 스스로 점검까지 익혀 보세요.
      </p>
    </AppShell>
  );
}
