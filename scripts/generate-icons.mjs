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
  <circle cx="256" cy="82" r="10" fill="url(#gold)" opacity="0.9"/>
  <line x1="256" y1="60" x2="256" y2="104" stroke="#c9a84c" stroke-width="4" opacity="0.5" stroke-linecap="round"/>
  <line x1="234" y1="82" x2="278" y2="82" stroke="#c9a84c" stroke-width="4" opacity="0.5" stroke-linecap="round"/>

  <!-- 펼친 책 — 왼쪽 페이지 -->
  <path d="M88 168 Q86 152 108 156 L248 172 L248 352 L108 362 Q86 366 88 348 Z"
        fill="#2d1654" stroke="url(#gold)" stroke-width="9" stroke-linejoin="round"/>
  <!-- 왼쪽 페이지 텍스트 줄 -->
  <line x1="118" y1="208" x2="228" y2="203" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="118" y1="237" x2="228" y2="232" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="118" y1="266" x2="228" y2="261" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="118" y1="295" x2="198" y2="291" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>

  <!-- 책등 -->
  <rect x="247" y="155" width="18" height="208" rx="5" fill="url(#gold)"/>

  <!-- 펼친 책 — 오른쪽 페이지 -->
  <path d="M424 168 Q426 152 404 156 L264 172 L264 352 L404 362 Q426 366 424 348 Z"
        fill="#2d1654" stroke="url(#gold)" stroke-width="9" stroke-linejoin="round"/>
  <!-- 오른쪽 페이지 텍스트 줄 -->
  <line x1="284" y1="203" x2="394" y2="208" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="284" y1="232" x2="394" y2="237" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="284" y1="261" x2="394" y2="266" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>
  <line x1="284" y1="291" x2="354" y2="295" stroke="#c9a84c" stroke-width="6.5" opacity="0.45" stroke-linecap="round"/>

  <!-- 하단 텍스트 -->
  <text x="256" y="432"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="58" font-weight="bold" fill="url(#gold)"
        text-anchor="middle" letter-spacing="8">DABAR</text>
  <text x="256" y="472"
        font-family="Arial, sans-serif"
        font-size="28" fill="#c9a84c"
        text-anchor="middle" opacity="0.65" letter-spacing="3">다바르 · 말씀</text>
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
