"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import MenuIcon from "@/components/MenuIcon";
import AppShell from "@/components/besora/AppShell";
import ShareSection from "@/components/besora/ShareSection";
import ToolCard from "@/components/besora/ToolCard";
import LanguageToggle from "@/components/besora/LanguageToggle";
import { fetchTools } from "@/lib/besora/content";
import type { Tool } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { useI18n } from "@/lib/i18n";

// 복음 전하기 허브 — 상단에서 내 언어↔상대 언어를 고르면, 도구가 상대 언어로 표시된다.
export default function ShareHome() {
  const { myLang, ready } = useLang();
  const { t: tt } = useI18n();
  const [tools, setTools] = useState<Tool[]>([]);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    setErr(null);
    fetchTools().then(setTools).catch((e) => setErr(e.message));
  }
  useEffect(() => { load(); }, []);

  return (
    // 골드 히어로는 AppShell 이 /reach 스타일로 그린다. 상단 바에 이미 브랜드(appName)가 있으므로
    // 허브 히어로 제목은 전도의 핵심 문구(tagline)로 — appName 중복 표시 방지.
    <AppShell title={ui(myLang, "tagline")}>
      {err && (
        <div style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${theme.wrong}`, background: theme.wrongBg, padding: 16, fontSize: 14, color: theme.text, textAlign: "center" }}>
          <p style={{ margin: "0 0 10px", lineHeight: 1.5 }}>{ui(myLang, "errContent")}</p>
          <button onClick={load} style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer" }}>🔄 {ui(myLang, "retry")}</button>
        </div>
      )}

      {/* 언어 설정 — 내 언어 ↔ 상대(전할 대상) 언어. 상대 언어를 고르면 아래 도구가 그 언어로 표시됨 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, margin: "2px 0 16px" }}>
        <LanguageToggle />
        <p style={{ fontSize: 11.5, color: theme.textMuted, margin: 0, textAlign: "center", lineHeight: 1.5 }}>{tt("share.langHint")}</p>
      </div>

      {/* 도구 선택 — 골드 섹션 라벨(아이콘 + 세리프 + 가로선, /reach 와 동일) */}
      <ShareSection icon="megaphone">{ui(myLang, "chooseTool")}</ShareSection>
      {/* 전도 도구 5개: 2+2+1(와이드) · 보석톤 그라데이션 유지 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {tools.slice(0, 4).map((t) => <ToolCard key={t.id} tool={t} />)}
        {tools[4] && <div style={{ gridColumn: "span 2" }}><ToolCard tool={tools[4]} wide /></div>}
      </div>

      {/* 🎓 전도자 교육 — 위 5개 도구를 깊이 이해·훈련하는 입구(골드 외곽선) */}
      <Link href="/share/train" style={{ textDecoration: "none" }}>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "12px 14px", borderRadius: 16, border: "1px solid var(--t-sacredBorder)", background: "var(--t-sacredLight)", cursor: "pointer", color: theme.text }}>
          <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 13, background: theme.card, border: "1px solid var(--t-sacredBorder)", display: "grid", placeItems: "center" }}>
            <MenuIcon name="grad" color="var(--t-sacred)" size={22} />
          </span>
          <span style={{ flex: 1 }}>
            <span className="serif" style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--t-sacred)" }}>{ui(myLang, "trainCta")}</span>
            <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{ui(myLang, "trainCtaSub")}</span>
          </span>
          <span aria-hidden style={{ fontSize: 16, color: "var(--t-sacred)" }}>›</span>
        </div>
      </Link>

      {/* 실시간 통역은 '선교 도구'(/reach)로 이동 — 여기는 전도 도구(글없는책·다리·사영리)만 */}

      {!ready && <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: theme.textMuted }}>…</p>}
    </AppShell>
  );
}
