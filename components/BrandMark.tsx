// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 위로 열리는 고전적 책 형태 · 깊고 차분한 색(앤틱 골드) · 섬세한 성광. 얇은 라인.
// 밝은 칩 위에 올리므로 색은 고정값.
const GREEN = "#178a50", BLUE = "#15689c", GOLD = "#b8901f";

export default function BrandMark({ size = 48, stroke = 1.4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {/* 금빛 성광 — 섬세하게 */}
      <path d="M32 6c.45 3.7.95 4.2 4.7 4.7-3.75.5-4.25 1-4.7 4.7-.45-3.7-.95-4.2-4.7-4.7 3.75-.5 4.25-1 4.7-4.7z"
        fill={GOLD} stroke={GOLD} strokeWidth="0.4" />
      {/* 책등 — 골드 */}
      <path d="M32 27V45" stroke={GOLD} strokeWidth={stroke} />
      {/* 왼쪽 면 — 그린 (위로 열림) */}
      <path d="M32 27C25 24 17.5 22 11 21.5V41.5C17.5 42 25 42.5 32 45" stroke={GREEN} strokeWidth={stroke} />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 27C39 24 46.5 22 53 21.5V41.5C46.5 42 39 42.5 32 45" stroke={BLUE} strokeWidth={stroke} />
    </svg>
  );
}
