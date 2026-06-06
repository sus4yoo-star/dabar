"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// 브랜드 컬러
const GOLD = "#d8be6e";
const GOLD_SOFT = "#c9a84c";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [busy, setBusy] = useState<"google" | "kakao" | null>(null);

  // 이미 로그인돼 있으면 홈으로
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handle(provider: "google" | "kakao") {
    try {
      setBusy(provider);
      await signIn(provider); // 카카오/구글 동의 화면으로 이동
    } catch (e) {
      setBusy(null);
      alert("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        background:
          "radial-gradient(135% 95% at 50% -8%, #6f4ad0 0%, #4a2fa0 42%, #2d1c66 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        {/* 아이콘 + 글로우 */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
          <div
            aria-hidden
            style={{
              position: "absolute", inset: -28, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(216,190,110,0.30) 0%, rgba(216,190,110,0) 70%)",
              filter: "blur(6px)",
            }}
          />
          <img
            src="/icons/icon-192.png"
            alt="DABAR"
            width={92}
            height={92}
            style={{ position: "relative", borderRadius: 22, boxShadow: "0 10px 40px rgba(0,0,0,0.45)" }}
          />
        </div>

        {/* 워드마크 */}
        <h1
          style={{
            fontFamily: "'Iowan Old Style','Apple Garamond',Georgia,'Times New Roman',serif",
            fontSize: 46, fontWeight: 700, color: GOLD, letterSpacing: 7, margin: "6px 0 6px",
          }}
        >
          DABAR
        </h1>
        <p style={{ fontSize: 13, color: "#c9b8ef", letterSpacing: 3, margin: "0 0 18px" }}>
          다바르 · 말씀 퀴즈
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#d9d2ee", margin: "0 0 26px" }}>
          말씀을 즐겁게, 퀴즈로 만나는 시간.<br />
          남녀노소 누구나 함께해요.
        </p>

        {/* 말씀 카드 */}
        <div
          style={{
            textAlign: "left",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(216,190,110,0.22)",
            borderLeft: `3px solid ${GOLD_SOFT}`,
            borderRadius: 14,
            padding: "16px 18px",
            margin: "0 0 28px",
          }}
        >
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#efe9fb", fontStyle: "italic", margin: "0 0 8px" }}>
            “주의 말씀은 내 발에 등이요<br />내 길에 빛이니이다”
          </p>
          <p style={{ fontSize: 12.5, color: GOLD, margin: 0, letterSpacing: 0.5 }}>— 시편 119:105</p>
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={() => handle("kakao")}
          disabled={busy !== null}
          style={{
            width: "100%", padding: 15, fontSize: 16, fontWeight: 700,
            background: "#FEE500", color: "#191600", border: "none", borderRadius: 14,
            cursor: busy ? "default" : "pointer", marginBottom: 11,
            opacity: busy && busy !== "kakao" ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <span style={{ fontSize: 17 }}>💬</span>
          {busy === "kakao" ? "이동 중..." : "카카오로 시작하기"}
        </button>

        <button
          onClick={() => handle("google")}
          disabled={busy !== null}
          style={{
            width: "100%", padding: 15, fontSize: 16, fontWeight: 700,
            background: "#ffffff", color: "#1a1a1a", border: "none", borderRadius: 14,
            cursor: busy ? "default" : "pointer",
            opacity: busy && busy !== "google" ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          }}
        >
          <GoogleMark />
          {busy === "google" ? "이동 중..." : "구글(Gmail)로 시작하기"}
        </button>

        <p style={{ fontSize: 12.5, color: "#a99fc9", marginTop: 20, lineHeight: 1.6 }}>
          가입은 무료예요. 카카오·구글 계정으로 3초 만에 시작할 수 있어요.
        </p>

        <p style={{ fontSize: 11, color: "#7a6fa3", marginTop: "2.5rem", letterSpacing: 1.5 }}>
          DABAR by AMOV · Love Creates Value
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9 41.3 15.9 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.3C39.6 41.4 45 37 45 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
