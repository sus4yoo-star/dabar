-- =====================================================================
--  베소라 "동행" 채팅 리스트 — 읽음 추적 + 받은편지함 RPC
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
--  ※ 먼저 besora-companion.sql 을 실행해 둔 상태여야 합니다.
-- =====================================================================

-- 1) 각 사용자의 '마지막으로 읽은 시각'
alter table besora.companions add column if not exists a_read_at timestamptz;
alter table besora.companions add column if not exists b_read_at timestamptz;

-- 2) 채팅방을 열면 내 쪽 읽음 시각 갱신
create or replace function besora.mark_read(p_companion uuid)
returns void
language plpgsql security definer set search_path = besora
as $$
begin
  update besora.companions
     set a_read_at = case when user_a = auth.uid() then now() else a_read_at end,
         b_read_at = case when user_b = auth.uid() then now() else b_read_at end
   where id = p_companion and (user_a = auth.uid() or user_b = auth.uid());
end $$;

-- 3) 받은편지함 목록: 상대 + 마지막 메시지 + 안읽음 수, 최근순
create or replace function besora.chat_list()
returns table (
  companion_id uuid,
  other_id     uuid,
  last_body    text,
  last_at      timestamptz,
  last_sender  uuid,
  unread       integer
)
language sql security definer set search_path = besora
as $$
  select
    c.id,
    case when c.user_a = auth.uid() then c.user_b else c.user_a end as other_id,
    lm.body,
    lm.created_at,
    lm.sender,
    (select count(*) from besora.messages m
       where m.companion_id = c.id
         and m.sender <> auth.uid()
         and m.created_at > coalesce(
              case when c.user_a = auth.uid() then c.a_read_at else c.b_read_at end,
              '-infinity'::timestamptz))::int as unread
  from besora.companions c
  left join lateral (
    select body, created_at, sender
      from besora.messages m
     where m.companion_id = c.id
     order by created_at desc
     limit 1
  ) lm on true
  where c.user_a = auth.uid() or c.user_b = auth.uid()
  order by coalesce(lm.created_at, c.created_at) desc;
$$;

grant execute on function besora.mark_read(uuid) to authenticated;
grant execute on function besora.chat_list()     to authenticated;

-- 끝.
