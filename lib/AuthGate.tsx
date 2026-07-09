"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";

// App Store 5.1.1(v): 계정과 무관한 기능은 로그인 없이(게스트로) 쓸 수 있어야 한다.
// 그래서 기본은 "게스트 허용"이고, 아래 계정 기반 기능만 로그인을 요구한다.
//  - /account, /admin: 내 계정·관리자
//  - /groups: 소그룹(멤버십·채팅)
//  - /history(오답노트), /progress(진도): 개인 학습 데이터
//  - /share/me(동행), /share/chat(동행 채팅), /share/join(초대 수락=계정 연결)
// 그 외(홈·복음 전하기·선교 도구·성경퀴즈·양육·랭킹 열람 등)는 모두 게스트 접근 가능.
const AUTH_REQUIRED_PREFIXES = [
  "/account", "/admin", "/groups", "/history", "/progress",
  "/share/me", "/share/chat", "/share/join",
];

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

// 게스트도 대부분의 화면을 자유롭게 쓰고, 계정 기반 기능에 들어갈 때만 로그인으로 유도한다.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const needsAuth = AUTH_REQUIRED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (loading) return;
    if (!user && needsAuth) router.replace("/login");
  }, [loading, user, needsAuth, router]);

  // 로그인 상태 확인 중 → 스플래시
  if (loading) return <Splash />;
  // 비로그인 + 계정 기반 페이지 → 리다이렉트 되는 동안 빈 스플래시(내용 노출 방지)
  if (!user && needsAuth) return <Splash />;
  return <>{children}</>;
}
