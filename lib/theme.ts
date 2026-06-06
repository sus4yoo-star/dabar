// DABAR 테마 — 밝은 보라 배경 + 어두운 프로스트 카드(대비 ↑) + 골드
export const theme = {
  // 브랜드
  primary:    "#8b6bff",   // CTA·강조 보라 (어두운 카드 위)
  primarySoft:"#b3a4ff",
  gold:       "#e6c878",   // 또렷한 골드
  goldSoft:   "#d8be6e",

  // 배경 / 표면
  bg:        "#4d2fae",
  bgGrad:    "radial-gradient(135% 100% at 50% -5%, #9a6cf2 0%, #6e49d8 45%, #4d2fae 100%)",
  card:      "rgba(26,12,58,0.45)",      // 어두운 프로스트 카드 → 글씨가 또렷
  cardBorder:"rgba(255,255,255,0.16)",
  goldBorder:"rgba(230,200,120,0.40)",
  primaryBg: "rgba(139,107,255,0.24)",
  goldLight: "rgba(230,200,120,0.16)",

  // 텍스트 (밝게)
  text:      "#f4f0ff",
  textMuted: "#cfc2ef",
  textFaint: "#b3a4dd",
  border:    "rgba(255,255,255,0.20)",

  // 상태
  correct:   "#46e0a8", correctBg: "rgba(70,224,168,0.16)",
  wrong:     "#ff8a8a", wrongBg:   "rgba(255,138,138,0.16)",
};
