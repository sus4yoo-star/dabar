"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
      // 이미 로그인된 사용자도 프로필을 보장(랭킹 표시·집계에 필요)
      if (data.session?.user) upsertProfile(data.session.user).catch(() => {});
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
