"use client";
// 📖 오늘의 말씀 — 홈 상단. 매일 앱을 여는 이유(로드맵 '매일 말씀공부').
// 본문은 lib/besora/verses(각 언어 공인·표준역에서 추출)를 재사용 → 번역 품질 보장.
// 날짜(연중 일수) 기반 순환이라 하루 동안은 같은 구절, 매일 자동으로 바뀐다.
import { useMemo } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { gospelPassages } from "@/lib/besora/verses";

export default function DailyVerse() {
  const { t, lang } = useI18n();

  const verse = useMemo(() => {
    const list = gospelPassages(lang);
    if (!list.length) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const day = Math.floor((now.getTime() - start.getTime()) / 86400000); // 연중 일수(1~366)
    return list[day % list.length];
  }, [lang]);

  if (!verse) return null;

  return (
    <div className="fade-in" style={{ textAlign: "left", background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", borderLeft: "3px solid var(--t-sacred)", borderRadius: 13, padding: "9px 13px", marginBottom: 8 }}>
      <p style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize: 10.5, fontWeight: 800, color: "var(--t-sacred)", letterSpacing: 1.1, margin: "0 0 4px" }}>
        <span>✦ {t("home.dailyVerse")}</span>
        <span style={{ fontSize: 11, letterSpacing: 0.2, whiteSpace: "nowrap" }}>{verse.label}</span>
      </p>
      <p style={{ fontFamily: "'Iowan Old Style',Georgia,'Noto Serif KR',serif", fontSize: 13.5, lineHeight: 1.55, color: theme.text, fontStyle: "italic", margin: 0 }}>
        “{verse.text}”
      </p>
    </div>
  );
}
