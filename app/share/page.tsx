"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/besora/AppShell";
import ToolCard from "@/components/besora/ToolCard";
import { fetchTools } from "@/lib/besora/content";
import type { Tool } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function Home() {
  const { myLang, seekerLang, setSeekerLang, languages, ready } = useLang();
  const [tools, setTools] = useState<Tool[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pick, setPick] = useState(false);

  useEffect(() => {
    fetchTools()
      .then(setTools)
      .catch((e) => setErr(e.message));
  }, []);

  const seekerName = languages.find((l) => l.code === seekerLang)?.name_native;

  return (
    <AppShell>
      {/* 상단: 태그라인 + 기록 (기록을 위로) */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-serif text-2xl font-bold leading-tight text-gospel-parch">
          {ui(myLang, "tagline")}
        </p>
        <Link
          href="/share/me"
          className="mt-0.5 shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-gospel-gold"
        >
          {ui(myLang, "myRecords")} →
        </Link>
      </div>

      {/* 상대 언어: 크게(주인공), 탭하면 선택 */}
      <button
        onClick={() => setPick((v) => !v)}
        className="mb-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-gospel-gold/40 bg-gospel-gold/10 px-4 py-2.5 text-left"
      >
        <span className="text-[11px] uppercase tracking-wide text-gospel-parch/60">
          {ui(myLang, "seekerLanguage")}
        </span>
        <span className="font-serif text-2xl font-semibold text-gospel-gold">
          {seekerName ?? ui(myLang, "setSeekerLanguage")}
        </span>
      </button>

      {pick && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setSeekerLang(l.code);
                setPick(false);
              }}
              className={`rounded-xl px-2 py-2 text-sm ${
                l.code === seekerLang
                  ? "bg-gospel-gold font-semibold text-ink"
                  : "bg-ink-2 text-gospel-parch"
              }`}
            >
              {l.name_native}
            </button>
          ))}
        </div>
      )}

      {err && (
        <div className="mb-4 rounded-xl border border-gospel-crimson/40 bg-gospel-crimson/10 p-4 text-sm text-gospel-parch">
          콘텐츠를 불러오지 못했어요. Supabase 환경변수와 schema.sql 실행을 확인해 주세요.
          <span className="mt-1 block text-xs text-muted">{err}</span>
        </div>
      )}

      {/* 도구 5개: 2+2+1(와이드) → 폰 한 화면에 모두 */}
      <div className="grid grid-cols-2 gap-3">
        {tools.slice(0, 4).map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
        {tools[4] && (
          <div className="col-span-2">
            <ToolCard tool={tools[4]} wide />
          </div>
        )}
      </div>

      {!ready && <p className="mt-6 text-center text-xs text-muted">…</p>}
    </AppShell>
  );
}
