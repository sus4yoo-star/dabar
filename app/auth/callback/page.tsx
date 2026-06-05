"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

// 카카오/구글 로그인 후 돌아오는 곳.
// PKCE 방식이면 주소에 ?code=... 가 붙어 오므로, 그 코드를 세션으로 교환한다.
function CallbackInner() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const oauthError = url.searchParams.get("error");
        if (oauthError) throw new Error(oauthError);
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        router.replace("/");
      } catch (e) {
        setError(true);
      }
    })();
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "5rem 1.5rem", color: theme.textMuted }}>
      {error ? (
        <>
          <p style={{ marginBottom: 16 }}>로그인을 마치지 못했어요.</p>
          <button
            onClick={() => router.replace("/login")}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: theme.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            다시 로그인하기
          </button>
        </>
      ) : (
        <p>로그인 중...</p>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "5rem", color: "#aaa" }}>로그인 중...</div>}>
      <CallbackInner />
    </Suspense>
  );
}
