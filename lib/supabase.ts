import { createClient } from "@supabase/supabase-js";

// 브라우저에서 쓰는 클라이언트. 로그인 세션을 자동 저장/복원하고,
// OAuth(카카오·구글) 콜백은 PKCE 방식으로 안전하게 교환한다.
// detectSessionInUrl 은 false 로 둔다 — 콜백 페이지(/auth/callback)에서
// 직접 한 번만 코드를 교환한다. (자동+수동 이중 교환 → "이미 쓴 코드" 오류 방지)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  }
);
