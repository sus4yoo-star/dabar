// 단색 라인 아이콘 세트 — 이모지 대신 메뉴/칩에 사용(고급·일관·직관).
// stroke=currentColor 라 부모 color 로 색을 준다. 얇은 선(1.5) · 표준적이고 알아보기 쉬운 형태.
import React from "react";

const PATHS: Record<string, React.ReactNode> = {
  // 복음 전하기 — 확성기(전하다/선포)
  megaphone: (<>
    <path d="m3 11 16-5v13L3 15z" />
    <path d="M3 11v4" />
    <path d="M11 17.5a2.5 2.5 0 0 1-4.8.9L5 15" />
  </>),
  // 선교 여정 — 지구본
  globe: (<>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19" />
    <path d="M12 2.5a15 15 0 0 1 4 9.5 15 15 0 0 1-4 9.5 15 15 0 0 1-4-9.5 15 15 0 0 1 4-9.5z" />
  </>),
  // 양육·교육 — 학사모
  grad: (<>
    <path d="M22 10 12 5.5 2 10l10 4.5z" />
    <path d="M6 11.7V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.3" />
    <path d="M22 10v5" />
  </>),
  // 성경퀴즈 — 펼친 성경
  book: (<>
    <path d="M12 6.5v13" />
    <path d="M12 6.5C10.5 5.3 8.7 4.8 6.5 4.8c-1.5 0-3 .2-4 .6v13c1-.4 2.5-.6 4-.6 2.2 0 4 .5 5.5 1.7" />
    <path d="M12 6.5c1.5-1.2 3.3-1.7 5.5-1.7 1.5 0 3 .2 4 .6v13c-1-.4-2.5-.6-4-.6-2.2 0-4 .5-5.5 1.7" />
  </>),
  // 소그룹 — 사람들
  users: (<>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3 19.5a6 6 0 0 1 12 0" />
    <path d="M16 5.2a3.4 3.4 0 0 1 0 6.6" />
    <path d="M17.5 19.5a6 6 0 0 0-3-5.2" />
  </>),
  // 마음에 닿는 말씀 — 하트
  heart: (<path d="M12 20.5 4.3 13c-1.6-1.6-1.6-4.2 0-5.8a4 4 0 0 1 5.8 0l1.9 1.9 1.9-1.9a4 4 0 0 1 5.8 0c1.6 1.6 1.6 4.2 0 5.8z" />),
  // 동행 — 사람 + 추가
  userPlus: (<>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3 19.5a6 6 0 0 1 12 0" />
    <path d="M19 8v6" /><path d="M22 11h-6" />
  </>),
  // 랭킹 — 트로피
  trophy: (<>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5.5H4.8a2 2 0 0 0 0 4H7.5" />
    <path d="M17 5.5h2.2a2 2 0 0 1 0 4H16.5" />
    <path d="M12 14v3.5" />
    <path d="M8.5 20.5h7" /><path d="M9.5 20.5c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3" />
  </>),
  // 오답 — 노트(체크리스트)
  list: (<>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
    <path d="M8.5 8.5h7" /><path d="M8.5 12h7" /><path d="M8.5 15.5h4" />
  </>),
  // 진도 — 막대 그래프
  chart: (<>
    <path d="M4 4v16h16" />
    <path d="M8 16v-4" /><path d="M13 16V8" /><path d="M18 16v-6" />
  </>),
  // 개인정보 — 자물쇠
  lock: (<>
    <rect x="5" y="11" width="14" height="9.5" rx="2.2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <path d="M12 15v2" />
  </>),
  // 로그아웃 — 문/나가기
  logout: (<>
    <path d="M9.5 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5" />
    <path d="m16 16.5 4.5-4.5L16 7.5" />
    <path d="M20 12H9.5" />
  </>),
  // 계정 — 사용자
  account: (<>
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="10" r="3.2" />
    <path d="M5.8 18.6a6.4 6.4 0 0 1 12.4 0" />
  </>),
  // 안내 — 클립보드/문서
  clipboard: (<>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <rect x="9" y="2.5" width="6" height="3.4" rx="1" />
    <path d="M9 11h6" /><path d="M9 14.5h6" /><path d="M9 18h4" />
  </>),
  // 초대 — 공유
  share: (<>
    <circle cx="18" cy="5.5" r="2.8" /><circle cx="6" cy="12" r="2.8" /><circle cx="18" cy="18.5" r="2.8" />
    <path d="m8.4 13.4 7.2 3.9" /><path d="m15.6 6.7-7.2 3.9" />
  </>),
  // 새신자 — 새싹
  sprout: (<>
    <path d="M12 20v-9" />
    <path d="M12 11c0-3.3 2.2-5.5 5.5-5.5C17.5 8.8 15.3 11 12 11z" />
    <path d="M12 13C12 10.2 10 8.5 7 8.5c0 2.8 2 4.5 5 4.5z" />
  </>),
  // 세례 — 물방울
  droplet: (<path d="M12 3.2s6 6.4 6 10.3a6 6 0 0 1-12 0c0-3.9 6-10.3 6-10.3z" />),
  // 입교 — 십자가
  cross: (<><path d="M12 3v18" /><path d="M6.5 8.5h11" /></>),
  // 환율 — 계산기
  calc: (<>
    <rect x="5" y="3" width="14" height="18" rx="2.4" />
    <rect x="8" y="6" width="8" height="3.2" rx="0.8" />
    <path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" />
  </>),
  // 이미지 번역 — 카메라
  camera: (<>
    <path d="M4 7.5h3L9 5.5h6L17 7.5h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5z" />
    <circle cx="12" cy="13" r="3.4" />
  </>),
  // 음성 통역 — 마이크
  mic: (<>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5V21" /><path d="M8.5 21h7" />
  </>),
  // 현황판 — 대시보드
  dashboard: (<>
    <rect x="3.5" y="3.5" width="7" height="8.5" rx="1.4" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.4" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.4" />
    <rect x="3.5" y="15" width="7" height="5.5" rx="1.4" />
  </>),
};

export default function MenuIcon({ name, size = 24, color, strokeWidth = 1.5, style }:
  { name: string; size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden
      style={{ color: color ?? "currentColor", display: "block", ...style }}>
      {PATHS[name] ?? null}
    </svg>
  );
}
