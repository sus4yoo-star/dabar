// DABAR 테마 — 파랑·초록·흰색 (로고 컨셉)
// 파랑 #3CAFFF · 초록 #92D700 · 흰색. 컬러 배경 + 어두운 프로스트 카드 + 밝은 글씨.
export const theme = {
  // 브랜드
  primary:    "#2fa3ec",   // 파랑 CTA·강조
  primarySoft:"#8fcef7",
  gold:       "#9ed62b",   // (토큰명 유지) 초록 강조
  goldSoft:   "#86c40a",

  // 배경 / 표면
  bg:        "#2b8fd2",
  bgGrad:    "radial-gradient(135% 100% at 50% -5%, #36a7f2 0%, #2b8fd2 45%, #4a9c46 100%)", // 파랑→초록
  card:      "rgba(7,28,46,0.42)",       // 어두운 프로스트 카드(파랑톤) → 글씨 또렷
  cardBorder:"rgba(255,255,255,0.18)",
  goldBorder:"rgba(146,215,0,0.45)",     // 초록 테두리
  primaryBg: "rgba(60,175,255,0.22)",    // 파랑 연한 배경
  goldLight: "rgba(146,215,0,0.16)",     // 초록 연한 배경

  // 텍스트 (밝게)
  text:      "#f3fbff",
  textMuted: "#d4ecfb",
  textFaint: "#a7d3ef",
  border:    "rgba(255,255,255,0.22)",

  // 상태
  correct:   "#5fe39a", correctBg: "rgba(95,227,154,0.16)",
  wrong:     "#ff8a8a", wrongBg:   "rgba(255,138,138,0.16)",
};
