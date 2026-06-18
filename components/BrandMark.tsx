// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 위로 열리는 고전적 책 · 세로로 길쭉한 비율 · 깊고 차분한 색(앤틱 골드) · 섬세한 성광.
const GREEN = "#178a50", BLUE = "#15689c", GOLD = "#b8901f";

export default function BrandMark({ size = 48, stroke = 1.4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {/* 금빛 성광 */}
      <path d="M32 5c.45 3.8.95 4.3 4.8 4.8-3.85.5-4.35 1-4.8 4.8-.45-3.8-.95-4.3-4.8-4.8 3.85-.5 4.35-1 4.8-4.8z"
        fill={GOLD} stroke={GOLD} strokeWidth="0.4" />
      {/* 책등 — 골드 */}
      <path d="M32 25V49" stroke={GOLD} strokeWidth={stroke} />
      {/* 왼쪽 면 — 그린 (위로 열림, 세로 길쭉) */}
      <path d="M32 25C25.5 22 19.5 20.5 15 20V46.5C19.5 46 25.5 46.5 32 49" stroke={GREEN} strokeWidth={stroke} />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 25C38.5 22 44.5 20.5 49 20V46.5C44.5 46 38.5 46.5 32 49" stroke={BLUE} strokeWidth={stroke} />
    </svg>
  );
}
