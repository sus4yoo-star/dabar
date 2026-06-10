import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local (또는 Netlify 환경변수)에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정하세요."
    );
  }
  _client = createClient(url, key, {
    // 베소라 테이블은 다바르 등 기존 프로젝트와 충돌하지 않도록
    // 전용 'besora' schema 안에 격리되어 있다.
    db: { schema: "besora" },
    auth: { persistSession: true, autoRefreshToken: true },
  }) as unknown as SupabaseClient;
  return _client;
}
