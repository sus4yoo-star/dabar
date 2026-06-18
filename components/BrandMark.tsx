// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 얇고 우아한 라인(채움·글줄 없음). 살아있는 그린(양육)·블루(선교) 면 + 골드(거룩) 책등·성광.
// 밝은 칩 위에 올리므로 색은 고정값. strokeWidth 로 굵기 조절.
export default function BrandMark({ size = 48, stroke = 1.7 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {/* 금빛 성광 — 책 위 중앙, 섬세하게 */}
      <path d="M32 6c.6 4 1.4 4.8 5.4 5.4-4 .6-4.8 1.4-5.4 5.4-.6-4-1.4-4.8-5.4-5.4 4-.6 4.8-1.4 5.4-5.4z"
        fill="#c79a2b" stroke="#c79a2b" strokeWidth="0.6" />
      {/* 책등 — 골드 */}
      <path d="M32 25.5V46" stroke="#c79a2b" strokeWidth={stroke} />
      {/* 왼쪽 면 — 그린 */}
      <path d="M32 25.5C25 20.5 17 21 10 24.5V43.5C17 40 25 40.5 32 45" stroke="#1ea85a" strokeWidth={stroke} />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 25.5C39 20.5 47 21 54 24.5V43.5C47 40 39 40.5 32 45" stroke="#1573c4" strokeWidth={stroke} />
    </svg>
  );
}
