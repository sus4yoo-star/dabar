"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

// 로그인 없이 접근 가능한 경로 (이 두 곳까지 막으면 로그인 자체가 불가능해짐)
const PUBLIC_PREFIXES = ["/login", "/auth"];

function Splash() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "radial-gradient(135% 95% at 50% -8%, #6f4ad0 0%, #4a2fa0 42%, #2d1c66 100%)" }}>
      <img src="/icons/icon-192.png" alt="DABAR" width={84} height={84} style={{ borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }} />
      <p style={{ fontSize: 12, color: "#c9b8ef", letterSpacing: 3, margin: 0 }}>DABAR</p>
    </div>
  );
}

// 비로그인 사용자는 무조건 /login 으로 보내, 가입/로그인을 먼저 하도록 강제한다.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const isPublic = PUBLIC_PREFIXES.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace("/login");
  }, [loading, user, isPublic, router]);

  // 로그인 상태 확인 중 → 스플래시
  if (loading) return <Splash />;
  // 비로그인 + 보호 페이지 → 리다이렉트 되는 동안 빈 스플래시(내용 노출 방지)
  if (!user && !isPublic) return <Splash />;
  return <>{children}</>;
}
