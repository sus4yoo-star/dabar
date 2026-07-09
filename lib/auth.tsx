"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Capacitor } from "@capacitor/core";

export type Provider = "google" | "kakao" | "apple";

// 네이티브 앱(iOS/Android)에서 OAuth 후 앱으로 되돌아올 커스텀 딥링크.
// 웹뷰가 사파리로 새어나가지 않고, 앱 내 브라우저에서 로그인 → 이 주소로 앱 복귀.
const NATIVE_REDIRECT = "com.theamov.dabar://auth-callback";
const isNative = () => Capacitor.isNativePlatform();

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isLeader: boolean;
  signIn: (provider: Provider) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>; // 이메일로 6자리 코드 발송
  verifyEmailCode: (email: string, code: string) => Promise<void>; // 받은 코드로 로그인
  signOut: () => Promise<void>;
  updateNickname: (name: string) => Promise<boolean>;
  guestMode: boolean;        // 로그인 화면에서 "둘러보기"를 택한 게스트 (이 세션 동안 홈 접근 허용)
  enterGuestMode: () => void;
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
  // "둘러보기"를 누른 게스트. 세션 동안만 유지(앱을 새로 켜면 다시 로그인 화면부터).
  const [guestMode, setGuestMode] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem("dabar_guest") === "1") setGuestMode(true); } catch { /* */ }
  }, []);
  const enterGuestMode = useCallback(() => {
    try { sessionStorage.setItem("dabar_guest", "1"); } catch { /* */ }
    setGuestMode(true);
  }, []);

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
      // upsert: getSession 과 onAuthStateChange 가 신규 유저에 동시에 진입해도 중복 INSERT(unique 충돌) 없이 안전
      await supabase.from("profiles").upsert({ id: u.id, nickname: nn, avatar_url: pickAvatar(u), provider }, { onConflict: "id" });
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
    }).catch(() => {
      // 네트워크 불안정 시에도 스플래시에 영구히 갇히지 않도록 (현장 약전파 대비)
      setLoading(false);
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

  // 네이티브 딥링크 수신 — 앱 내 브라우저에서 OAuth 를 마치면
  // com.theamov.dabar://auth-callback?code=... 로 앱이 다시 열린다.
  // 그 code 를 (웹뷰와 같은 저장소의 PKCE verifier 로) 세션으로 교환한다.
  useEffect(() => {
    if (!isNative() || !Capacitor.isPluginAvailable("Browser")) return;
    let remove: (() => void) | undefined;
    (async () => {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");
      const handle = await App.addListener("appUrlOpen", async ({ url }) => {
        if (!url || !url.startsWith(NATIVE_REDIRECT)) return;
        const query = url.includes("?") ? url.split("?")[1] : "";
        const params = new URLSearchParams(query);
        const code = params.get("code");
        try { await Browser.close(); } catch { /* 이미 닫혔을 수 있음 */ }
        if (code) {
          try { await supabase.auth.exchangeCodeForSession(code); } catch { /* 세션 확인은 onAuthStateChange 가 처리 */ }
        }
      });
      remove = () => handle.remove();
    })();
    return () => { if (remove) remove(); };
  }, []);

  const signIn = useCallback(async (provider: Provider) => {
    // 네이티브 + Browser 플러그인이 탑재된 빌드: 앱 내 브라우저에서 로그인 → 딥링크로 앱 복귀.
    // (플러그인이 없는 옛 빌드에서는 아래 웹 리다이렉트 방식으로 폴백 → 로그인이 깨지지 않음)
    if (isNative() && Capacitor.isPluginAvailable("Browser")) {
      const { Browser } = await import("@capacitor/browser");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      });
      if (error || !data?.url) throw error ?? new Error("OAuth URL 생성 실패");
      await Browser.open({ url: data.url, presentationStyle: "popover" });
      return; // 이후는 appUrlOpen 리스너가 처리
    }
    // 웹: 기존 리다이렉트 방식
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/auth/callback";
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }, []);

  // 이메일 로그인 — 링크 대신 6자리 코드를 보낸다. (링크는 다른 브라우저에서 열리면
  // PKCE 검증이 깨져 실패하지만, 코드는 앱 안에서 바로 입력해 인증하므로 안전하다.)
  const signInWithEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  // 받은 6자리 코드로 로그인 완료
  const verifyEmailCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (error) throw error;
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
        signInWithEmail,
        verifyEmailCode,
        signOut,
        updateNickname,
        guestMode,
        enterGuestMode,
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
