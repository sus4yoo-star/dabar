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
  isAdmin: boolean;
  isLeader: boolean;
  signIn: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  updateNickname: (name: string) => Promise<boolean>;
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
  const [nickname, setNickname] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  // 프로필 보장: 없으면 생성(소셜 이름으로), 있으면 닉네임은 유지하고
  // 아바타/공급자만 갱신한다. (사용자가 바꾼 닉네임을 덮어쓰지 않도록)
  const ensureProfile = useCallback(async (u: User) => {
    const provider = u.app_metadata?.provider ?? null;
    // is_admin/is_leader 컬럼이 없는 환경에서도 프로필 로드가 통째로 깨지지 않게 단계적 폴백
    let res = await supabase.from("profiles").select("nickname, is_admin, is_leader").eq("id", u.id).maybeSingle();
    if (res.error) res = await supabase.from("profiles").select("nickname, is_admin").eq("id", u.id).maybeSingle();
    if (res.error) res = await supabase.from("profiles").select("nickname").eq("id", u.id).maybeSingle();
    const data = res.data as { nickname?: string; is_admin?: boolean; is_leader?: boolean } | null;
    if (data) {
      setNickname(data.nickname || pickNickname(u));
      setIsAdmin(!!data.is_admin);
      setIsLeader(!!data.is_leader);
      supabase.from("profiles").update({ avatar_url: pickAvatar(u), provider, updated_at: new Date().toISOString() }).eq("id", u.id).then(() => {});
    } else {
      const nn = pickNickname(u);
      await supabase.from("profiles").insert({ id: u.id, nickname: nn, avatar_url: pickAvatar(u), provider });
      setNickname(nn);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setNickname(pickNickname(data.session?.user ?? null));
      setLoading(false);
      if (data.session?.user) ensureProfile(data.session.user).catch(() => {});
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      if (sess?.user) setNickname(prev => prev || pickNickname(sess.user));
      if (event === "SIGNED_IN" && sess?.user) ensureProfile(sess.user).catch(() => {});
    });
    return () => sub.subscription.unsubscribe();
  }, [ensureProfile]);

  const signIn = useCallback(async (provider: Provider) => {
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/auth/callback";
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setNickname("");
    setIsAdmin(false);
    setIsLeader(false);
  }, []);

  // 앱에서 닉네임 변경
  const updateNickname = useCallback(async (name: string) => {
    if (!user) return false;
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return false;
    const { error } = await supabase.from("profiles").update({ nickname: trimmed, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) { console.error("[DABAR] nickname update error:", error); return false; }
    setNickname(trimmed);
    return true;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        nickname: nickname || pickNickname(user),
        avatarUrl: pickAvatar(user),
        isAdmin,
        isLeader,
        signIn,
        signOut,
        updateNickname,
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
