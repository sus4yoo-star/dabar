-- =====================================================================
--  전도 여정 — "내가 전하는 사람들"(태신자) 개인 트래커
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
--  본인만 보는 비공개 데이터 (owner = 로그인 사용자).
-- =====================================================================

create table if not exists besora.seekers (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  stage       text not null default 'interest',   -- interest | heard | decided | settled
  note        text,                                -- 기도제목·메모
  phone       text,                                -- 연락처(선택)
  next_action text,                                -- 다음 할 일(연락/초대 등)
  next_at     date,                                -- 다음 액션 날짜
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- 기존 설치 보강
alter table besora.seekers add column if not exists phone       text;
alter table besora.seekers add column if not exists next_action text;
alter table besora.seekers add column if not exists next_at     date;
create index if not exists idx_seekers_owner on besora.seekers(owner, updated_at desc);

alter table besora.seekers enable row level security;
drop policy if exists seek_sel on besora.seekers;
create policy seek_sel on besora.seekers for select using (owner = auth.uid());
drop policy if exists seek_ins on besora.seekers;
create policy seek_ins on besora.seekers for insert with check (owner = auth.uid());
drop policy if exists seek_upd on besora.seekers;
create policy seek_upd on besora.seekers for update using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists seek_del on besora.seekers;
create policy seek_del on besora.seekers for delete using (owner = auth.uid());

grant select, insert, update, delete on besora.seekers to authenticated;

-- 끝.
