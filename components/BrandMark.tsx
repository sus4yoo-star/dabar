// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 얇은 라인 · 세로로 긴 우아한 비율. 그린(양육)·블루(선교) 면 + 골드(거룩) 책등·성광.
// 밝은 칩 위에 올리므로 색은 고정값.
export default function BrandMark({ size = 48, stroke = 1.5 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {/* 금빛 성광 — 책 위 중앙 */}
      <path d="M32 3c.6 4.4 1.5 5.3 5.9 5.9-4.4.6-5.3 1.5-5.9 5.9-.6-4.4-1.5-5.3-5.9-5.9 4.4-.6 5.3-1.5 5.9-5.9z"
        fill="#c79a2b" stroke="#c79a2b" strokeWidth="0.5" />
      {/* 책등 — 골드 */}
      <path d="M32 20V49" stroke="#c79a2b" strokeWidth={stroke} />
      {/* 왼쪽 면 — 그린 */}
      <path d="M32 20C24 17 16 17.5 10 20.5V49C16 46 24 46.5 32 49" stroke="#1ea85a" strokeWidth={stroke} />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 20C40 17 48 17.5 54 20.5V49C48 46 40 46.5 32 49" stroke="#1573c4" strokeWidth={stroke} />
    </svg>
  );
}
