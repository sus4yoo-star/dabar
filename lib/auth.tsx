"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export type Provider = "google" | "kakao";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string;
  avatarUrl: string | null;
  signIn: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// 소셜 로그인 메타데이터에서 닉네임/프로필 사진을 최대한 뽑아낸다.
// (카카오·구글이 넣어주는 필드 이름이 제각각이라 후보를 차례로 확인)
function pickNickname(user: User | null): string {
  if (!user) return "익명";
  const m = user.user_metadata || {};
  return (
    m.nickname || m.name || m.full_name || m.user_name ||
    m.preferred_username || (user.email ? user.email.split("@")[0] : "") || "익명"
  );
}
function pickAvatar(user: User | null): string | null {
  if (!user) return null;
  const m = user.user_metadata || {};
  return m.avatar_url || m.picture || m.profile_image_url || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 직후 프로필 테이블에 닉네임/사진을 저장(있으면 갱신)해서
  // 랭킹 화면이 최신 이름을 보여줄 수 있게 한다.
  const upsertProfile = useCallback(async (u: User) => {
    const provider = u.app_metadata?.provider ?? null;
    await supabase.from("profiles").upsert(
      {
        id: u.id,
        nickname: pickNickname(u),
        avatar_url: pickAvatar(u),
        provider,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      if (event === "SIGNED_IN" && sess?.user) {
        upsertProfile(sess.user).catch(() => {});
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [upsertProfile]);

  const signIn = useCallback(async (provider: Provider) => {
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/auth/callback";
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        nickname: pickNickname(user),
        avatarUrl: pickAvatar(user),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// 로그인하지 않으면 다바르를 시작할 수 없도록 막는 관문.
// 로그인 흐름 자체(로그인 화면·OAuth 콜백)는 통과시킨다.
const PUBLIC_PATHS = ["/login", "/auth/callback"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // 비로그인 사용자가 보호된 화면에 들어오면 로그인 화면으로 보낸다.
  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.replace("/login");
    }
  }, [loading, user, isPublic, router]);

  // 로그인 화면 등 공개 경로는 그대로 보여준다.
  if (isPublic) return <>{children}</>;

  // 세션 확인 중이거나, 로그인 화면으로 보내는 도중에는 로딩만 표시.
  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.textMuted,
          fontSize: 14,
        }}
      >
        불러오는 중...
      </div>
    );
  }

  return <>{children}</>;
}
