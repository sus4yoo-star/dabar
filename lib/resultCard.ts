/**
 * 퀴즈 결과를 공유용 이미지(PNG)로 그립니다. (1080×1080, 인스타그램 정사각형)
 * 브라우저 Canvas 사용 — 클라이언트에서만 호출하세요.
 */
export interface CardData {
  score: number;
  total: number;
  pct: number;
  gradeMsg: string;
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

export async function renderResultCard(d: CardData): Promise<Blob> {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 사용할 수 없습니다.");

  // 배경 그라데이션
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#3b1f6b");
  bg.addColorStop(1, "#534ab7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  ctx.textAlign = "center";

  // 상단 로고
  ctx.fillStyle = "#c9a84c";
  ctx.font = "bold 56px Georgia, serif";
  ctx.fillText("DABAR", cx, 170);
  ctx.fillStyle = "rgba(245,230,163,0.8)";
  ctx.font = "32px sans-serif";
  ctx.fillText("다바르 · 말씀 퀴즈", cx, 220);

  // 중앙 카드
  const cardY = 300, cardH = 480, cardX = 120, cardW = W - 240;
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fill();

  // 점수
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 200px sans-serif";
  ctx.fillText(String(d.score), cx, cardY + 230);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "60px sans-serif";
  ctx.fillText(`/ ${d.total}`, cx, cardY + 300);

  // 등급 메시지
  ctx.fillStyle = "#f5e6a3";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(d.gradeMsg, cx, cardY + 390);

  // 정답률 바
  const barW = cardW - 120, barX = cardX + 60, barY = cardY + 430, barH = 22;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  roundRect(ctx, barX, barY, barW, barH, 11);
  ctx.fill();
  ctx.fillStyle = "#c9a84c";
  roundRect(ctx, barX, barY, Math.max(barH, (barW * d.pct) / 100), barH, 11);
  ctx.fill();

  // 정답률 텍스트
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "36px sans-serif";
  ctx.fillText(`정답률 ${d.pct}%`, cx, cardY + 500);

  // 하단 안내
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "38px sans-serif";
  ctx.fillText("나도 성경 퀴즈에 도전해보세요!", cx, 900);
  ctx.fillStyle = "rgba(201,168,76,0.85)";
  ctx.font = "30px sans-serif";
  ctx.fillText("DABAR by AMOV · Love Creates Value", cx, 960);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("이미지 생성 실패"))), "image/png");
  });
}
