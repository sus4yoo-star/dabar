// 결과를 한 장의 PNG 이미지로 만들어 내려받게 한다 (4:5 — 공유 적합).
// Canvas 로 직접 그린다. 밝은 보라 배경 + 어두운 카드 + 골드. 오답노트 포함.

interface WrongItem { q: string; a: string; }
interface ResultImageArgs {
  score: number;
  total: number;
  percentage: number;
  message: string;
  color: string;          // 등급 색
  wrongList?: WrongItem[]; // 오답 (있으면 카드에 오답노트로 표시)
}

const GOLD = "#e6c878";
const GOLD_SOFT = "#d8be6e";
const IMG_MAX_WRONG = 3; // 이미지에는 최대 3개까지

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

export function drawResultCard({ score, total, percentage, message, color, wrongList }: ResultImageArgs): HTMLCanvasElement {
  const W = 1080, H = 1350; // 4:5
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 배경 (밝은 보라)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#9a6cf2");
  bg.addColorStop(0.5, "#6e49d8");
  bg.addColorStop(1, "#4d2fae");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 카드 (어두워서 글씨가 또렷)
  const cx = 64, cy = 64, cw = W - 128, ch = H - 128;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#241152";
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(230,200,120,0.38)";
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.stroke();

  // 브랜드
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "800 60px Georgia, 'Times New Roman', serif";
  ctx.fillText("DABAR", W / 2, 188);
  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "600 28px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("다바르 · 말씀 퀴즈", W / 2, 232);

  // 점수
  ctx.fillStyle = color;
  ctx.font = "800 150px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(String(score), W / 2 - 50, 420);
  ctx.fillStyle = "#c4b9e6";
  ctx.font = "400 56px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`/ ${total}`, W / 2 + 105, 420);

  // 등급
  ctx.fillStyle = color;
  ctx.font = "700 50px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(message, W / 2, 510);

  // 정답률 바
  const barW = 600, barH = 22, barX = (W - barW) / 2, barY = 560;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundRect(ctx, barX, barY, barW, barH, 11); ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, barX, barY, Math.max(barH, barW * (percentage / 100)), barH, 11); ctx.fill();
  ctx.fillStyle = "#d6ccf2";
  ctx.font = "600 32px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`정답률 ${percentage}%`, W / 2, barY + 70);

  // 구분선
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx + 56, 678); ctx.lineTo(cx + cw - 56, 678); ctx.stroke();

  // 오답노트
  const tx = cx + 56;
  const maxW = cw - 112;
  if (wrongList && wrongList.length > 0) {
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.font = "700 30px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText("📝 오답노트", tx, 738);

    let y = 800;
    wrongList.slice(0, IMG_MAX_WRONG).forEach((w, i) => {
      ctx.fillStyle = "#efe9fb";
      ctx.font = "600 30px -apple-system, 'Segoe UI', sans-serif";
      ctx.fillText(fit(ctx, `${i + 1}. ${w.q}`, maxW), tx, y);
      ctx.fillStyle = "#46e0a8";
      ctx.font = "700 28px -apple-system, 'Segoe UI', sans-serif";
      ctx.fillText(fit(ctx, `→ 정답: ${w.a}`, maxW), tx, y + 40);
      y += 100;
    });
    if (wrongList.length > IMG_MAX_WRONG) {
      ctx.fillStyle = "#cfc2ef";
      ctx.font = "500 26px -apple-system, 'Segoe UI', sans-serif";
      ctx.fillText(`…외 ${wrongList.length - IMG_MAX_WRONG}개 더`, tx, y + 4);
    }
  } else {
    ctx.textAlign = "center";
    ctx.fillStyle = "#46e0a8";
    ctx.font = "700 40px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillText("🎉 만점! 틀린 문제가 없어요", W / 2, 850);
  }

  // 푸터
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 26px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("DABAR by AMOV · Love Creates Value", W / 2, H - 92);

  return canvas;
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
