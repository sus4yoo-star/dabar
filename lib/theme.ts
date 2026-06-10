// DABAR 테마 — 흰 바탕 + 파랑·초록 포인트 (로고 컨셉)
// 바탕은 흰색, 파랑(#3CAFFF 계열)은 주요 동작/링크, 초록(#92D700 계열)은 강조/성장 역할.
export const theme = {
  // 브랜드
  primary:    "#1f9bef",   // 파랑 — CTA·링크·선택 상태
  primarySoft:"#1577c2",   // 파랑(진한) — 보조 강조 텍스트
  gold:       "#58a700",   // (토큰명 유지) 초록 — 제목·뱃지·성장 강조
  goldSoft:   "#79c61d",

  // 배경 / 표면 (모두 흰색 계열)
  bg:        "#ffffff",
  bgGrad:    "#ffffff",
  card:      "#fafcfe",                  // 흰 카드 (테두리로 구분)
  cardBorder:"rgba(16,62,102,0.16)",
  goldBorder:"rgba(88,167,0,0.45)",      // 초록 테두리
  primaryBg: "rgba(31,155,239,0.10)",    // 파랑 연한 배경
  goldLight: "rgba(146,215,0,0.14)",     // 초록 연한 배경

  // 텍스트 (어둡게 — 흰 바탕 가독성)
  text:      "#173249",
  textMuted: "#54718a",
  textFaint: "#85a0b5",
  border:    "rgba(23,50,73,0.20)",

  // 상태
  correct:   "#17a05e", correctBg: "rgba(23,160,94,0.12)",
  wrong:     "#e25555", wrongBg:   "rgba(226,85,85,0.12)",
};
