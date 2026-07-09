-- ⛪ 교회 연결 요청 테이블
-- 사용자가 이름·연락처·지역을 남기면, 관리자가 직접 검증된 교회를 찾아 소개한다.
-- (자동 매칭 없음 — 앱은 접수·상태 관리만)
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣고 Run

create table if not exists public.church_connect_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact text not null,
  region text not null,
  lang text,                                   -- 요청 당시 앱 언어(연락 시 참고)
  note text,
  status text not null default 'pending',      -- pending | contacted | connected | closed
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.church_connect_requests enable row level security;

-- 제출: 게스트 포함 누구나 (전도 현장에서 전도자 폰으로 접수하는 경우가 많음)
--       단, user_id 위조는 금지(본인 id 또는 null만)
drop policy if exists "conn_insert_anyone" on public.church_connect_requests;
create policy "conn_insert_anyone" on public.church_connect_requests
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- 조회·수정: 관리자만 (연락처는 민감정보 — 일반 사용자는 못 본다)
drop policy if exists "conn_select_admin" on public.church_connect_requests;
create policy "conn_select_admin" on public.church_connect_requests
  for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

drop policy if exists "conn_update_admin" on public.church_connect_requests;
create policy "conn_update_admin" on public.church_connect_requests
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- RLS 와 함께 GRANT 도 반드시 (누락 시 조용히 실패하는 흔한 원인)
grant insert on public.church_connect_requests to anon, authenticated;
grant select, update on public.church_connect_requests to authenticated;
