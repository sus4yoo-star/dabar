// DABAR 테마 — CSS 변수 기반(라이트/다크 전환 지원).
// 실제 색 값은 globals.css 의 :root(라이트) 와 html.night(다크) 에 정의된다.
// 인라인 스타일에서 그대로 쓰도록 각 토큰은 var(...) 문자열을 가리킨다.
export const theme = {
  // 브랜드
  primary:    "var(--t-primary)",     // 파랑 — CTA·링크·선택 상태
  primarySoft:"var(--t-primarySoft)", // 파랑(진한) — 보조 강조 텍스트
  gold:       "var(--t-gold)",        // (토큰명 유지) 초록 — 제목·뱃지·성장 강조
  goldSoft:   "var(--t-goldSoft)",

  // 배경 / 표면
  bg:        "var(--t-bg)",
  bgGrad:    "var(--t-bgGrad)",
  card:      "var(--t-card)",
  cardBorder:"var(--t-cardBorder)",
  goldBorder:"var(--t-goldBorder)",
  primaryBg: "var(--t-primaryBg)",
  goldLight: "var(--t-goldLight)",

  // 텍스트
  text:      "var(--t-text)",
  textMuted: "var(--t-textMuted)",
  textFaint: "var(--t-textFaint)",
  border:    "var(--t-border)",

  // 상태
  correct:   "var(--t-correct)", correctBg: "var(--t-correctBg)",
  wrong:     "var(--t-wrong)",    wrongBg:   "var(--t-wrongBg)",
};
