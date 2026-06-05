// 카카오톡 공유 기능.
// - 카카오 JavaScript SDK 를 처음 쓸 때 한 번만 동적으로 불러오고 init 한다.
// - 키는 환경변수 NEXT_PUBLIC_KAKAO_JS_KEY 로 주입한다(카카오 개발자센터 발급).
// - 키가 없으면 공유 버튼을 누가 눌러도 조용히 실패하지 않도록, 호출부에서
//   isKakaoReady() 로 미리 확인한다.

declare global {
  interface Window {
    Kakao?: any;
  }
}

const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

let loadPromise: Promise<void> | null = null;

export function kakaoKey(): string | undefined {
  return process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
}

export function isKakaoConfigured(): boolean {
  return !!kakaoKey();
}

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Kakao) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("카카오 SDK 로드 실패"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

async function ensureKakao(): Promise<any> {
  const key = kakaoKey();
  if (!key) throw new Error("NEXT_PUBLIC_KAKAO_JS_KEY 가 설정되지 않았습니다.");
  await loadSdk();
  const Kakao = window.Kakao;
  if (!Kakao.isInitialized()) Kakao.init(key);
  return Kakao;
}

interface ShareArgs {
  score: number;
  total: number;
  percentage: number;
  message: string; // 등급 문구 등
}

// 결과를 카카오톡으로 공유한다. 공유 카드에는 앱 링크가 함께 담겨,
// 친구가 누르면 DABAR 로 들어와 바로 퀴즈를 풀 수 있다.
export async function shareResultToKakao({ score, total, percentage, message }: ShareArgs) {
  const Kakao = await ensureKakao();
  const link =
    (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) || "https://dabar.app";
  const imageUrl = link.replace(/\/$/, "") + "/icons/icon-512.png";

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `DABAR 성경 퀴즈 결과 — ${score}/${total} (${percentage}%)`,
      description: `${message}\n나도 말씀 퀴즈에 도전해보기!`,
      imageUrl,
      link: { mobileWebUrl: link, webUrl: link },
    },
    buttons: [
      { title: "퀴즈 풀러 가기", link: { mobileWebUrl: link, webUrl: link } },
    ],
  });
}
