import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const GOLD = "#b8901f";
const RES = "/home/user/dabar/android/app/src/main/res";
const SPLASH_SRC = "/home/user/dabar/assets/splash.png";

const mark = () => `
  <path d="M32 6c.4 2.7.8 3.1 3.5 3.5-2.7.4-3.1.8-3.5 3.5-.4-2.7-.8-3.1-3.5-3.5 2.7-.4 3.1-.8 3.5-3.5z" fill="${GOLD}" stroke="${GOLD}" stroke-width="0.4"/>
  <path d="M32 24V48" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>
  <path d="M32 24C25 20 17 19 10 21.5C12 29 12 39.5 10 45C17 42.5 25 43.5 32 48" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 24C39 20 47 19 54 21.5C52 29 52 39.5 54 45C47 42.5 39 43.5 32 48" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
const place = (cx, cy, s) => `translate(${cx - 32 * s},${cy - 27 * s}) scale(${s})`;

// 적응형 전경(투명, 마크만) — 원형/스퀴클 크롭 안전영역 안(중앙 ~47%)
const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><g transform="${place(512, 512, 11)}">${mark()}</g></svg>`;
// 레거시 아이콘(흰 배경 + 마크, 텍스트 없음, ~56%)
const legacySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#ffffff"/><g transform="${place(512, 512, 13)}">${mark()}</g></svg>`;

const dim = async (f) => { const m = await sharp(f).metadata(); return [m.width, m.height]; };
const renderSvgTo = async (svg, size, out) => { await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toFile(out); };

let n = 0;
for (const d of readdirSync(RES)) {
  const dir = join(RES, d);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (!f.endsWith(".png")) continue;
    if (f === "ic_launcher_foreground.png") {
      const [w] = await dim(p); await renderSvgTo(fgSvg, w, p); n++;
    } else if (f === "ic_launcher.png" || f === "ic_launcher_round.png") {
      const [w] = await dim(p); await renderSvgTo(legacySvg, w, p); n++;
    } else if (f === "splash.png") {
      const [w, h] = await dim(p);
      await sharp(SPLASH_SRC).resize(w, h, { fit: "cover", position: "centre" }).png().toFile(p); n++;
    }
  }
}
console.log(`✓ regenerated ${n} android resource PNGs`);
