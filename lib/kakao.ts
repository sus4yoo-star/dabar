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

export interface KakaoFeed {
  title: string;
  description: string;
  link: string;
  buttonTitle?: string;
  imageUrl?: string;
}

// 카카오톡 피드 카드 공유 (키가 설정돼 있을 때만 동작)
export async function kakaoShareFeed({ title, description, link, buttonTitle, imageUrl }: KakaoFeed) {
  const Kakao = await ensureKakao();
  const img = imageUrl || link.replace(/\/$/, "") + "/icons/icon-512.png";
  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl: img,
      link: { mobileWebUrl: link, webUrl: link },
    },
    buttons: [{ title: buttonTitle || "DABAR 열기", link: { mobileWebUrl: link, webUrl: link } }],
  });
}
