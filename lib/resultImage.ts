// 결과를 한 장의 PNG 이미지로 만들어 내려받게 한다.
// 외부 라이브러리 없이 Canvas 로 직접 그린다. (앱과 같은 보라+골드 다크 톤)

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
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 배경 그라데이션 (보라)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#6f4ad0");
  bg.addColorStop(0.5, "#4a2fa0");
  bg.addColorStop(1, "#2d1c66");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 카드 (짙은 보라 + 골드 테두리)
  const cx = 70, cy = 70, cw = W - 140, ch = H - 140;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#241152";
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(216,190,110,0.35)";
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.stroke();

  ctx.textAlign = "center";

  // 브랜드
  ctx.fillStyle = GOLD;
  ctx.font = "800 66px Georgia, 'Times New Roman', serif";
  ctx.fillText("DABAR", W / 2, 240);
  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "600 32px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("다바르 · 말씀 퀴즈", W / 2, 292);

  // 점수
  ctx.fillStyle = color;
  ctx.font = "800 190px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(String(score), W / 2 - 55, 500);
  ctx.fillStyle = "#a99fc9";
  ctx.font = "400 66px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`/ ${total}`, W / 2 + 130, 500);

  // 등급 문구
  ctx.fillStyle = color;
  ctx.font = "700 58px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(message, W / 2, 600);

  // 정답률 바
  const barW = 560, barH = 22, barX = (W - barW) / 2, barY = 660;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, barX, barY, barW, barH, 11); ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, barX, barY, Math.max(barH, barW * (percentage / 100)), barH, 11); ctx.fill();
  ctx.fillStyle = "#c9b8ef";
  ctx.font = "600 34px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`정답률 ${percentage}%`, W / 2, barY + 80);

  // 복습 추천 박스
  if (studyTip) {
    const boxW = cw - 120, boxX = (W - boxW) / 2, boxY = 790, boxH = 150;
    ctx.fillStyle = "rgba(216,190,110,0.12)";
    roundRect(ctx, boxX, boxY, boxW, boxH, 22); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(216,190,110,0.4)";
    roundRect(ctx, boxX, boxY, boxW, boxH, 22); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = "700 30px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText("📖 오늘의 복습 추천", W / 2, boxY + 56);
    ctx.fillStyle = "#efe9fb";
    ctx.font = "500 34px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText(fit(ctx, studyTip, boxW - 60), W / 2, boxY + 108);
  }

  // 푸터
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 28px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("DABAR by AMOV · Love Creates Value", W / 2, H - 120);

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
