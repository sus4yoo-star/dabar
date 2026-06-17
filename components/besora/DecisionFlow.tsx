"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { fetchDecision, logSession } from "@/lib/besora/content";
import type { DecisionContent } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import AudioButton from "@/components/besora/AudioButton";

type Phase = "ask" | "pray" | "welcome";

export default function DecisionFlow({ toolSlug, onAgain }: { toolSlug: string; onAgain: () => void }) {
  const router = useRouter();
  const { myLang, seekerLang, rtlFor } = useLang();
  const [phase, setPhase] = useState<Phase>("ask");
  const [seeker, setSeeker] = useState<DecisionContent | null>(null);
  const [helper, setHelper] = useState<DecisionContent | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const rtl = rtlFor(seekerLang);

  useEffect(() => {
    // cancelled 가드: 언어를 바꾸면 느린 이전 응답이 새 콘텐츠를 덮어쓰지 않게
    let cancelled = false;
    setLoaded(false);
    Promise.allSettled([fetchDecision(seekerLang), fetchDecision(myLang)]).then(([s, h]) => {
      if (cancelled) return;
      setSeeker(s.status === "fulfilled" ? s.value : null);
      setHelper(h.status === "fulfilled" ? h.value : null);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [seekerLang, myLang, reloadKey]);

  function finishPrayer() {
    logSession({ toolSlug, seekerLanguage: seekerLang, decided: true }).catch(() => {});
    setPhase("welcome");
  }
  function notNow() {
    logSession({ toolSlug, seekerLanguage: seekerLang, decided: false }).catch(() => {});
    onAgain();
  }

  // 로딩 끝났는데 콘텐츠가 없으면(오프라인/네트워크 실패) 빈 화면 대신 안내 + 다시 시도
  if (!seeker) {
    if (!loaded) return null;
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 16, color: theme.textMuted }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{ui(myLang, "noContent")}</p>
        <button onClick={() => setReloadKey((k) => k + 1)} style={{ borderRadius: 999, background: theme.primary, color: "#fff", border: "none", padding: "12px 28px", fontWeight: 700, cursor: "pointer" }}>{ui(myLang, "retry")}</button>
      </div>
    );
  }
  const dual = myLang !== seekerLang && !!helper;
  const Divider = () => <div style={{ margin: "20px 0", height: 1, width: 48, background: "currentColor", opacity: 0.2 }} />;
  const pillCrimson = { borderRadius: 999, background: "#C9402F", padding: "12px 32px", fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" } as const;
  const pillGreen = { borderRadius: 999, background: theme.correct, padding: "12px 32px", fontWeight: 700, color: "#ffffff", border: "none", cursor: "pointer" } as const;
  const pillGold = { borderRadius: 999, background: theme.gold, padding: "12px 32px", fontWeight: 800, color: "#08263a", border: "none", cursor: "pointer" } as const;

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div
        className="fade-in"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center",
          overflow: "hidden", borderRadius: 28, background: "radial-gradient(circle at 50% 18%,#f2f9ff,#e3f1fc 72%)",
          color: theme.text, padding: 40, textAlign: "center", boxShadow: "0 22px 54px -28px rgba(23,50,73,0.35)",
        }}
      >
        {phase === "ask" && (
          <>
            <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "clamp(26px,7vw,36px)", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{seeker.ask_title}</h2>
            {seeker.ask_body && <p style={{ marginTop: 16, maxWidth: 460, fontSize: 16, lineHeight: 1.6, opacity: 0.9 }}>{seeker.ask_body}</p>}
            {dual && (
              <>
                <Divider />
                <h3 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 600, opacity: 0.95, margin: 0 }}>{helper!.ask_title}</h3>
                {helper!.ask_body && <p style={{ marginTop: 6, maxWidth: 460, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>{helper!.ask_body}</p>}
              </>
            )}
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setPhase("pray")} style={pillCrimson}>{ui(myLang, "yes")}</button>
              <button onClick={notNow} style={{ fontSize: 14, color: theme.textMuted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{ui(myLang, "notNow")}</button>
            </div>
          </>
        )}

        {phase === "pray" && (
          <>
            <p style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 24, color: theme.gold, margin: 0 }}>✝</p>
            <p style={{ marginTop: 16, maxWidth: 460, fontSize: 26, lineHeight: 1.6 }}>{seeker.prayer_text}</p>
            <div style={{ marginTop: 24 }}>
              <AudioButton text={seeker.prayer_text} lang={seekerLang} audioUrl={seeker.audio_url} label={ui(myLang, "listen")} />
            </div>
            {dual && (<><Divider /><p style={{ maxWidth: 460, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>{helper!.prayer_text}</p></>)}
            <button onClick={finishPrayer} style={{ ...pillGreen, marginTop: 32 }}>{ui(myLang, "amen")}</button>
          </>
        )}

        {phase === "welcome" && (
          <>
            <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: "clamp(30px,9vw,42px)", fontWeight: 700, color: theme.correct, margin: 0 }}>{seeker.welcome_title}</h2>
            {seeker.welcome_body && <p style={{ marginTop: 16, maxWidth: 460, fontSize: 16, lineHeight: 1.6, opacity: 0.9 }}>{seeker.welcome_body}</p>}
            {dual && (
              <>
                <Divider />
                <h3 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 600, color: theme.correct, opacity: 0.95, margin: 0 }}>{helper!.welcome_title}</h3>
                {helper!.welcome_body && <p style={{ marginTop: 6, maxWidth: 460, fontSize: 15, lineHeight: 1.6, opacity: 0.85 }}>{helper!.welcome_body}</p>}
              </>
            )}
            {/* 전도 → 동행 연결: 채팅으로 양육을 이어가기 */}
            <button onClick={() => router.push("/share/me")} style={{ ...pillGold, marginTop: 40 }}>🤝 {ui(myLang, "inviteCreate")}</button>
            {/* 전도 → 양육 연결: 다바르 새가족(새신자) 코스로 */}
            <button onClick={() => router.push("/course/newcomer")} style={{ marginTop: 12, borderRadius: 999, background: theme.primaryBg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}`, padding: "12px 32px", fontWeight: 700, cursor: "pointer" }}>{ui(myLang, "growStart")} →</button>
            <button onClick={onAgain} style={{ marginTop: 12, borderRadius: 999, border: `1px solid ${theme.border}`, padding: "12px 32px", color: theme.text, background: "transparent", cursor: "pointer" }}>{ui(myLang, "again")}</button>
          </>
        )}
      </div>
    </div>
  );
}
