-- =====================================================================
--  Fix: anon 에게 besora.is_member(uuid) 실행 권한 부여
-- =====================================================================
-- besora.groups 의 SELECT 정책은  using (is_public or besora.is_member(id)) 이다.
-- anon 도 groups SELECT 권한이 있으므로, 비공개(is_public = false) 행이 하나라도
-- 있으면 Postgres 가 is_member() 를 평가해야 하는데 anon 에게는 EXECUTE 권한이
-- 없어 "permission denied for function is_member" 로 쿼리 전체가 실패할 수 있다.
-- 이 함수는 SECURITY DEFINER 이며 현재 uid 기준 boolean 만 반환한다(anon 은
-- auth.uid() 가 null → 항상 false). 따라서 anon 에게 EXECUTE 를 줘도 안전하다.
grant execute on function besora.is_member(uuid) to anon;
