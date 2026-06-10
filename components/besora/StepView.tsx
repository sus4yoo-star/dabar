"use client";

import type { RenderedStep } from "@/lib/besora/types";
import AudioButton from "@/components/besora/AudioButton";
import Sketch from "@/components/besora/Sketch";
import { ui } from "@/lib/besora/i18n";

const CARD_BG: Record<string, string> = {
  gold: "text-white bg-[radial-gradient(circle_at_32%_20%,#F8DC86,#D89E22_72%)]",
  ink: "text-white bg-[radial-gradient(circle_at_32%_20%,#463E59,#14111c_76%)]",
  crimson: "text-white bg-[radial-gradient(circle_at_32%_20%,#E4604A,#9F2618_76%)]",
  parch: "text-ink bg-[radial-gradient(circle_at_32%_20%,#ffffff,#E4DDCC_82%)]",
  green: "text-white bg-[radial-gradient(circle_at_32%_20%,#7FC79A,#357A56_78%)]",
};

export default function StepView({
  step,
  seekerLang,
  myLang,
  rtl,
}: {
  step: RenderedStep;
  seekerLang: string;
  myLang: string;
  rtl: boolean;
}) {
  const isColor = step.kind === "color" && step.color_key;
  const bg = isColor
    ? CARD_BG[step.color_key as string]
    : "text-gospel-parch bg-[linear-gradient(160deg,#241E33,#161220)]";
  const showBoth = myLang !== seekerLang && (step.helper.title || step.helper.body);

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={`animate-rise relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] ${bg} p-10 text-center shadow-[0_26px_64px_-30px_rgba(0,0,0,0.75)]`}
        dir={rtl ? "rtl" : "ltr"}
      >
        {!isColor && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-18%] h-[52%] w-[78%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,178,60,0.2),transparent_72%)] blur-lg"
          />
        )}
        {step.kind === "diagram" && <Sketch k={step.sketch_key} />}
        {step.verse_ref && (
          <p className="relative mb-3 font-serif text-lg tracking-wide opacity-85">
            {step.verse_ref}
          </p>
        )}

        {/* 상대 언어 — 주인공 (가장 크게) */}
        <h2 className="relative font-serif text-[clamp(30px,9vw,42px)] font-semibold leading-[1.15] tracking-tight">
          {step.seeker.title}
        </h2>
        <p className="relative mt-4 max-w-md text-xl leading-relaxed opacity-95">
          {step.seeker.body}
        </p>

        {/* 내 언어 — 같은 카드 안, 작지만 또렷하게 */}
        {showBoth && (
          <>
            <div className="relative my-5 h-px w-12 bg-current opacity-20" />
            <h3 className="relative font-serif text-xl font-semibold leading-snug opacity-95">
              {step.helper.title}
            </h3>
            {step.helper.body && (
              <p className="relative mt-1.5 max-w-md text-[15px] leading-relaxed opacity-85">
                {step.helper.body}
              </p>
            )}
          </>
        )}

        <div className="relative mt-7">
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
