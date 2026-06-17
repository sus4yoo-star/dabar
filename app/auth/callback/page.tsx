"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 카카오/구글 로그인 후 돌아오는 곳.
// PKCE 방식이면 주소에 ?code=... 가 붙어 오므로, 그 코드를 세션으로 교환한다.
function CallbackInner() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const oauthError = url.searchParams.get("error");
      if (oauthError) { setError(true); return; }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // 코드가 이미 처리됐을 수도 있으니, 세션이 실제로 잡혔는지 확인 후 판단
          const { data } = await supabase.auth.getSession();
          if (!data.session) { setError(true); return; }
        }
      }
      // 동행 초대 링크로 들어와 로그인한 경우, 수락 화면으로 복귀
      let next = "/";
      try {
        const pending = localStorage.getItem("besora.invite");
        if (pending) next = `/share/join?code=${pending}`;
      } catch { /* ignore */ }
      router.replace(next);
    })();
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "5rem 1.5rem", color: theme.textMuted }}>
      {error ? (
        <>
          <p style={{ marginBottom: 16 }}>{t("auth.cbFail")}</p>
          <button
            onClick={() => router.replace("/login")}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: theme.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            {t("auth.cbRetry")}
          </button>
        </>
      ) : (
        <p>{t("auth.cbLoading")}</p>
      )}
    </div>
  );
}

function CallbackFallback() {
  const { t } = useI18n();
  return <div style={{ textAlign: "center", padding: "5rem", color: "#aaa" }}>{t("auth.cbLoading")}</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackInner />
    </Suspense>
  );
}
