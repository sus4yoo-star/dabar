// 결과를 한 장의 PNG 이미지로 만들어 내려받게 한다.
// 외부 라이브러리 없이 Canvas 로 직접 그리므로 의존성이 늘지 않는다.
import { theme } from "@/lib/theme";

interface ResultImageArgs {
  score: number;
  total: number;
  percentage: number;
  message: string;
  color: string;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 결과 카드를 그린 Canvas 를 돌려준다(공유·미리보기 재사용 가능).
export function drawResultCard({ score, total, percentage, message, color }: ResultImageArgs): HTMLCanvasElement {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 배경
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // 카드
  const cardX = 90, cardY = 150, cardW = W - 180, cardH = H - 360;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fill();

  ctx.textAlign = "center";

  // 브랜드
  ctx.fillStyle = theme.primary;
  ctx.font = "800 64px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("DABAR", W / 2, cardY + 130);
  ctx.fillStyle = theme.gold;
  ctx.font = "600 30px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("다바르 · 말씀 퀴즈", W / 2, cardY + 180);

  // 점수
  ctx.fillStyle = color;
  ctx.font = "800 200px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(String(score), W / 2 - 60, cardY + 430);
  ctx.font = "400 70px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`/ ${total}`, W / 2 + 130, cardY + 430);

  // 등급 문구
  ctx.fillStyle = color;
  ctx.font = "700 56px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(message, W / 2, cardY + 540);

  // 정답률
  ctx.fillStyle = theme.textMuted;
  ctx.font = "500 40px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText(`정답률 ${percentage}%`, W / 2, cardY + 620);

  // 푸터
  ctx.fillStyle = "#bbbbbb";
  ctx.font = "500 30px -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("DABAR by AMOV · Love Creates Value", W / 2, H - 90);

  return canvas;
}

// 결과 카드를 PNG 파일로 내려받는다.
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
