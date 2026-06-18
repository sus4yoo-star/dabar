// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 얇고 우아한 라인. 살아있는 그린(양육)·블루(선교) 면 + 골드(거룩) 책등·성광.
// 밝은 칩 위에 올리므로 색은 고정값.
export default function BrandMark({ size = 48, stroke = 1.4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {/* 금빛 성광 — 책 위 중앙 */}
      <path d="M32 8c.5 3.6 1.3 4.4 4.9 4.9-3.6.5-4.4 1.3-4.9 4.9-.5-3.6-1.3-4.4-4.9-4.9 3.6-.5 4.4-1.3 4.9-4.9z"
        fill="#c79a2b" stroke="#c79a2b" strokeWidth="0.5" />
      {/* 책등 — 골드 */}
      <path d="M32 25V43" stroke="#c79a2b" strokeWidth={stroke} />
      {/* 왼쪽 면 — 그린 */}
      <path d="M32 25C25 23 18 23.5 13 25.5V42.5C18 40.5 25 41 32 43" stroke="#1ea85a" strokeWidth={stroke} />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 25C39 23 46 23.5 51 25.5V42.5C46 40.5 39 41 32 43" stroke="#1573c4" strokeWidth={stroke} />
    </svg>
  );
}
