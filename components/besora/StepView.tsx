"use client";

import type { RenderedStep } from "@/lib/besora/types";
import { theme } from "@/lib/theme";
import AudioButton from "@/components/besora/AudioButton";
import Sketch from "@/components/besora/Sketch";
import { ui } from "@/lib/besora/i18n";

// color 단계용 배경 (사영리 색깔책 등)
const CARD_BG: Record<string, { bg: string; fg: string }> = {
  gold:    { bg: "radial-gradient(circle at 32% 20%,#F8DC86,#D89E22 72%)", fg: "#fff" },
  ink:     { bg: "radial-gradient(circle at 32% 20%,#463E59,#14111c 76%)", fg: "#fff" },
  crimson: { bg: "radial-gradient(circle at 32% 20%,#E4604A,#9F2618 76%)", fg: "#fff" },
  parch:   { bg: "radial-gradient(circle at 32% 20%,#ffffff,#E4DDCC 82%)", fg: "#2A2440" },
  green:   { bg: "radial-gradient(circle at 32% 20%,#7FC79A,#357A56 78%)", fg: "#fff" },
};

// 글없는책 색 카드 위에 얹는 상징 (단색 카드가 밋밋하지 않도록)
const COLOR_SYMBOL: Record<string, string> = {
  // 하트 — 하나님의 사랑
  gold: "M24 40C10 30 5 20 11 13c4-5 10-3 13 2 3-5 9-7 13-2 6 7 1 17-13 27Z",
  // 번개(균열) — 죄로 인한 단절
  ink: "M27 5 12 27h9l-5 16 19-25h-10l5-13z",
  // 십자가 — 예수님의 피로 치른 값
  crimson: "M20 8h8v12h12v8H28v16h-8V28H8v-8h12z",
  // 빛나는 별 — 눈처럼 깨끗함
  parch: "M24 5l4.5 13.5L42 23l-13.5 4.5L24 41l-4.5-13.5L6 23l13.5-4.5z",
  // 새싹 — 매일 자라나는 새 생명
  green: "M24 42V20M24 24c-9 0-15-5-15-14 9 0 15 5 15 14zM24 22c0-7 5-12 13-12 0 7-5 12-13 12z",
};

function ColorSymbol({ colorKey, fg }: { colorKey: string; fg: string }) {
  const d = COLOR_SYMBOL[colorKey];
  if (!d) return null;
  const filled = colorKey === "gold" || colorKey === "crimson" || colorKey === "parch";
  return (
    <svg viewBox="0 0 48 48" width={62} height={62} style={{ marginBottom: 8, opacity: 0.95, filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.18))" }}>
      <path d={d} fill={filled ? fg : "none"} stroke={fg} strokeWidth={filled ? 0 : 3} strokeLinecap="round" strokeLinejoin="round" opacity={filled ? 0.95 : 0.92} />
    </svg>
  );
}

// 로마서(말씀) 카드용 — 두루마리/길 모티프
function VerseMotif() {
  return (
    <svg viewBox="0 0 48 36" width={58} height={44} fill="none" style={{ marginBottom: 10, opacity: 0.9 }}>
      <path d="M6 30 Q24 18 42 30" stroke={theme.gold} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M6 30 Q24 18 42 30" stroke={theme.gold} strokeWidth={2.6} strokeDasharray="0.5 6" strokeLinecap="round" opacity={0.5} transform="translate(0 5)" />
      <rect x={22} y={6} width={4} height={16} rx={2} fill={theme.gold} />
      <rect x={16} y={11} width={16} height={4} rx={2} fill={theme.gold} />
    </svg>
  );
}

export default function StepView({
  step, seekerLang, myLang, rtl,
}: {
  step: RenderedStep; seekerLang: string; myLang: string; rtl: boolean;
}) {
  const isColor = step.kind === "color" && step.color_key;
  const isVerse = step.kind === "verse";
  const skin = isColor ? CARD_BG[step.color_key as string] : null;
  const bg = skin?.bg ?? "linear-gradient(160deg,#f4faff,#e7f2fb)";
  const fg = skin?.fg ?? theme.text;
  const showBoth = myLang !== seekerLang && (step.helper.title || step.helper.body);
  const verseRef = step.seeker.verse_ref;

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div
        className="fade-in"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          position: "relative", display: "flex", flex: 1, flexDirection: "column",
          alignItems: "center", justifyContent: "center", overflow: "hidden",
          borderRadius: 28, background: bg, color: fg, padding: 40, textAlign: "center",
          boxShadow: "0 22px 54px -28px rgba(23,50,73,0.35)",
        }}
      >
        {step.kind === "diagram" && <Sketch k={step.sketch_key} />}
        {isColor && <ColorSymbol colorKey={step.color_key as string} fg={fg} />}
        {isVerse && <VerseMotif />}

        {verseRef && (
          <span style={{ marginBottom: 14, display: "inline-block", padding: "4px 14px", borderRadius: 999, background: skin ? "rgba(255,255,255,0.18)" : theme.goldLight, color: skin ? fg : theme.gold, fontFamily: "'Noto Serif KR',serif", fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>
            {verseRef}
          </span>
        )}

        {/* 상대 언어 — 주인공 */}
        <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "clamp(26px,7.5vw,38px)", fontWeight: 700, lineHeight: 1.18, margin: 0 }}>
          {step.seeker.title}
        </h2>
        <p style={{ marginTop: 16, maxWidth: 460, fontSize: 18, lineHeight: 1.62, opacity: 0.95 }}>{step.seeker.body}</p>

        {/* 전도자용 코칭 멘트 (내 언어) — 상대 언어와 내 언어 사이에 */}
        {step.helper.guide && (
          <div style={{ marginTop: 20, width: "100%", maxWidth: 460, display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left", borderRadius: 12, padding: "9px 12px", background: skin ? "rgba(255,255,255,0.16)" : theme.primaryBg, border: `1px solid ${skin ? "rgba(255,255,255,0.32)" : theme.cardBorder}` }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>💬</span>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: skin ? fg : theme.textMuted, opacity: skin ? 0.95 : 1 }}>{step.helper.guide}</p>
          </div>
        )}

        {/* 내 언어 — 보조 */}
        {showBoth && (
          <>
            <div style={{ margin: "20px 0", height: 1, width: 48, background: "currentColor", opacity: 0.2 }} />
            {step.helper.verse_ref && (
              <span style={{ marginBottom: 8, display: "inline-block", fontFamily: "'Noto Serif KR',serif", fontSize: 13, fontWeight: 700, opacity: 0.7 }}>
                {step.helper.verse_ref}
              </span>
            )}
            <h3 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 600, lineHeight: 1.35, opacity: 0.95, margin: 0 }}>{step.helper.title}</h3>
            {step.helper.body && <p style={{ marginTop: 6, maxWidth: 460, fontSize: 14.5, lineHeight: 1.6, opacity: 0.85 }}>{step.helper.body}</p>}
          </>
        )}

        <div style={{ marginTop: 26 }}>
          <AudioButton
            text={`${step.seeker.title}. ${step.seeker.body}`}
            lang={seekerLang}
            audioUrl={step.seeker.audio_url}
            label={ui(myLang, "listen")}
          />
        </div>
      </div>
    </div>
  );
}
