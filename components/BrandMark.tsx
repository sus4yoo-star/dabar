// DABAR 대표 마크 — 펼친 말씀(책) + 작은 금빛 빛.
// 단색 골드(절제·고급) · 위로 열리는 고전적 책 · 얇은 라인. 색은 고정값.
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
      <path d="M32 24V49" />
      {/* 왼쪽 면 (위로 열림) */}
      <path d="M32 24C25.5 21 19.5 19.5 15 19V46.5C19.5 46 25.5 46.5 32 49" />
      {/* 오른쪽 면 */}
      <path d="M32 24C38.5 21 44.5 19.5 49 19V46.5C44.5 46 38.5 46.5 32 49" />
    </svg>
  );
}
