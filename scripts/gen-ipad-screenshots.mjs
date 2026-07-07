import sharp from "sharp";
import { mkdirSync } from "fs";

// App Store 13" iPad 규격: 2048 x 2732 (세로).
// 실제 폰 스크린샷(1320x2868)을 태블릿 캔버스 중앙에 라운드+그림자로 얹는다.
const W = 2048, H = 2732;
const SRC = "/tmp/claude-0/-home-user-dabar/54dba623-ac5f-50ec-8068-66f65165586e/scratchpad/zip4";
const OUT = "/home/user/dabar/assets/ios-ipad-screenshots";
mkdirSync(OUT, { recursive: true });

const files = ["IMG_4577","IMG_4578","IMG_4579","IMG_4580","IMG_4581","IMG_4583","IMG_4587","IMG_4589"];

const PH_H = 2480;              // 폰 이미지 높이
const R = 46;                  // 라운드 반경
const BG = "#f5f1e8";          // 따뜻한 브랜드 배경

let i = 1;
for (const f of files) {
  const n = String(i).padStart(2, "0");
  // 1) 폰 스크린샷을 높이 기준으로 리사이즈
  const phone = sharp(`${SRC}/${f}.PNG`).resize({ height: PH_H });
  const meta = await phone.metadata();
  // resize by height only → 실제 크기 다시 계산
  const resized = await phone.png().toBuffer();
  const rMeta = await sharp(resized).metadata();
  const pw = rMeta.width, ph = rMeta.height;

  // 2) 라운드 코너 마스크 적용
  const mask = Buffer.from(
    `<svg width="${pw}" height="${ph}"><rect x="0" y="0" width="${pw}" height="${ph}" rx="${R}" ry="${R}"/></svg>`
  );
  const rounded = await sharp(resized)
    .composite([{ input: mask, blend: "dest-in" }])
    .png().toBuffer();

  const x = Math.round((W - pw) / 2);
  const y = Math.round((H - ph) / 2);

  // 3) 그림자 (검은 라운드 사각형 → 블러)
  const shadow = await sharp(
    Buffer.from(`<svg width="${pw + 80}" height="${ph + 80}"><rect x="40" y="40" width="${pw}" height="${ph}" rx="${R}" ry="${R}" fill="#000000" fill-opacity="0.20"/></svg>`)
  ).blur(30).png().toBuffer();

  // 4) 배경 + 그림자 + 폰 합성
  await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([
      { input: shadow, left: x - 40, top: y - 40 + 16 },
      { input: rounded, left: x, top: y },
    ])
    .png().toFile(`${OUT}/${n}.png`);

  const om = await sharp(`${OUT}/${n}.png`).metadata();
  console.log("✓", n, "←", f, `${om.width}x${om.height}`);
  i++;
}
console.log(`done — ${files.length} iPad screenshots (${W}x${H})`);
