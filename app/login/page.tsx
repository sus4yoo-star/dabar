"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";

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
      await signIn(provider); // 브라우저가 카카오/구글 동의 화면으로 이동
    } catch (e) {
      setBusy(null);
      alert("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, color: theme.primary, letterSpacing: 4, margin: "0 0 6px" }}>DABAR</h1>
      <p style={{ fontSize: 14, color: theme.textMuted, margin: "0 0 3rem" }}>로그인하고 점수를 기록하고 랭킹에 도전하세요</p>

      <button
        onClick={() => handle("kakao")}
        disabled={busy !== null}
        style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700, background: "#FEE500", color: "#191600", border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 12, opacity: busy && busy !== "kakao" ? 0.5 : 1 }}
      >
        {busy === "kakao" ? "이동 중..." : "카카오로 시작하기"}
      </button>

      <button
        onClick={() => handle("google")}
        disabled={busy !== null}
        style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700, background: "#fff", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer", opacity: busy && busy !== "google" ? 0.5 : 1 }}
      >
        {busy === "google" ? "이동 중..." : "구글(Gmail)로 시작하기"}
      </button>

      <button
        onClick={() => router.push("/")}
        style={{ marginTop: 28, fontSize: 13, color: theme.textMuted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
      >
        로그인 없이 둘러보기
      </button>

      <p style={{ fontSize: 11, color: "#bbb", marginTop: "3rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
