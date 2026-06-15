-- =====================================================================
--  소그룹 모임 채팅 푸시 — 같은 모임의 '나 외 멤버' 구독 목록 조회
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
--  ※ besora-push.sql(push_subscriptions), besora-groups.sql 이 먼저 적용돼 있어야 함.
-- =====================================================================

create or replace function besora.group_push_subs(p_group uuid)
returns table (endpoint text, p256dh text, auth text)
language sql security definer set search_path = besora
as $$
  select s.endpoint, s.p256dh, s.auth
  from besora.group_members me
  join besora.group_members other
    on other.group_id = me.group_id and other.user_id <> me.user_id
  join besora.push_subscriptions s
    on s.user_id = other.user_id
  where me.group_id = p_group
    and me.user_id = auth.uid();
$$;
grant execute on function besora.group_push_subs(uuid) to authenticated;

-- 끝.
