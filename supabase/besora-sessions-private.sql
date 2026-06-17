-- =====================================================================
--  besora.sessions — 전도 기록을 본인 것만 조회하도록 비공개화
-- =====================================================================
-- "나의 전도 기록" 화면이 본인 evangelist_id 로 집계하도록 바뀌었다.
-- 그런데 sessions 의 기존 SELECT 정책이 넓으면(전체 조회) 남의 기록까지
-- 읽혀, 본인 기준 집계만 의도한 것과 어긋나고 사생활 노출이 된다.
-- 기존 SELECT 정책을 모두 제거하고 "본인 행만" 으로 좁힌다.
-- (INSERT 정책은 그대로 — 게스트 포함 로깅 유지)

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'besora' and tablename = 'sessions' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on besora.sessions', p.policyname);
  end loop;
end $$;

create policy "sessions_select_own" on besora.sessions
  for select using (auth.uid() = evangelist_id);

grant select on besora.sessions to authenticated;  -- 정책이 본인 행으로 제한
revoke select on besora.sessions from anon;
