/**
 * DABAR PWA 아이콘 생성 스크립트
 * 실행: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/icons");
fs.mkdirSync(outDir, { recursive: true });

function buildSvg(size) {
  // 아이콘 요소 크기를 512 기준으로 설계, size는 출력 해상도
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a2882"/>
      <stop offset="100%" stop-color="#2d1654"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0bb6a"/>
      <stop offset="100%" stop-color="#b8922a"/>
    </linearGradient>
  </defs>

  <!-- 배경 (둥근 모서리) -->
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>

  <!-- 별빛 장식 (상단 중앙) -->
  <circle cx="256" cy="92" r="13" fill="url(#gold)" opacity="0.95"/>
  <line x1="256" y1="62" x2="256" y2="122" stroke="#c9a84c" stroke-width="5" opacity="0.5" stroke-linecap="round"/>
  <line x1="226" y1="92" x2="286" y2="92" stroke="#c9a84c" stroke-width="5" opacity="0.5" stroke-linecap="round"/>

  <!-- 펼친 책 — 왼쪽 페이지 -->
  <path d="M64 196 Q62 178 88 182 L250 200 L250 408 L88 420 Q62 424 64 404 Z"
        fill="#2d1654" stroke="url(#gold)" stroke-width="11" stroke-linejoin="round"/>
  <!-- 왼쪽 페이지 텍스트 줄 -->
  <line x1="98" y1="244" x2="226" y2="238" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="98" y1="278" x2="226" y2="272" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="98" y1="312" x2="226" y2="306" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="98" y1="346" x2="190" y2="341" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>

  <!-- 책등 -->
  <rect x="249" y="183" width="20" height="240" rx="6" fill="url(#gold)"/>

  <!-- 펼친 책 — 오른쪽 페이지 -->
  <path d="M448 196 Q450 178 424 182 L262 200 L262 408 L424 420 Q450 424 448 404 Z"
        fill="#2d1654" stroke="url(#gold)" stroke-width="11" stroke-linejoin="round"/>
  <!-- 오른쪽 페이지 텍스트 줄 -->
  <line x1="286" y1="238" x2="414" y2="244" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="286" y1="272" x2="414" y2="278" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="286" y1="306" x2="414" y2="312" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="322" y1="341" x2="414" y2="346" stroke="#c9a84c" stroke-width="7.5" opacity="0.45" stroke-linecap="round"/>
</svg>`;
}

async function generate(size, filename) {
  const svg = Buffer.from(buildSvg(size));
  const outPath = path.join(outDir, filename);
  await sharp(svg).png().toFile(outPath);
  console.log(`✅ ${filename} (${size}×${size})`);
}

await generate(192, "icon-192.png");
await generate(512, "icon-512.png");
console.log("🎉 아이콘 생성 완료 → public/icons/");
