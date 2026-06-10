"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  // 도구 메타 로드
  useEffect(() => {
    fetchTool(slug).then(setTool).catch(() => setTool(null));
  }, [slug]);

  // 상대 언어가 정해지면 단계 로드
  useEffect(() => {
    if (!tool || !seekerLang) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRenderedSteps(tool.id, seekerLang, myLang)
      .then((s) => {
        setSteps(s);
        setIdx(0);
        setInDecision(false);
      })
      .catch(() => setSteps([]))
      .finally(() => setLoading(false));
  }, [tool, seekerLang, myLang]);

  // 1) 상대 언어 미설정 → 빠른 선택 게이트
  if (!seekerLang) {
    return (
      <AppShell>
        <h1 className="mb-1 font-serif text-2xl font-semibold text-gospel-parch">
          {ui(myLang, "setSeekerLanguage")}
        </h1>
        <p className="mb-6 text-sm text-muted">{tool?.name_ko ?? slug}</p>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setSeekerLang(l.code)}
              className="rounded-2xl border border-white/10 bg-ink-2 px-4 py-4 text-left"
            >
              <span className="block font-semibold text-gospel-parch">
                {l.name_native}
              </span>
              <span className="text-xs text-muted">{l.name_en}</span>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center text-muted">…</div>
      </AppShell>
    );
  }

  const contentSteps = steps.filter((s) => s.kind !== "decision");
  const atEnd = idx >= contentSteps.length - 1;
  const current = contentSteps[idx];

  function next() {
    if (atEnd) setInDecision(true);
    else setIdx((i) => i + 1);
  }
  function reset() {
    setIdx(0);
    setInDecision(false);
  }

  return (
    <AppShell>
      {/* 진행 표시 */}
      {!inDecision && (
        <div className="mb-3 flex items-center gap-1.5">
          {contentSteps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= idx ? "bg-gospel-gold" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      )}

      {inDecision ? (
        <DecisionFlow toolSlug={slug} onAgain={() => router.push("/share")} />
      ) : current ? (
        <>
          <StepView
            step={current}
            seekerLang={seekerLang}
            myLang={myLang}
            rtl={rtlFor(seekerLang)}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="rounded-full px-5 py-3 text-sm text-muted disabled:opacity-30"
            >
              {ui(myLang, "prev")}
            </button>

            <button
              onClick={() => setInDecision(true)}
              className="text-sm text-gospel-crimson underline"
            >
              {ui(myLang, "toDecision")}
            </button>

            <button
              onClick={next}
              className="rounded-full bg-gospel-gold px-6 py-3 text-sm font-semibold text-ink active:scale-95"
            >
              {atEnd ? ui(myLang, "toDecision") : ui(myLang, "next")}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-muted">
          <p>아직 이 언어의 콘텐츠가 없어요.</p>
          <button onClick={reset} className="mt-4 text-gospel-gold underline">
            {ui(myLang, "home")}
          </button>
        </div>
      )}
    </AppShell>
  );
}
