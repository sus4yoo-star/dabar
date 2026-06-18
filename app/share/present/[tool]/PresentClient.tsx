"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import StepView from "@/components/besora/StepView";
import DecisionFlow from "@/components/besora/DecisionFlow";
import { fetchTool, fetchRenderedSteps } from "@/lib/besora/content";
import type { Tool, RenderedStep } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { needsServerTTS, prefetchTTS } from "@/lib/besora/speak";
import { versesFor } from "@/lib/besora/verses";

// 콘텐츠 좌우 중앙에 떠 있는 원형 화살표 버튼 스타일
// insetInlineStart/End 로 잡아 RTL(아랍어 등)에서 좌우가 자동으로 뒤집히게 한다.
function sideNav(side: "start" | "end"): CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: -6,
    transform: "translateY(-50%)",
    zIndex: 30,
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    background: "var(--t-glass)",
    border: `1px solid var(--t-sacredBorder)`,
    color: "var(--t-sacred)",
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(23,50,73,0.16)",
    backdropFilter: "blur(4px)",
  };
}

export default function PresentClient() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.tool);
  const { myLang, seekerLang, setSeekerLang, languages, rtlFor } = useLang();

  const [tool, setTool] = useState<Tool | null>(null);
  const [steps, setSteps] = useState<RenderedStep[]>([]);
  const [idx, setIdx] = useState(0);
  const [inDecision, setInDecision] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTool(slug).then((t) => { if (!cancelled) setTool(t); }).catch(() => { if (!cancelled) setTool(null); });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!tool || !seekerLang) { setLoading(false); return; }
    // cancelled 가드: 도구/언어를 빠르게 바꿔도 느린 이전 응답이 새 단계를 덮어쓰지 않게
    let cancelled = false;
    setLoading(true);
    fetchRenderedSteps(tool.id, seekerLang, myLang)
      .then((s) => { if (cancelled) return; setSteps(s); setIdx(0); setInDecision(false); })
      .catch(() => { if (!cancelled) setSteps([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tool, seekerLang, myLang]);

  // 현재·다음·이전 단계 음성을 미리 받아둠 → ▶ 즉시 재생 (라오스어 등 서버 TTS 언어만)
  useEffect(() => {
    if (!seekerLang || !needsServerTTS(seekerLang)) return;
    const cs = steps.filter((s) => s.kind !== "decision");
    const textOf = (s: RenderedStep) =>
      `${s.seeker.title}. ${s.seeker.body} ${versesFor(s.seeker.verse_ref ?? s.verse_ref, seekerLang).map((v) => v.text).join(" ")}`;
    [idx, idx + 1, idx - 1].forEach((j) => { const s = cs[j]; if (s) prefetchTTS(textOf(s), seekerLang); });
  }, [idx, seekerLang, steps]);

  // 1) 상대 언어 미설정 → 선택 게이트
  if (!seekerLang) {
    return (
      // 도구 이름은 DB 콘텐츠(번역 문자열 아님)라 부제로 그대로 표기. 제목은 기존 i18n 키.
      <AppShell title={ui(myLang, "setSeekerLanguage")} subtitle={tool?.name_ko ?? slug}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {languages.map((l) => (
            <button key={l.code} onClick={() => setSeekerLang(l.code)}
              style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 14, textAlign: "start", cursor: "pointer" }}>
              <span style={{ display: "block", fontWeight: 700, color: theme.text }}>{l.name_native}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>{l.name_en}</span>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return <AppShell><div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: theme.textMuted }}>…</div></AppShell>;
  }

  const contentSteps = steps.filter((s) => s.kind !== "decision");
  const atEnd = idx >= contentSteps.length - 1;
  const current = contentSteps[idx];

  function next() { if (atEnd) setInDecision(true); else setIdx((i) => i + 1); }
  function reset() { setIdx(0); setInDecision(false); }

  return (
    <AppShell>
      {!inDecision && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          {contentSteps.map((_, i) => (
            <span key={i} style={{ height: 6, flex: 1, borderRadius: 999, background: i <= idx ? "var(--t-sacred)" : "var(--t-border)" }} />
          ))}
        </div>
      )}

      {inDecision ? (
        <DecisionFlow toolSlug={slug} onAgain={() => router.push("/share")} />
      ) : current ? (
        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* 좌우 중앙 화살표 — 이전/다음 (RTL이면 방향·글리프가 자동으로 뒤집힘) */}
          {idx > 0 && (
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label={ui(myLang, "prev")} title={ui(myLang, "prev")}
              style={sideNav("start")}>{rtlFor(myLang) ? "›" : "‹"}</button>
          )}
          <button onClick={next} aria-label={atEnd ? ui(myLang, "toDecision") : ui(myLang, "next")} title={atEnd ? ui(myLang, "toDecision") : ui(myLang, "next")}
            style={sideNav("end")}>{rtlFor(myLang) ? "‹" : "›"}</button>

          <StepView step={current} seekerLang={seekerLang} myLang={myLang} rtl={rtlFor(seekerLang)} myRtl={rtlFor(myLang)} onDecision={() => setInDecision(true)} />
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: theme.textMuted }}>
          <p>{ui(myLang, "noContent")}</p>
          <button onClick={reset} style={{ marginTop: 16, color: "var(--t-sacred)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{ui(myLang, "home")}</button>
        </div>
      )}
    </AppShell>
  );
}
