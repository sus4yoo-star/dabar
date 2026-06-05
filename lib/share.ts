/**
 * 공유 유틸 — 이미지 저장, 기기 공유 시트(인스타·기타), 카카오톡 공유
 */

const SHARE_TITLE = "DABAR · 다바르 성경 퀴즈";

export function buildShareText(score: number, total: number, pct: number): string {
  return `다바르 성경 퀴즈에서 ${total}문제 중 ${score}개 정답! (정답률 ${pct}%)\n나도 도전해보기 👉`;
}

/** 이미지를 파일로 저장(다운로드). 인스타그램 등 직접 업로드용. */
export function downloadImage(blob: Blob, filename = "dabar-result.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Web Share API로 이미지 공유 가능 여부 */
export function canShareImage(blob: Blob): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const file = new File([blob], "dabar-result.png", { type: "image/png" });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * 기기 공유 시트 열기(모바일). 인스타그램·카카오톡·메시지 등으로 이미지+텍스트 전송.
 * 성공/취소 여부를 boolean 으로 반환. 지원 안 하면 false.
 */
export async function shareViaSheet(blob: Blob, text: string, url: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const file = new File([blob], "dabar-result.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: SHARE_TITLE, text, url, files: [file] });
    } else {
      await navigator.share({ title: SHARE_TITLE, text, url });
    }
    return true;
  } catch (e: any) {
    // 사용자가 취소한 경우(AbortError)는 조용히 무시
    if (e?.name === "AbortError") return true;
    return false;
  }
}

/**
 * 카카오톡 공유. NEXT_PUBLIC_KAKAO_JS_KEY 가 설정돼 있으면 카카오 SDK로 링크 공유,
 * 없으면 false 를 반환(호출 측에서 기기 공유 시트로 폴백).
 */
export async function shareToKakao(text: string, url: string, imageUrl?: string): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key || typeof window === "undefined") return false;

  const Kakao = await loadKakao(key);
  if (!Kakao) return false;

  try {
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: SHARE_TITLE,
        description: text,
        imageUrl: imageUrl || `${url}/icons/icon-512.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: "퀴즈 풀어보기", link: { mobileWebUrl: url, webUrl: url } }],
    });
    return true;
  } catch {
    return false;
  }
}

async function loadKakao(key: string): Promise<any | null> {
  const w = window as any;
  if (!w.Kakao) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
      s.integrity = "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.head.appendChild(s);
    }).catch(() => null);
  }
  if (!w.Kakao) return null;
  if (!w.Kakao.isInitialized()) w.Kakao.init(key);
  return w.Kakao;
}
