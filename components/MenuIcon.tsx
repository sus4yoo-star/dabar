// 단색 라인 아이콘 세트 — 이모지 대신 메뉴/칩에 사용(고급·일관).
// stroke=currentColor 라, 부모 style.color 로 색을 준다. (Lucide 스타일 24x24)
import React from "react";

const PATHS: Record<string, React.ReactNode> = {
  // 복음 전하기 — 깃털(비둘기·말씀의 가벼움)
  feather: (<>
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <path d="M16 8 2 22" /><path d="M17.5 15H9" />
  </>),
  // 선교 여정 — 지구본
  globe: (<>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 3.5 9 14 14 0 0 1-3.5 9 14 14 0 0 1-3.5-9A14 14 0 0 1 12 3z" />
  </>),
  // 양육·교육 — 학사모
  grad: (<>
    <path d="M22 10 12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
  </>),
  // 성경퀴즈 — 펼친 책
  book: (<>
    <path d="M12 7v13" />
    <path d="M3 17.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v11.5a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </>),
  // 소그룹 — 사람들
  users: (<>
    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="8" r="4" />
    <path d="M22 20v-2a4 4 0 0 0-3-3.87" /><path d="M16 4.13a4 4 0 0 1 0 7.75" />
  </>),
  // 마음에 닿는 말씀 — 하트
  heart: (<path d="M19 13.6c1.4-1.4 2.8-3 2.8-5.1A4.6 4.6 0 0 0 17.2 4c-1.6 0-2.8.5-4.2 2-1.4-1.5-2.6-2-4.2-2A4.6 4.6 0 0 0 4 8.5c0 2.1 1.4 3.7 2.8 5.1l6.2 6.2 6.2-6.2z" />),
  // 동행 — 사람 + 추가
  userPlus: (<>
    <path d="M15 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="8" r="4" />
    <path d="M19 8v6" /><path d="M22 11h-6" />
  </>),
  // 랭킹 — 트로피
  trophy: (<>
    <path d="M7 9H5.5a2.5 2.5 0 0 1 0-5H7" />
    <path d="M17 9h1.5a2.5 2.5 0 0 0 0-5H17" />
    <path d="M5 21h14" />
    <path d="M10 16.5V18c0 .6-.4 1-1 1.3C8 19.8 7.5 20.8 7.5 21" />
    <path d="M14 16.5V18c0 .6.4 1 1 1.3 1 .5 1.5 1.5 1.5 1.7" />
    <path d="M17 4H7v6a5 5 0 0 0 10 0V4z" />
  </>),
  // 오답 — 체크리스트
  list: (<>
    <path d="M16 4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2.5" width="8" height="4" rx="1" />
    <path d="M9.5 12.5h5" /><path d="M9.5 16h5" />
  </>),
  // 진도 — 막대 차트
  chart: (<>
    <path d="M3 3v18h18" />
    <path d="M8 17v-4" /><path d="M13 17V9" /><path d="M18 17V6" />
  </>),
};

export default function MenuIcon({ name, size = 22, color, strokeWidth = 1.8, style }:
  { name: string; size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden
      style={{ color: color ?? "currentColor", display: "block", ...style }}>
      {PATHS[name] ?? null}
    </svg>
  );
}
