-- 성경퀴즈 완주 진도(로그인 동기화) — 기기가 바뀌어도 이어풀기/진도율 유지
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN 하세요.
create table if not exists quiz_progress (
  user_id     uuid    not null references auth.users(id) on delete cascade,
  question_id uuid    not null,
  correct     boolean not null default false,
  updated_at  timestamptz default now(),
  primary key (user_id, question_id)
);
alter table quiz_progress enable row level security;

drop policy if exists "본인 진도 읽기" on quiz_progress;
create policy "본인 진도 읽기" on quiz_progress for select using (auth.uid() = user_id);
drop policy if exists "본인 진도 추가" on quiz_progress;
create policy "본인 진도 추가" on quiz_progress for insert with check (auth.uid() = user_id);
drop policy if exists "본인 진도 수정" on quiz_progress;
create policy "본인 진도 수정" on quiz_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on quiz_progress to authenticated;
create index if not exists idx_quiz_progress_user on quiz_progress(user_id);
