import { createClient } from "@supabase/supabase-js";

// 브라우저에서 쓰는 클라이언트. 로그인 세션을 자동 저장/복원하고,
// OAuth(카카오·구글) 콜백은 PKCE 방식으로 안전하게 교환한다.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  }
);
