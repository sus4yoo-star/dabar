// DABAR 대표 마크 — 펼친 말씀(책) + 거룩한 금빛 성광(✦).
// 살아있는 그린(양육·생명)·블루(선교) 두 면 + 골드(거룩). 밝은 칩 위에 올리므로 색은 고정값.
export default function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden
      style={{ display: "block" }}>
      {/* 왼쪽 면 — 그린 */}
      <path d="M32 28C25 24 16 24 9 27v18c7-3 16-3 23 1z" fill="rgba(30,168,90,0.10)" stroke="#1ea85a" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {/* 오른쪽 면 — 블루 */}
      <path d="M32 28c7-4 16-4 23-1v18c-7-3-16-3-23 1z" fill="rgba(31,143,230,0.10)" stroke="#1573c4" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {/* 책등 */}
      <path d="M32 28v18" stroke="#2a3b4a" strokeWidth="2.2" strokeLinecap="round" />
      {/* 면 글줄 (은은) */}
      <path d="M14 32.5h12M14 37h12" stroke="#1ea85a" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M38 32.5h12M38 37h12" stroke="#1573c4" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      {/* 금빛 성광 ✦ */}
      <path d="M47 9c.7 4.8 1.5 5.6 6.3 6.3-4.8.7-5.6 1.5-6.3 6.3-.7-4.8-1.5-5.6-6.3-6.3 4.8-.7 5.6-1.5 6.3-6.3z" fill="#c79a2b" stroke="#c79a2b" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}
