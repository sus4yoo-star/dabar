"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";

// 로그인 없이 접근 가능한 경로 (이 두 곳까지 막으면 로그인 자체가 불가능해짐)
// /share(복음 전하기): 비신자에게 복음을 전하는 화면이라 게스트도 접근 가능해야 함
const PUBLIC_PREFIXES = ["/login", "/auth", "/share"];

// 첫 로딩 스플래시 — 깨끗한 흰 배경 + 새 골드 마크.
function Splash() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "#ffffff" }}>
      <BrandMark size={92} />
      {/* letterSpacing 은 마지막 글자 뒤에도 간격을 더해 가운데 정렬이 왼쪽으로 치우친다 → paddingLeft 로 상쇄 */}
      <p style={{ fontFamily: "'Iowan Old Style','Apple Garamond',Georgia,'Times New Roman','Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: "#b8901f", letterSpacing: 6, paddingLeft: 6, margin: 0 }}>DABAR</p>
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
