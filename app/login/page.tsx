"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n, LangSelector } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { theme } from "@/lib/theme";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const { t } = useI18n();
  const { show, view: toastView } = useToast();
  const [busy, setBusy] = useState<"google" | "kakao" | "apple" | null>(null);

  // 이미 로그인돼 있으면 홈으로
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handle(provider: "google" | "kakao" | "apple") {
    try {
      setBusy(provider);
      await signIn(provider); // 웹: 동의 화면으로 이동 / 네이티브: 앱 내 브라우저 열림
    } catch (e) {
      show(t("login.fail"));
    } finally {
      // 네이티브에서 사용자가 브라우저를 닫아도 버튼이 다시 눌리도록 해제.
      setBusy(null);
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
        background: theme.bg,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><LangSelector /></div>
        {/* 대표 마크 + 글로우 */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
          <div
            aria-hidden
            style={{
              position: "absolute", inset: -22, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(199,154,43,0.22) 0%, rgba(199,154,43,0) 70%)",
              filter: "blur(6px)",
            }}
          />
          <div style={{ position: "relative", width: 92, height: 92, borderRadius: 26, background: "transparent", display: "grid", placeItems: "center" }}>
            <BrandMark size={72} />
          </div>
        </div>

        {/* 워드마크 */}
        <h1
          style={{
            fontFamily: "'Iowan Old Style','Apple Garamond',Georgia,'Times New Roman',serif",
            fontSize: 46, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: 7, margin: "6px 0 6px",
          }}
        >
          DABAR
        </h1>
        {/* 거룩한 금빛 장식선 */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 10px" }}>
          <span style={{ width: 34, height: 1, background: "linear-gradient(90deg, transparent, var(--t-sacred))" }} />
          <span style={{ color: "var(--t-sacred)", fontSize: 10, lineHeight: 1 }}>✦</span>
          <span style={{ width: 34, height: 1, background: "linear-gradient(90deg, var(--t-sacred), transparent)" }} />
        </div>
        <p style={{ fontSize: 13, color: theme.textMuted, letterSpacing: 3, margin: "0 0 18px" }}>
          다바르 · 말씀 퀴즈
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: theme.textMuted, margin: "0 0 26px" }}>
          {t("login.tagline1")}<br />
          {t("login.tagline2")}
        </p>

        {/* 말씀 카드 — 거룩한 골드 톤(성구) */}
        <div
          style={{
            textAlign: "left",
            background: "var(--t-sacredLight)",
            border: "1px solid var(--t-sacredBorder)",
            borderLeft: "3px solid var(--t-sacred)",
            borderRadius: 14,
            padding: "16px 18px",
            margin: "0 0 28px",
          }}
        >
          <p style={{ fontFamily: "'Iowan Old Style',Georgia,'Noto Serif KR',serif", fontSize: 15.5, lineHeight: 1.8, color: theme.text, fontStyle: "italic", margin: "0 0 8px" }}>
            “{t("login.verse")}”
          </p>
          <p style={{ fontSize: 12.5, color: "var(--t-sacred)", margin: 0, letterSpacing: 0.5, fontWeight: 700 }}>— {t("login.verseRef")}</p>
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
          {busy === "kakao" ? t("login.redirecting") : t("login.kakao")}
        </button>

        <button
          onClick={() => handle("google")}
          disabled={busy !== null}
          style={{
            width: "100%", padding: 15, fontSize: 16, fontWeight: 700,
            background: "#ffffff", color: "#1a1a1a", border: "1px solid #d8e2ea", borderRadius: 14,
            cursor: busy ? "default" : "pointer",
            opacity: busy && busy !== "google" ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          }}
        >
          <GoogleMark />
          {busy === "google" ? t("login.redirecting") : t("login.google")}
        </button>

        {/* Apple로 로그인 — 애플 심사 규정 4.8 필수(소셜 로그인 제공 시 Apple 로그인도 제공) */}
        <button
          onClick={() => handle("apple")}
          disabled={busy !== null}
          style={{
            width: "100%", padding: 15, fontSize: 16, fontWeight: 700,
            background: "#000000", color: "#ffffff", border: "none", borderRadius: 14,
            cursor: busy ? "default" : "pointer", marginTop: 11,
            opacity: busy && busy !== "apple" ? 0.55 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <AppleMark />
          {busy === "apple" ? t("login.redirecting") : t("login.apple")}
        </button>

        <p style={{ fontSize: 12.5, color: theme.textFaint, marginTop: 20, lineHeight: 1.6 }}>
          {t("login.free")}
        </p>

        <p style={{ fontSize: 11.5, marginTop: 16 }}>
          <a href="/privacy" style={{ color: theme.textMuted, textDecoration: "underline" }}>{t("privacy.title")}</a>
        </p>

        <p style={{ fontSize: 11, color: theme.textFaint, marginTop: "2rem", letterSpacing: 1.5 }}>
          DABAR by AMOV · Love Creates Value
        </p>
      </div>
      {toastView}
    </main>
  );
}

function AppleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 384 512" fill="#ffffff" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
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
