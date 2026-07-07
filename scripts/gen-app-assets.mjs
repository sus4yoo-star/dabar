import sharp from "sharp";
import { mkdirSync } from "fs";

const GOLD = "#b8901f";
const SERIF = "'Liberation Serif','Times New Roman',Georgia,serif";
const root = "/home/user/dabar";
mkdirSync(`${root}/assets`, { recursive: true });

// 펼친 책 마크 (BrandMark) — art 좌표계 x[10,54] center 32, y[6,48] center 27
const mark = (sw = 2) => `
  <path d="M32 6c.4 2.7.8 3.1 3.5 3.5-2.7.4-3.1.8-3.5 3.5-.4-2.7-.8-3.1-3.5-3.5 2.7-.4 3.1-.8 3.5-3.5z" fill="${GOLD}" stroke="${GOLD}" stroke-width="0.4"/>
  <path d="M32 24V48" fill="none" stroke="${GOLD}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M32 24C25 20 17 19 10 21.5C12 29 12 39.5 10 45C17 42.5 25 43.5 32 48" fill="none" stroke="${GOLD}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 24C39 20 47 19 54 21.5C52 29 52 39.5 54 45C47 42.5 39 43.5 32 48" fill="none" stroke="${GOLD}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 마크를 (cx,cy)에 s배율로 중앙배치하는 transform (art center 32,27)
const place = (cx, cy, s) => `translate(${cx - 32 * s},${cy - 27 * s}) scale(${s})`;

// 1) 풀 아이콘(1024) — 흰 배경 + 마크 + DABAR (letterSpacing 왼쪽쏠림 보정: x = 512 + ls/2)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#ffffff"/>
  <g transform="${place(512, 398, 10)}">${mark(2)}</g>
  <text x="518" y="838" font-family="${SERIF}" font-size="150" font-weight="700" letter-spacing="12" fill="${GOLD}" text-anchor="middle">DABAR</text>
</svg>`;

// 2) 안드로이드 적응형 전경(1024, 투명) — 텍스트 없이 마크만, 원형 크롭 안전영역 안에
const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="${place(512, 512, 11)}">${mark(2)}</g>
</svg>`;

// 3) 안드로이드 적응형 배경(1024, 흰색)
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#ffffff"/></svg>`;

// 4) 스플래시(2732) — 흰 배경 + 가운데 로크업(마크 + DABAR)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#ffffff"/>
  <g transform="${place(1366, 1244, 15)}">${mark(2)}</g>
  <text x="1375" y="1804" font-family="${SERIF}" font-size="220" font-weight="700" letter-spacing="18" fill="${GOLD}" text-anchor="middle">DABAR</text>
</svg>`;

async function png(svg, out, size) {
  let img = sharp(Buffer.from(svg), { density: 144 }); // 뷰박스 2배로 렌더(슈퍼샘플) 후 정확 크기로 축소
  if (size) img = img.resize(size, size);
  await img.png().toFile(out);
  console.log("✓", out.replace(root + "/", ""));
}

// @capacitor/assets 표준 소스 크기: 아이콘 1024, 스플래시 2732
await png(iconSvg, `${root}/assets/icon.png`, 1024);
await png(fgSvg, `${root}/assets/icon-foreground.png`, 1024);
await png(bgSvg, `${root}/assets/icon-background.png`, 1024);
await png(splashSvg, `${root}/assets/splash.png`, 2732);
await png(splashSvg, `${root}/assets/splash-dark.png`, 2732);
// 웹 PWA 아이콘도 같은 마스터로 재생성(중앙정렬 일치)
await png(iconSvg, `${root}/public/icons/icon-512.png`, 512);
await png(iconSvg, `${root}/public/icons/icon-192.png`, 192);
console.log("done");

// 5) Play 스토어 그래픽 배너(1024x500) — 흰 배경 + 가운데 로크업 + 부제
const featSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="#ffffff"/>
  <g transform="${place(512, 172, 5.6)}">${mark(2)}</g>
  <text x="516" y="392" font-family="${SERIF}" font-size="98" font-weight="700" letter-spacing="8" fill="${GOLD}" text-anchor="middle">DABAR</text>
  <text x="512" y="450" font-family="'NanumMyeongjo','Nanum Myeongjo',serif" font-size="31" font-weight="700" letter-spacing="4" fill="#4a6377" text-anchor="middle">복음 · 선교 · 양육 동행자</text>
</svg>`;
// Play 그래픽 배너는 정확히 1024x500 이어야 함 (고밀도 렌더 후 정확 크기로 다운스케일 → 선명)
await sharp(Buffer.from(featSvg), { density: 288 }).resize(1024, 500).png().toFile(`${root}/assets/feature-graphic.png`);
console.log("feature graphic done (1024x500)");
