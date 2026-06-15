-- =====================================================================
--  사역 일정(ministry_events) / 사역 공지사항(ministry_notices)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
--  관리자/리더(profiles.is_admin 또는 is_leader)가 등록·수정·삭제,
--  로그인 사용자 전체가 열람.
-- =====================================================================

-- 사역 일정 -----------------------------------------------------------
create table if not exists besora.ministry_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  starts_at   timestamptz not null,            -- 일시
  place       text,                             -- 장소(선택)
  note        text,                             -- 메모(선택)
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_min_events_starts on besora.ministry_events(starts_at);

-- 사역 공지사항 -------------------------------------------------------
create table if not exists besora.ministry_notices (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_min_notices_created on besora.ministry_notices(created_at desc);

-- 관리자/리더 여부 검사 (public.profiles 참조) ------------------------
create or replace function besora.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (coalesce(p.is_admin, false) or coalesce(p.is_leader, false))
       from public.profiles p where p.id = auth.uid()), false);
$$;

-- RLS: 전체 열람(로그인), 등록/수정/삭제는 관리자·리더만 ---------------
alter table besora.ministry_events enable row level security;
drop policy if exists me_sel on besora.ministry_events;
create policy me_sel on besora.ministry_events for select using (true);
drop policy if exists me_ins on besora.ministry_events;
create policy me_ins on besora.ministry_events for insert with check (besora.is_manager());
drop policy if exists me_upd on besora.ministry_events;
create policy me_upd on besora.ministry_events for update using (besora.is_manager()) with check (besora.is_manager());
drop policy if exists me_del on besora.ministry_events;
create policy me_del on besora.ministry_events for delete using (besora.is_manager());

alter table besora.ministry_notices enable row level security;
drop policy if exists mn_sel on besora.ministry_notices;
create policy mn_sel on besora.ministry_notices for select using (true);
drop policy if exists mn_ins on besora.ministry_notices;
create policy mn_ins on besora.ministry_notices for insert with check (besora.is_manager());
drop policy if exists mn_upd on besora.ministry_notices;
create policy mn_upd on besora.ministry_notices for update using (besora.is_manager()) with check (besora.is_manager());
drop policy if exists mn_del on besora.ministry_notices;
create policy mn_del on besora.ministry_notices for delete using (besora.is_manager());

grant select, insert, update, delete on besora.ministry_events  to authenticated;
grant select, insert, update, delete on besora.ministry_notices to authenticated;

-- 끝.
