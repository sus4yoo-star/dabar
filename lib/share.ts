// 공유 헬퍼: 카카오 키가 있으면 카카오 카드로, 없으면 휴대폰 공유시트(카톡 포함)/링크복사로 폴백.
import { isKakaoConfigured, kakaoShareFeed } from "@/lib/kakao";

function appLink(): string {
  if (typeof window === "undefined") return "https://dabar.theamov.com";
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

async function fallbackShare(text: string, url: string): Promise<"shared" | "copied" | "none"> {
  // 1) OS 공유시트 (모바일에서 카카오톡·메시지 등 선택 가능)
  const nav = navigator as Navigator & { share?: (d: any) => Promise<void> };
  if (nav.share) {
    try { await nav.share({ title: "DABAR · 말씀 퀴즈", text, url }); return "shared"; }
    catch { return "none"; } // 사용자가 취소
  }
  // 2) 링크 복사
  try { await navigator.clipboard.writeText(`${text}\n${url}`); return "copied"; }
  catch { return "none"; }
}

// 친구 초대
export async function shareInvite(): Promise<void> {
  const url = appLink();
  const text = "다바르(DABAR) 성경 말씀 퀴즈, 같이 풀어요! 🏆 랭킹에서 만나요";
  if (isKakaoConfigured()) {
    try { await kakaoShareFeed({ title: "DABAR · 말씀 퀴즈에 초대합니다 ✝️", description: text, link: url, buttonTitle: "같이 풀러 가기" }); return; }
    catch { /* 폴백으로 진행 */ }
  }
  const r = await fallbackShare(text, url);
  if (r === "copied") alert("초대 링크를 복사했어요! 친구에게 붙여넣어 보내세요 🙂");
  else if (r === "none") prompt("이 링크를 복사해 친구에게 보내세요:", url);
}

// 결과 공유
export async function shareResult(args: { score: number; total: number; percentage: number; message: string }): Promise<void> {
  const url = appLink();
  const text = `DABAR 성경 퀴즈 결과 — ${args.score}/${args.total} (${args.percentage}%) ${args.message}\n나도 도전해보기!`;
  if (isKakaoConfigured()) {
    try {
      await kakaoShareFeed({
        title: `DABAR 결과 — ${args.score}/${args.total} (${args.percentage}%)`,
        description: `${args.message}\n나도 말씀 퀴즈에 도전!`,
        link: url, buttonTitle: "퀴즈 풀러 가기",
      });
      return;
    } catch { /* 폴백 */ }
  }
  const r = await fallbackShare(text, url);
  if (r === "copied") alert("결과 링크를 복사했어요! 붙여넣어 공유하세요 🙂");
  else if (r === "none") prompt("이 링크를 복사해 공유하세요:", url);
}
