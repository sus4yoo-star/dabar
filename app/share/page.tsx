"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import ToolCard from "@/components/besora/ToolCard";
import { fetchTools } from "@/lib/besora/content";
import type { Tool } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function ShareHome() {
  const { myLang, seekerLang, setSeekerLang, languages, ready } = useLang();
  const [tools, setTools] = useState<Tool[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pick, setPick] = useState(false);

  useEffect(() => {
    fetchTools().then(setTools).catch((e) => setErr(e.message));
  }, []);

  const seekerName = languages.find((l) => l.code === seekerLang)?.name_native;

  return (
    <AppShell>
      {/* 태그라인 + 기록 */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: theme.text, margin: 0 }}>{ui(myLang, "tagline")}</p>
        <Link href="/share/me" style={{ marginTop: 2, flexShrink: 0, borderRadius: 999, border: `1px solid ${theme.cardBorder}`, padding: "6px 12px", fontSize: 12, color: theme.gold, textDecoration: "none", whiteSpace: "nowrap" }}>{ui(myLang, "myRecords")} →</Link>
      </div>

      {/* 상대 언어 선택 */}
      <button onClick={() => setPick((v) => !v)} style={{ marginBottom: 12, display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 16, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, padding: "10px 16px", textAlign: "left", cursor: "pointer" }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: theme.textMuted }}>{ui(myLang, "seekerLanguage")}</span>
        <span style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 600, color: theme.gold }}>{seekerName ?? ui(myLang, "setSeekerLanguage")}</span>
      </button>

      {pick && (
        <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {languages.map((l) => (
            <button key={l.code} onClick={() => { setSeekerLang(l.code); setPick(false); }}
              style={{ borderRadius: 12, padding: "8px", fontSize: 14, cursor: "pointer", border: "none", background: l.code === seekerLang ? theme.gold : theme.card, color: l.code === seekerLang ? "#241246" : theme.text, fontWeight: l.code === seekerLang ? 800 : 500 }}>
              {l.name_native}
            </button>
          ))}
        </div>
      )}

      {err && (
        <div style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${theme.wrong}`, background: theme.wrongBg, padding: 16, fontSize: 14, color: theme.text }}>
          전도 콘텐츠를 불러오지 못했어요. (Supabase 의 besora 스키마/콘텐츠 확인)
          <span style={{ marginTop: 4, display: "block", fontSize: 12, color: theme.textMuted }}>{err}</span>
        </div>
      )}

      {/* 도구 5개: 2+2+1(와이드) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tools.slice(0, 4).map((t) => <ToolCard key={t.id} tool={t} />)}
        {tools[4] && <div style={{ gridColumn: "span 2" }}><ToolCard tool={tools[4]} wide /></div>}
      </div>

      {!ready && <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: theme.textMuted }}>…</p>}
    </AppShell>
  );
}
