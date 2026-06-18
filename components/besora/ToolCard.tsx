"use client";

import { useRouter } from "next/navigation";
import type { Tool } from "@/lib/besora/types";
import { useLang } from "@/lib/besora/LanguageContext";
import { toolName, toolDesc } from "@/lib/besora/i18n";

// 도구별 그라데이션 — 깊고 차분한 주얼톤(고급) · 도구 정체성은 유지
const GRAD: Record<string, { bg: string; dark?: boolean }> = {
  gold:    { bg: "linear-gradient(135deg,#D9B154,#B0821A)" },
  crimson: { bg: "linear-gradient(135deg,#C2493A,#8C2A20)" },
  parch:   { bg: "linear-gradient(135deg,#EDE7D8,#DAD2BF)", dark: true },
  green:   { bg: "linear-gradient(135deg,#3E9B6E,#236245)" },
  violet:  { bg: "linear-gradient(135deg,#7C6CB0,#534878)" },
  ink:     { bg: "linear-gradient(135deg,#2E2A38,#15131C)" },
};

export default function ToolCard({ tool, wide = false }: { tool: Tool; wide?: boolean }) {
  const router = useRouter();
  const { myLang, seekerLang } = useLang();
  const g = GRAD[tool.color_key] ?? GRAD.ink;
  const fg = g.dark ? "#2A2440" : "#ffffff";

  const lead = seekerLang || myLang;
  const seekerName = toolName(tool.slug, lead);
  const myName = toolName(tool.slug, myLang);
  const desc = toolDesc(tool.slug, myLang); // 설명은 전도자(내) 언어로
  const showBoth = !!seekerLang && seekerLang !== myLang;

  const go = () => router.push(`/share/present/${tool.slug}`);

  if (wide) {
    return (
      <button onClick={go} style={{ display: "flex", minHeight: 70, width: "100%", flexDirection: "column", justifyContent: "center", gap: 2, overflow: "hidden", borderRadius: 22, background: g.bg, padding: "12px 20px", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: fg, fontFamily: "'Noto Serif KR',serif" }}>{seekerName}</span>
          {showBoth && <span style={{ fontSize: 12, color: fg, opacity: 0.7 }}>{myName}</span>}
        </span>
        {desc && <span style={{ fontSize: 11.5, lineHeight: 1.3, color: fg, opacity: 0.82 }}>{desc}</span>}
      </button>
    );
  }

  return (
    <button onClick={go} style={{ position: "relative", display: "flex", aspectRatio: "16 / 9", minHeight: 78, width: "100%", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", borderRadius: 18, background: g.bg, padding: "11px 13px", border: "none", cursor: "pointer", textAlign: "left" }}>
      <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.15, color: fg, fontFamily: "'Noto Serif KR',serif" }}>{seekerName}</span>
      {showBoth && <span style={{ marginTop: 1, fontSize: 11, color: fg, opacity: 0.8 }}>{myName}</span>}
      {desc && <span style={{ marginTop: 3, fontSize: 10.5, lineHeight: 1.3, color: fg, opacity: 0.82, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{desc}</span>}
    </button>
  );
}
