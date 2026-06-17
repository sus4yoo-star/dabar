-- =====================================================================
--  개인 양육 진도 비공개화 + 관리자 현황판 보안 RPC
-- =====================================================================
-- 기존: lesson_progress 가 select using(true) 라 누구나(로그인 사용자) 모든
-- 사람의 과목별 양육 진도를 직접 조회할 수 있었다. 개인 신앙 진도이므로
-- 본인 것만 보이도록 좁히고, 관리자(목사님) 현황판은 is_admin 을 확인하는
-- SECURITY DEFINER 함수로만 집계 데이터를 받도록 바꾼다.
--
-- 주의: 리더보드는 scores(점수)·profiles(닉네임) 공개 읽기에 의존하므로
-- 그 둘은 그대로 둔다. 여기서는 lesson_progress(진도)만 비공개로 전환한다.
-- 적용 후에는 app/admin 페이지가 admin_dashboard() RPC 를 사용한다.

-- 0) 진도 테이블 보장 (이 DB 에 아직 없으면 생성 — schema.sql 과 동일 정의)
create table if not exists lesson_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  course     text not null,
  lesson     text not null,
  created_at timestamptz default now(),
  primary key (user_id, course, lesson)
);
alter table lesson_progress enable row level security;
drop policy if exists "본인 진도 저장" on lesson_progress;
create policy "본인 진도 저장" on lesson_progress for insert with check (auth.uid() = user_id);
grant insert on lesson_progress to authenticated;

-- 1) 진도: 공개 읽기 → 본인 행만
drop policy if exists "진도 읽기" on lesson_progress;
drop policy if exists "본인 진도 읽기" on lesson_progress;
create policy "본인 진도 읽기" on lesson_progress for select using (auth.uid() = user_id);
grant select on lesson_progress to authenticated;     -- 정책이 본인 행으로 제한
revoke select on lesson_progress from anon;

-- 2) 관리자 현황판 집계 (is_admin 만 호출 가능)
create or replace function public.admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;
  select coalesce(jsonb_agg(r), '[]'::jsonb) into result from (
    select
      p.id,
      p.nickname,
      coalesce((
        select jsonb_object_agg(course, cnt)
        from (select course, count(*)::int as cnt
              from lesson_progress where user_id = p.id group by course) c
      ), '{}'::jsonb) as prog,
      coalesce((select count(*)::int from scores where user_id = p.id), 0)        as plays,
      coalesce((select sum(points)::int from scores where user_id = p.id), 0)     as points
    from profiles p
  ) r;
  return result;
end;
$$;

revoke all on function public.admin_dashboard() from public, anon;
grant execute on function public.admin_dashboard() to authenticated;
