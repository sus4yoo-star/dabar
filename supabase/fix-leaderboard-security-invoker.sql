-- =====================================================================
--  Security Advisor 해결 — leaderboard 뷰를 SECURITY INVOKER 로 전환.
--  (뷰가 "조회하는 사용자"의 권한·RLS를 따르게 함 → Supabase CRITICAL 권고 해소)
--  안전한 이유: profiles·scores 둘 다 "누구나 읽기(select using true)" + anon/authenticated grant
--  이므로, invoker 권한으로도 랭킹 집계 결과가 동일합니다. (동작 변화 없음)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
-- =====================================================================

alter view public.leaderboard        set (security_invoker = true);
alter view public.leaderboard_weekly  set (security_invoker = true);

-- 끝.
