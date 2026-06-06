// 결과를 한 장의 PNG 이미지로 만들어 내려받게 한다 (4:5 비율 — 공유에 적합).
// 외부 라이브러리 없이 Canvas 로 직접 그린다. (앱과 같은 보라+골드 톤)

interface ResultImageArgs {
  score: number;
  total: number;
  percentage: number;
  message: string;
  color: string;   // 등급 색
  studyTip?: string;
}

const GOLD = "#d8be6e";
const GOLD_SOFT = "#c9a84c";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawResultCard({ score, total, percentage, message, color, studyTip }: ResultImageArgs): HTMLCanvasElement {
  const W = 1080, H = 1350; // 4:5
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 배경 그라데이션 (밝은 보라)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#8a5fe6");
  bg.addColorStop(0.5, "#6040c4");
  bg.addColorStop(1, "#43298f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 카드
  const cx = 70, cy = 70, cw = W - 140, ch = H - 140;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.30)";
  ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#34206f";
  roundRect(ctx, cx, cy, cw, ch, 60);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(216,190,110,0.38)";
  roundRect(ctx, cx, cy, cw, ch, 60);
  ctx.stroke();

  ctx.textAlign = "center";

  // 브랜드
  ctx.fillStyle = GOLD;
  ctx.font = "800 70px Georgia, 'Times New Roman', serif";
  ctx.fillText("DABAR", W / 2, 270);
  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "600 33px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("다바르 · 말씀 퀴즈", W / 2, 326);

  // 점수
  ctx.fillStyle = color;
  ctx.font = "800 210px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(String(score), W / 2 - 60, 640);
  ctx.fillStyle = "#b6abd6";
  ctx.font = "400 70px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`/ ${total}`, W / 2 + 135, 640);

  // 등급 문구
  ctx.fillStyle = color;
  ctx.font = "700 62px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(message, W / 2, 770);

  // 정답률 바
  const barW = 600, barH = 24, barX = (W - barW) / 2, barY = 840;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundRect(ctx, barX, barY, barW, barH, 12); ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, barX, barY, Math.max(barH, barW * (percentage / 100)), barH, 12); ctx.fill();
  ctx.fillStyle = "#d2c7f0";
  ctx.font = "600 36px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`정답률 ${percentage}%`, W / 2, barY + 86);

  // 복습 줄 (있을 때만)
  if (studyTip) {
    const boxW = cw - 120, boxX = (W - boxW) / 2, boxY = 1000, boxH = 150;
    ctx.fillStyle = "rgba(216,190,110,0.14)";
    roundRect(ctx, boxX, boxY, boxW, boxH, 24); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(216,190,110,0.42)";
    roundRect(ctx, boxX, boxY, boxW, boxH, 24); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = "700 31px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText("📖 복습하면 좋아요", W / 2, boxY + 58);
    ctx.fillStyle = "#efe9fb";
    ctx.font = "500 36px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText(fit(ctx, studyTip.replace(/^복습:\s*/, ""), boxW - 70), W / 2, boxY + 110);
  }

  // 푸터
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 28px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("DABAR by AMOV · Love Creates Value", W / 2, H - 110);

  return canvas;
}

// 너무 길면 끝을 …로 잘라 한 줄에 맞춘다
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

export function downloadResultImage(args: ResultImageArgs) {
  const canvas = drawResultCard(args);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dabar-result-${args.score}-${args.total}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
