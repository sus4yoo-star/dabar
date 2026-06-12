-- =====================================================================
--  베소라 "동행" 웹 푸시 알림 — 구독 저장 + 상대 구독 조회
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
--  ※ besora-companion.sql 이 먼저 적용돼 있어야 합니다.
-- =====================================================================

-- 1) 브라우저 푸시 구독 저장
create table if not exists besora.push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_push_user on besora.push_subscriptions(user_id);

alter table besora.push_subscriptions enable row level security;
drop policy if exists push_sel on besora.push_subscriptions;
create policy push_sel on besora.push_subscriptions for select using (user_id = auth.uid());
drop policy if exists push_ins on besora.push_subscriptions;
create policy push_ins on besora.push_subscriptions for insert with check (user_id = auth.uid());
drop policy if exists push_upd on besora.push_subscriptions;
create policy push_upd on besora.push_subscriptions for update using (user_id = auth.uid());
drop policy if exists push_del on besora.push_subscriptions;
create policy push_del on besora.push_subscriptions for delete using (user_id = auth.uid());

grant select, insert, update, delete on besora.push_subscriptions to authenticated;

-- 2) 동행 상대의 구독 목록 (발송 API 가 사용) — 내가 그 동행에 속한 경우만
create or replace function besora.peer_push_subs(p_companion uuid)
returns table (endpoint text, p256dh text, auth text)
language sql security definer set search_path = besora
as $$
  select s.endpoint, s.p256dh, s.auth
  from besora.companions c
  join besora.push_subscriptions s
    on s.user_id = case when c.user_a = auth.uid() then c.user_b else c.user_a end
  where c.id = p_companion
    and (c.user_a = auth.uid() or c.user_b = auth.uid());
$$;
grant execute on function besora.peer_push_subs(uuid) to authenticated;

-- 끝.
