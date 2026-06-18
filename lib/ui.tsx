"use client";

// 🎨 DABAR 공용 디자인 키트 — 홈과 같은 톤(컬러 아이콘 칩·은은한 그라데이션·부드러운 그림자)을
// 내부 페이지에서도 일관되게 쓰기 위한 작은 모음. 인라인 스타일 기반 앱이라 가벼운 헬퍼로 제공.
// 모든 내부 페이지는 같은 골격을 따른다: PageHeader(가운데 세리프 제목 + ✦ 장식선 + 부제) →
// SectionLabel(아이콘 + 세리프 소제목 + 가로선) → 카드. 상위 메뉴의 컨셉 색(accentColor)을 끝까지 물려준다.
import { theme } from "@/lib/theme";
import MenuIcon from "@/components/MenuIcon";

export type Accent = { fg: string; chip: string; bg: string; border: string };

export const ACCENT: Record<"green" | "blue" | "amber" | "red" | "violet" | "gold", Accent> = {
  green:  { fg: "var(--a-green-fg)",  chip: "var(--a-green-chip)",  bg: "var(--a-green-bg)",  border: "var(--a-green-border)" },
  blue:   { fg: "var(--a-blue-fg)",   chip: "var(--a-blue-chip)",   bg: "var(--a-blue-bg)",   border: "var(--a-blue-border)" },
  amber:  { fg: "var(--a-amber-fg)",  chip: "var(--a-amber-chip)",  bg: "var(--a-amber-bg)",  border: "var(--a-amber-border)" },
  red:    { fg: "var(--a-red-fg)",    chip: "var(--a-red-chip)",    bg: "var(--a-red-bg)",    border: "var(--a-red-border)" },
  violet: { fg: "var(--a-violet-fg)", chip: "var(--a-violet-chip)", bg: "var(--a-violet-bg)", border: "var(--a-violet-border)" },
  // 거룩한 골드 — 복음 전하기 · 선교 여정 계열
  gold:   { fg: "var(--t-sacred)", chip: "var(--t-sacredLight)", bg: "linear-gradient(135deg, var(--t-sacredLight) 0%, var(--t-card) 72%)", border: "var(--t-sacredBorder)" },
};
// 거룩한 골드 단축 별칭 (복음/선교)
export const SACRED = ACCENT.gold;

export const softShadow = "0 2px 10px rgba(26,37,48,0.06), 0 1px 3px rgba(26,37,48,0.04)";
export const cardShadow = "0 10px 30px rgba(26,37,48,0.08), 0 2px 6px rgba(26,37,48,0.05)";

// 우아한 세리프 — 제목/워드마크에 사용(말씀·품격). 한국어는 시스템 명조로 자연 폴백.
export const serif = "'Iowan Old Style','Apple Garamond',Georgia,'Times New Roman','Noto Serif KR',serif";

// 페이지 공통 헤더 — 선교 여정(/reach) 모범 디자인을 모든 내부 페이지에 통일 적용한 골격.
// 상단 ← 홈(좌) + 보조 액션(우), 그 아래 가운데 세리프 제목 + ✦ 장식선 + 부제.
// accentColor: 홈 상위 메뉴의 컨셉 색을 하위까지 물려준다(미지정 시 양육 초록).
export function PageHeader({ title, subtitle, onHome, homeLabel = "홈", right, accentColor }: {
  title: string; subtitle?: string; onHome: () => void; homeLabel?: string; right?: React.ReactNode; accentColor?: string;
}) {
  const fg = accentColor ?? theme.gold;
  return (
    <div style={{ marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, minHeight: 32 }}>
        <button onClick={onHome} aria-label={homeLabel}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap", boxShadow: softShadow }}>
          <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>←</span>{homeLabel}
        </button>
        <span style={{ flex: 1 }} />
        {right}
      </div>
      <div style={{ textAlign: "center" }}>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 700, color: fg, margin: 0, letterSpacing: -0.2 }}>{title.replace(/^\p{Extended_Pictographic}️?\s*/u, "")}</h1>
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, margin: "5px 0 3px" }}>
          <span style={{ width: 26, height: 1, background: `linear-gradient(90deg, transparent, ${fg})` }} />
          <span style={{ color: fg, fontSize: 9, lineHeight: 1 }}>✦</span>
          <span style={{ width: 26, height: 1, background: `linear-gradient(90deg, ${fg}, transparent)` }} />
        </div>
        {subtitle && <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, lineHeight: 1.45 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// 섹션 소제목 — 아이콘 + 세리프 제목 + 오른쪽으로 뻗는 가는 선 (/reach 모범 디자인).
export function SectionLabel({ icon, children, accentColor }: {
  icon: string; children: React.ReactNode; accentColor?: string;
}) {
  const fg = accentColor ?? theme.gold;
  // 라벨 앞 이모지는 제거 — 아이콘과 중복 방지(문자열 자식일 때만)
  const label = typeof children === "string" ? children.replace(/^\p{Extended_Pictographic}️?\s*/u, "") : children;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "11px 2px 7px" }}>
      <MenuIcon name={icon} size={18} color={fg} />
      <span className="serif" style={{ fontSize: 16, fontWeight: 700, color: fg, letterSpacing: -0.2 }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: fg, opacity: 0.38, marginLeft: 4 }} />
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
      style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", marginTop: 11, padding: "15px 17px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: onClick ? "pointer" : "default", color: theme.text, boxShadow: softShadow }}>
      <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 13, background: accent.chip, display: "grid", placeItems: "center", fontSize: 22 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: serif, display: "block", fontSize: 16.5, fontWeight: 700, color: theme.text, letterSpacing: -0.2 }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 3, lineHeight: 1.45 }}>{sub}</span>}
      </span>
      {right ?? (onClick && <span style={{ fontSize: 16, color: theme.textFaint }}>›</span>)}
    </button>
  );
}

// 부드러운 섹션 박스 (카드 컨테이너)
export function softCard(extra?: React.CSSProperties): React.CSSProperties {
  return { borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, boxShadow: softShadow, ...extra };
}
