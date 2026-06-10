"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import StepView from "@/components/besora/StepView";
import DecisionFlow from "@/components/besora/DecisionFlow";
import { fetchTool, fetchRenderedSteps } from "@/lib/besora/content";
import type { Tool, RenderedStep } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

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

  useEffect(() => { fetchTool(slug).then(setTool).catch(() => setTool(null)); }, [slug]);

  useEffect(() => {
    if (!tool || !seekerLang) { setLoading(false); return; }
    setLoading(true);
    fetchRenderedSteps(tool.id, seekerLang, myLang)
      .then((s) => { setSteps(s); setIdx(0); setInDecision(false); })
      .catch(() => setSteps([]))
      .finally(() => setLoading(false));
  }, [tool, seekerLang, myLang]);

  // 1) 상대 언어 미설정 → 선택 게이트
  if (!seekerLang) {
    return (
      <AppShell>
        <h1 style={{ marginBottom: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 24, fontWeight: 600, color: theme.text }}>{ui(myLang, "setSeekerLanguage")}</h1>
        <p style={{ marginBottom: 24, fontSize: 14, color: theme.textMuted }}>{tool?.name_ko ?? slug}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {languages.map((l) => (
            <button key={l.code} onClick={() => setSeekerLang(l.code)}
              style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 16, textAlign: "left", cursor: "pointer" }}>
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
            <span key={i} style={{ height: 6, flex: 1, borderRadius: 999, background: i <= idx ? theme.gold : "rgba(13,52,84,0.12)" }} />
          ))}
        </div>
      )}

      {inDecision ? (
        <DecisionFlow toolSlug={slug} onAgain={() => router.push("/share")} />
      ) : current ? (
        <>
          <StepView step={current} seekerLang={seekerLang} myLang={myLang} rtl={rtlFor(seekerLang)} />
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
              style={{ borderRadius: 999, padding: "12px 20px", fontSize: 14, color: theme.textMuted, background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1 }}>
              {ui(myLang, "prev")}
            </button>
            <button onClick={() => setInDecision(true)} style={{ fontSize: 14, color: theme.wrong, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{ui(myLang, "toDecision")}</button>
            <button onClick={next} style={{ borderRadius: 999, background: theme.gold, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#08263a", border: "none", cursor: "pointer" }}>{atEnd ? ui(myLang, "toDecision") : ui(myLang, "next")}</button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: theme.textMuted }}>
          <p>아직 이 언어의 콘텐츠가 없어요.</p>
          <button onClick={reset} style={{ marginTop: 16, color: theme.gold, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{ui(myLang, "home")}</button>
        </div>
      )}
    </AppShell>
  );
}
