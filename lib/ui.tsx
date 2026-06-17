"use client";

// 🎨 DABAR 공용 디자인 키트 — 홈과 같은 톤(컬러 아이콘 칩·은은한 그라데이션·부드러운 그림자)을
// 내부 페이지에서도 일관되게 쓰기 위한 작은 모음. 인라인 스타일 기반 앱이라 가벼운 헬퍼로 제공.
import { theme } from "@/lib/theme";

export type Accent = { fg: string; chip: string; bg: string; border: string };

export const ACCENT: Record<"green" | "blue" | "amber" | "red" | "violet", Accent> = {
  green:  { fg: "var(--a-green-fg)",  chip: "var(--a-green-chip)",  bg: "var(--a-green-bg)",  border: "var(--a-green-border)" },
  blue:   { fg: "var(--a-blue-fg)",   chip: "var(--a-blue-chip)",   bg: "var(--a-blue-bg)",   border: "var(--a-blue-border)" },
  amber:  { fg: "var(--a-amber-fg)",  chip: "var(--a-amber-chip)",  bg: "var(--a-amber-bg)",  border: "var(--a-amber-border)" },
  red:    { fg: "var(--a-red-fg)",    chip: "var(--a-red-chip)",    bg: "var(--a-red-bg)",    border: "var(--a-red-border)" },
  violet: { fg: "var(--a-violet-fg)", chip: "var(--a-violet-chip)", bg: "var(--a-violet-bg)", border: "var(--a-violet-border)" },
};

export const softShadow = "0 3px 12px rgba(23,50,73,0.05)";
export const cardShadow = "0 8px 24px rgba(23,50,73,0.07)";

// 페이지 공통 헤더 — 제목(골드) + 홈/뒤로 버튼. 모든 내부 페이지에서 동일한 모양.
export function PageHeader({ title, onHome, homeLabel = "홈", right }: {
  title: string; onHome: () => void; homeLabel?: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: "1.25rem" }}>
      <h1 style={{ fontSize: 21, fontWeight: 800, color: theme.gold, margin: 0, letterSpacing: -0.2 }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {right}
        <button onClick={onHome}
          style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
          {homeLabel}
        </button>
      </div>
    </div>
  );
}

// 상단 작은 알약 버튼(보조 액션) — 헤더 right 슬롯 등에 사용
export function PillButton({ children, onClick, tone = "muted" }: {
  children: React.ReactNode; onClick: () => void; tone?: "muted" | "primary" | "gold";
}) {
  const map = {
    muted:   { c: theme.textMuted,   bg: theme.card,      b: theme.cardBorder },
    primary: { c: theme.primarySoft, bg: theme.primaryBg, b: theme.cardBorder },
    gold:    { c: theme.gold,        bg: theme.goldLight, b: theme.goldBorder },
  }[tone];
  return (
    <button onClick={onClick}
      style={{ fontSize: 12.5, fontWeight: 700, color: map.c, background: map.bg, border: `1px solid ${map.b}`, borderRadius: 999, padding: "7px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

// 홈 메뉴 카드와 같은 모양의 내비/항목 카드 — 컬러 아이콘 칩 + 색조 배경 + 그림자.
export function AccentCard({ icon, title, sub, onClick, accent, right }: {
  icon: React.ReactNode; title: string; sub?: string; onClick?: () => void; accent: Accent; right?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 9, padding: "12px 15px", borderRadius: 16, border: `1px solid ${accent.border}`, background: accent.bg, cursor: onClick ? "pointer" : "default", color: theme.text, boxShadow: softShadow }}>
      <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: accent.chip, display: "grid", placeItems: "center", fontSize: 23 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16.5, fontWeight: 800, color: accent.fg }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 13, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{sub}</span>}
      </span>
      {right ?? (onClick && <span style={{ fontSize: 18, color: accent.fg, opacity: 0.85 }}>→</span>)}
    </button>
  );
}

// 부드러운 섹션 박스 (카드 컨테이너)
export function softCard(extra?: React.CSSProperties): React.CSSProperties {
  return { borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, boxShadow: softShadow, ...extra };
}
