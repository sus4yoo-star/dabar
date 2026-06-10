"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDecision, logSession } from "@/lib/besora/content";
import type { DecisionContent } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import AudioButton from "@/components/besora/AudioButton";

type Phase = "ask" | "pray" | "welcome";

export default function DecisionFlow({
  toolSlug,
  onAgain,
}: {
  toolSlug: string;
  onAgain: () => void;
}) {
  const router = useRouter();
  const { myLang, seekerLang, rtlFor } = useLang();
  const [phase, setPhase] = useState<Phase>("ask");
  const [seeker, setSeeker] = useState<DecisionContent | null>(null);
  const [helper, setHelper] = useState<DecisionContent | null>(null);
  const rtl = rtlFor(seekerLang);

  useEffect(() => {
    fetchDecision(seekerLang).then(setSeeker).catch(() => setSeeker(null));
    fetchDecision(myLang).then(setHelper).catch(() => setHelper(null));
  }, [seekerLang, myLang]);

  function finishPrayer() {
    logSession({ toolSlug, seekerLanguage: seekerLang, decided: true }).catch(() => {});
    setPhase("welcome");
  }
  function notNow() {
    logSession({ toolSlug, seekerLanguage: seekerLang, decided: false }).catch(() => {});
    onAgain();
  }

  if (!seeker) return null;
  const dual = myLang !== seekerLang && !!helper;
  const Divider = () => <div className="my-5 h-px w-12 bg-current opacity-20" />;

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="animate-rise flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_18%,#322a4d,#15121E_72%)] p-10 text-center text-gospel-parch shadow-[0_26px_64px_-30px_rgba(0,0,0,0.75)]"
        dir={rtl ? "rtl" : "ltr"}
      >
        {phase === "ask" && (
          <>
            <h2 className="font-serif text-[clamp(28px,8vw,38px)] font-semibold leading-tight">
              {seeker.ask_title}
            </h2>
            {seeker.ask_body && (
              <p className="mt-4 max-w-md text-base leading-relaxed opacity-90">
                {seeker.ask_body}
              </p>
            )}
            {dual && (
              <>
                <Divider />
                <h3 className="font-serif text-xl font-semibold opacity-95">
                  {helper!.ask_title}
                </h3>
                {helper!.ask_body && (
                  <p className="mt-1.5 max-w-md text-[15px] leading-relaxed opacity-85">
                    {helper!.ask_body}
                  </p>
                )}
              </>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setPhase("pray")}
                className="rounded-full bg-gospel-crimson px-8 py-3 font-semibold text-white active:scale-95"
              >
                {ui(myLang, "yes")}
              </button>
              <button onClick={notNow} className="text-sm text-muted underline">
                {ui(myLang, "notNow")}
              </button>
            </div>
          </>
        )}

        {phase === "pray" && (
          <>
            <p className="font-serif text-2xl text-gospel-gold">✝</p>
            <p className="mt-4 max-w-md text-[26px] leading-relaxed">{seeker.prayer_text}</p>
            <div className="mt-6">
              <AudioButton
                text={seeker.prayer_text}
                lang={seekerLang}
                audioUrl={seeker.audio_url}
                label={ui(myLang, "listen")}
              />
            </div>
            {dual && (
              <>
                <Divider />
                <p className="max-w-md text-[15px] leading-relaxed opacity-85">
                  {helper!.prayer_text}
                </p>
              </>
            )}
            <button
              onClick={finishPrayer}
              className="mt-8 rounded-full bg-gospel-green px-8 py-3 font-semibold text-white active:scale-95"
            >
              {ui(myLang, "amen")}
            </button>
          </>
        )}

        {phase === "welcome" && (
          <>
            <h2 className="font-serif text-[clamp(30px,9vw,42px)] font-semibold text-gospel-green">
              {seeker.welcome_title}
            </h2>
            {seeker.welcome_body && (
              <p className="mt-4 max-w-md text-base leading-relaxed opacity-90">
                {seeker.welcome_body}
              </p>
            )}
            {dual && (
              <>
                <Divider />
                <h3 className="font-serif text-xl font-semibold text-gospel-green opacity-95">
                  {helper!.welcome_title}
                </h3>
                {helper!.welcome_body && (
                  <p className="mt-1.5 max-w-md text-[15px] leading-relaxed opacity-85">
                    {helper!.welcome_body}
                  </p>
                )}
              </>
            )}
            {/* 전도 → 양육 연결: 다바르 새가족(새신자) 코스로 */}
            <button
              onClick={() => router.push("/course/newcomer")}
              className="mt-10 rounded-full bg-gospel-gold px-8 py-3 font-semibold text-ink active:scale-95"
            >
              {ui(myLang, "growStart")} →
            </button>
            <button
              onClick={onAgain}
              className="mt-3 rounded-full border border-white/20 px-8 py-3 text-gospel-parch active:scale-95"
            >
              {ui(myLang, "again")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
