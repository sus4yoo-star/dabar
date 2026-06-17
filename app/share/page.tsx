"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import ToolCard from "@/components/besora/ToolCard";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { fetchTools } from "@/lib/besora/content";
import type { Tool } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

// 복음 전하기 허브 — 상단 언어선택은 제거(언어는 아래 음성 통역에서 선택).
export default function ShareHome() {
  const { myLang, ready } = useLang();
  const [tools, setTools] = useState<Tool[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    setErr(null);
    fetchTools().then(setTools).catch((e) => setErr(e.message));
  }
  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <p style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, lineHeight: 1.25, color: theme.text, margin: "0 0 14px" }}>{ui(myLang, "tagline")}</p>

      {err && (
        <div style={{ marginBottom: 14, borderRadius: 12, border: `1px solid ${theme.wrong}`, background: theme.wrongBg, padding: 16, fontSize: 14, color: theme.text, textAlign: "center" }}>
          <p style={{ margin: "0 0 10px", lineHeight: 1.5 }}>{ui(myLang, "errContent")}</p>
          <button onClick={load} style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer" }}>🔄 {ui(myLang, "retry")}</button>
        </div>
      )}

      {/* 전도 도구 5개: 2+2+1(와이드) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tools.slice(0, 4).map((t) => <ToolCard key={t.id} tool={t} />)}
        {tools[4] && <div style={{ gridColumn: "span 2" }}><ToolCard tool={tools[4]} wide /></div>}
      </div>

      {/* 🎤 음성 통역 — 언어 선택도 여기서 (내 언어 ↔ 상대 언어) */}
      <VoiceTranslator inline />

      {!ready && <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: theme.textMuted }}>…</p>}
    </AppShell>
  );
}
