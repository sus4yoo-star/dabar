"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { acceptInvite, getMyId } from "@/lib/besora/companions";

function JoinInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { myLang } = useLang();
  const code = params.get("code") ?? "";

  const [state, setState] = useState<"checking" | "needLogin" | "joining" | "error">("checking");

  useEffect(() => {
    (async () => {
      if (!code) { setState("error"); return; }
      const id = await getMyId();
      if (!id) {
        // 로그인 후 돌아와 자동 수락하도록 코드 보관
        try { localStorage.setItem("besora.invite", code); } catch { /* ignore */ }
        setState("needLogin");
        return;
      }
      setState("joining");
      try {
        const companionId = await acceptInvite(code);
        try { localStorage.removeItem("besora.invite"); } catch { /* ignore */ }
        router.replace(`/share/chat/${companionId}`);
      } catch {
        setState("error");
      }
    })();
  }, [code, router]);

  return (
    <AppShell>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "32px 8px", textAlign: "center" }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: theme.text, margin: "0 0 8px" }}>{ui(myLang, "joinTitle")}</h1>
          <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6, margin: "0 0 22px" }}>{ui(myLang, "joinDesc")}</p>

          {state === "joining" || state === "checking" ? (
            <p style={{ color: theme.textMuted }}>{ui(myLang, "joining")}</p>
          ) : state === "needLogin" ? (
            <Link href="/login" style={{ display: "inline-block", borderRadius: 999, background: theme.gold, color: "#08263a", padding: "13px 26px", fontWeight: 800, textDecoration: "none" }}>
              {ui(myLang, "joinAccept")}
            </Link>
          ) : (
            <>
              <p style={{ color: theme.wrong, marginBottom: 18 }}>{ui(myLang, "joinError")}</p>
              <Link href="/share" style={{ color: theme.primarySoft, textDecoration: "underline" }}>{ui(myLang, "home")}</Link>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<AppShell><div style={{ flex: 1 }} /></AppShell>}>
      <JoinInner />
    </Suspense>
  );
}
