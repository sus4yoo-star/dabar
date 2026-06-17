"use client";
import { theme } from "@/lib/theme";

// 뼈대(스켈레톤) 로딩 — "…" 대신 콘텐츠 모양의 placeholder 로 "멈춘 줄" 오해를 줄인다.
export function Skeleton({ w = "100%", h = 14, r = 10, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" aria-hidden style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

// 카드 한 줄 모양의 스켈레톤 (아이콘 칩 + 제목/부제 두 줄) — 목록 로딩에 사용.
export function SkeletonCard() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, marginTop: 9 }}>
      <Skeleton w={46} h={46} r={13} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skeleton w="62%" h={14} />
        <Skeleton w="40%" h={11} style={{ marginTop: 7 }} />
      </div>
    </div>
  );
}

// 목록 전체 로딩 — 카드 n개. aria-busy 로 스크린리더에 로딩 중임을 알린다.
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
