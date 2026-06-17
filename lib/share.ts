// 공유 헬퍼: 휴대폰 공유시트(카카오톡·메시지·인스타 등) → 안 되면 링크 복사.
// 카카오 SDK(카드형)는 별도 개발자 설정이 필요하고 4019 등 오류가 잦아, 안정적인
// OS 공유시트를 기본으로 쓴다. 카톡으로 보내면 링크의 OG 미리보기 카드가 뜬다.

function appLink(): string {
  if (typeof window === "undefined") return "https://dabar.theamov.com";
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

async function doShare(text: string, url: string): Promise<"shared" | "copied" | "none" | "cancelled"> {
  const nav = navigator as Navigator & { share?: (d: any) => Promise<void> };
  if (nav.share) {
    try { await nav.share({ title: "DABAR · 말씀 퀴즈", text, url }); return "shared"; }
    catch (e) {
      // 사용자가 공유시트를 의도적으로 닫은 경우(AbortError)는 복사 폴백을 띄우지 않는다
      if (e instanceof Error && e.name === "AbortError") return "cancelled";
      // 그 외(미지원/오류)는 복사 폴백 시도
    }
  }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); return "copied"; }
  catch { return "none"; }
}

// 친구 초대
export async function shareInvite(): Promise<void> {
  const url = appLink();
  const text = "다바르(DABAR) 성경 말씀 퀴즈, 같이 풀어요! 🏆 랭킹에서 만나요";
  const r = await doShare(text, url);
  if (r === "copied") alert("초대 링크를 복사했어요! 친구에게 붙여넣어 보내세요 🙂");
  else if (r === "none") prompt("이 링크를 복사해 친구에게 보내세요:", url);
}

// 결과 공유
export async function shareResult(args: { score: number; total: number; percentage: number; message: string }): Promise<void> {
  const url = appLink();
  const text = `DABAR 성경 퀴즈 결과 — ${args.score}/${args.total} (${args.percentage}%) ${args.message}\n나도 도전해보기!`;
  const r = await doShare(text, url);
  if (r === "copied") alert("결과 링크를 복사했어요! 붙여넣어 공유하세요 🙂");
  else if (r === "none") prompt("이 링크를 복사해 공유하세요:", url);
}
