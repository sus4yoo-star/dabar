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

export default function StepView({
  step, seekerLang, myLang, rtl,
}: {
  step: RenderedStep; seekerLang: string; myLang: string; rtl: boolean;
}) {
  const isColor = step.kind === "color" && step.color_key;
  const skin = isColor ? CARD_BG[step.color_key as string] : null;
  const bg = skin?.bg ?? "linear-gradient(160deg,#16557e,#0a2236)";
  const fg = skin?.fg ?? theme.text;
  const showBoth = myLang !== seekerLang && (step.helper.title || step.helper.body);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div
        className="fade-in"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          position: "relative", display: "flex", flex: 1, flexDirection: "column",
          alignItems: "center", justifyContent: "center", overflow: "hidden",
          borderRadius: 28, background: bg, color: fg, padding: 40, textAlign: "center",
          boxShadow: "0 26px 64px -30px rgba(0,0,0,0.75)",
        }}
      >
        {step.kind === "diagram" && <Sketch k={step.sketch_key} />}
        {step.verse_ref && (
          <p style={{ marginBottom: 12, fontFamily: "'Noto Serif KR',serif", fontSize: 18, opacity: 0.85 }}>{step.verse_ref}</p>
        )}

        {/* 상대 언어 — 주인공 */}
        <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "clamp(28px,8vw,40px)", fontWeight: 700, lineHeight: 1.15, margin: 0 }}>
          {step.seeker.title}
        </h2>
        <p style={{ marginTop: 16, maxWidth: 460, fontSize: 19, lineHeight: 1.6, opacity: 0.95 }}>{step.seeker.body}</p>

        {/* 내 언어 — 보조 */}
        {showBoth && (
          <>
            <div style={{ margin: "20px 0", height: 1, width: 48, background: "currentColor", opacity: 0.2 }} />
            <h3 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 600, lineHeight: 1.35, opacity: 0.95, margin: 0 }}>{step.helper.title}</h3>
            {step.helper.body && <p style={{ marginTop: 6, maxWidth: 460, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>{step.helper.body}</p>}
          </>
        )}

        <div style={{ marginTop: 28 }}>
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
