import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 환경변수가 없을 때 import 시점에 throw 되지 않도록 호출 시점에 lazy 생성.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)가 설정되지 않았습니다.");
  _client = createClient(url, key);
  return _client;
}
