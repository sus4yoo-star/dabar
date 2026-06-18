// DABAR 대표 마크 — 곡선으로 펼쳐진 말씀(책) + 작은 금빛 빛. 단색 골드, 얇은 라인.
const GOLD = "#b8901f";

export default function BrandMark({ size = 48, stroke = 1.5 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      stroke={GOLD} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block" }}>
      {/* 작은 금빛 빛 */}
      <path d="M32 6c.4 2.7.8 3.1 3.5 3.5-2.7.4-3.1.8-3.5 3.5-.4-2.7-.8-3.1-3.5-3.5 2.7-.4 3.1-.8 3.5-3.5z"
        fill={GOLD} strokeWidth="0.4" />
      {/* 책등 */}
      <path d="M32 24V48" />
      {/* 왼쪽 면 — 곡선(부채처럼 휜 페이지) */}
      <path d="M32 24C25 20 17 19 10 21.5C12 29 12 39.5 10 45C17 42.5 25 43.5 32 48" />
      {/* 오른쪽 면 */}
      <path d="M32 24C39 20 47 19 54 21.5C52 29 52 39.5 54 45C47 42.5 39 43.5 32 48" />
    </svg>
  );
}
