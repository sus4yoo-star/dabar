import sharp from "sharp";
import { mkdirSync } from "fs";

const OUT = "/home/user/dabar/assets/screenshots";
mkdirSync(OUT, { recursive: true });

const SERIF = "'NanumMyeongjo','Nanum Myeongjo',serif";
const GOTHIC = "'NanumGothic','Nanum Gothic',sans-serif";
const LIB = "'Liberation Serif',serif";
const GOLD = "#b8901f";

// DABAR 펼친 책 마크 (art center 32,27)
const mark = (color) => `
  <path d="M32 6c.4 2.7.8 3.1 3.5 3.5-2.7.4-3.1.8-3.5 3.5-.4-2.7-.8-3.1-3.5-3.5 2.7-.4 3.1-.8 3.5-3.5z" fill="${color}" stroke="${color}" stroke-width="0.4"/>
  <path d="M32 24V48" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  <path d="M32 24C25 20 17 19 10 21.5C12 29 12 39.5 10 45C17 42.5 25 43.5 32 48" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 24C39 20 47 19 54 21.5C52 29 52 39.5 54 45C47 42.5 39 43.5 32 48" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
const place = (cx, cy, s) => `translate(${cx - 32 * s},${cy - 27 * s}) scale(${s})`;
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// 1080x1920 스크린샷 한 장
function screen({ fg, tint, title, sub, bullets }) {
  const rows = bullets.map((b, i) => {
    const y = 1120 + i * 150;
    return `
      <circle cx="150" cy="${y - 12}" r="12" fill="${fg}"/>
      <text x="200" y="${y}" font-family="${GOTHIC}" font-size="42" fill="#1f3a52">${esc(b)}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <rect width="1080" height="1920" fill="#ffffff"/>
    <!-- 상단 히어로 패널 (둥근 하단) -->
    <path d="M0 0 H1080 V820 Q1080 900 1000 900 H80 Q0 900 0 820 Z" fill="${tint}"/>
    <circle cx="540" cy="330" r="158" fill="#ffffff" stroke="${fg}" stroke-opacity="0.25" stroke-width="3"/>
    <g transform="${place(540, 330, 4.4)}">${mark(fg)}</g>
    <text x="544" y="640" font-family="${SERIF}" font-size="82" font-weight="700" fill="${fg}" text-anchor="middle">${esc(title)}</text>
    <text x="540" y="742" font-family="${GOTHIC}" font-size="44" fill="#54718a" text-anchor="middle">${esc(sub)}</text>
    <!-- 하단 콘텐츠 카드 -->
    <rect x="70" y="1000" width="940" height="560" rx="34" fill="#ffffff" stroke="#e6ebf0" stroke-width="2"/>
    ${rows}
    <text x="546" y="1800" font-family="${LIB}" font-size="58" font-weight="700" letter-spacing="7" fill="${GOLD}" text-anchor="middle">DABAR</text>
    <text x="540" y="1852" font-family="${GOTHIC}" font-size="30" fill="#90a6b8" text-anchor="middle">by AMOV · Love Creates Value</text>
  </svg>`;
}

const GOLDT = { fg: "#b8901f", tint: "#fbf3df" };
const BLUE = { fg: "#1573c4", tint: "#e9f4fd" };
const GREEN = { fg: "#1ea85a", tint: "#eafaf0" };
const AMBER = { fg: "#b07d12", tint: "#fbf1da" };

const SCREENS = [
  { ...GOLDT, title: "복음 전하기", sub: "전도 도구를 상대의 언어로", bullets: ["글 없는 책 · 다리 예화 · 사영리", "상대 언어로 바로 보여주기", "실시간 음성 통역으로 대화"] },
  { ...GOLDT, title: "실시간 통역", sub: "말이 통하지 않아도 괜찮아요", bullets: ["내 언어 ↔ 상대 언어 양방향", "말하면 바로 번역하고 읽어줘요", "표현집으로 자주 쓰는 문장"] },
  { ...GOLDT, title: "선교 현장 도구", sub: "현장에 필요한 것들을 한 곳에", bullets: ["환율 계산기", "사진 속 글자 이미지 번역", "긴급 SOS"] },
  { ...BLUE, title: "성경 퀴즈", sub: "말씀을 즐겁게 익혀요", bullets: ["난이도 · 범위 골라 풀기", "성경 전권 완주 모드", "점수 · 진도 · 랭킹"] },
  { ...BLUE, title: "소그룹 모임", sub: "함께 걷는 신앙의 길", bullets: ["공지 · 사진 · 실시간 채팅", "모임 정보 한눈에", "카카오로 초대하기"] },
  { ...GREEN, title: "양육 · 교육", sub: "새신자부터 깊이까지", bullets: ["새신자 · 세례 · 입교 과정", "웨스트민스터 소요리문답", "차근차근 단계별 학습"] },
  { ...AMBER, title: "마음에 닿는 말씀", sub: "지금 마음에 필요한 위로", bullets: ["감정 · 상황을 적으면", "딱 맞는 위로의 성구를", "연관 말씀 이어보기"] },
  { ...GOLDT, title: "언제 어디서나", sub: "복음 · 선교 · 양육 동행자", bullets: ["한국어 · 영어 · 태국어 · 라오어…", "어르신도 쉬운 큰 글씨 · 고대비", "가볍고 빠른 앱"] },
];

let i = 1;
for (const s of SCREENS) {
  const n = String(i).padStart(2, "0");
  await sharp(Buffer.from(screen(s)), { density: 144 }).resize(1080, 1920).png().toFile(`${OUT}/${n}.png`);
  console.log("✓", `screenshots/${n}.png`);
  i++;
}
console.log("done — 8 screenshots (1080x1920)");
