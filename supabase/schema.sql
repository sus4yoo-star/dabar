-- DABAR 스키마 — 여러 번 실행해도 안전(idempotent)하게 작성.
-- (정책은 drop policy if exists 후 재생성하므로 "already exists" 오류가 나지 않음)

-- =========================================================================
-- 문제(questions)
-- =========================================================================
create table if not exists questions (
  id          uuid    default gen_random_uuid() primary key,
  book        text    not null,
  testament   text    not null check (testament in ('old', 'new')),
  category    text    not null check (category in ('인물', '사건', '말씀', '지명')),
  level       text    not null check (level in ('easy', 'medium', 'hard')),
  question    text    not null,
  options     jsonb   not null,
  answer      int     not null check (answer between 0 and 3),
  hint        text    default '',
  explanation text    default '',
  lang        text    not null default 'ko' check (lang in ('ko', 'en', 'th')),
  created_at  timestamptz default now()
);

-- 기존 DB 업그레이드용(이미 questions 테이블이 있는 경우): 아래 한 줄을 실행하세요.
alter table questions add column if not exists lang text not null default 'ko';

create index if not exists idx_questions_testament on questions(testament);
create index if not exists idx_questions_level     on questions(level);
create index if not exists idx_questions_book      on questions(book);
create index if not exists idx_questions_lang      on questions(lang);

alter table questions enable row level security;
drop policy if exists "누구나 읽기 가능" on questions;
create policy "누구나 읽기 가능" on questions for select using (true);


-- =========================================================================
-- 로그인 / 점수 / 랭킹
-- =========================================================================

-- 사용자 프로필 (로그인 시 앱이 자동으로 만들고/갱신함)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null default '익명',
  avatar_url  text,
  provider    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;
drop policy if exists "프로필 누구나 읽기" on profiles;
create policy "프로필 누구나 읽기" on profiles for select using (true);
drop policy if exists "본인 프로필 생성" on profiles;
create policy "본인 프로필 생성" on profiles for insert with check (auth.uid() = id);
drop policy if exists "본인 프로필 수정" on profiles;
create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);


-- 퀴즈 한 판의 점수 기록
create table if not exists scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  score       int  not null check (score >= 0),
  total       int  not null check (total > 0),
  percentage  int  not null check (percentage between 0 and 100),
  testament   text,
  level       text,
  book_count  int,
  created_at  timestamptz default now()
);

alter table scores enable row level security;
drop policy if exists "점수 누구나 읽기" on scores;
create policy "점수 누구나 읽기" on scores for select using (true);
drop policy if exists "본인 점수 저장" on scores;
create policy "본인 점수 저장" on scores for insert with check (auth.uid() = user_id);

-- 콤보 보너스 포인트 (정답 수와 별개로 누적되는 점수)
alter table scores add column if not exists points int not null default 0;

create index if not exists idx_scores_user    on scores(user_id);
create index if not exists idx_scores_created on scores(created_at desc);


-- 개인 오답 히스토리
create table if not exists wrong_answers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   uuid,
  book          text,
  category      text,
  question      text not null,
  correct_answer text not null,
  created_at    timestamptz default now()
);
alter table wrong_answers enable row level security;
drop policy if exists "본인 오답 읽기" on wrong_answers;
create policy "본인 오답 읽기" on wrong_answers for select using (auth.uid() = user_id);
drop policy if exists "본인 오답 저장" on wrong_answers;
create policy "본인 오답 저장" on wrong_answers for insert with check (auth.uid() = user_id);
create index if not exists idx_wrong_user on wrong_answers(user_id, created_at desc);


-- 문제 신고 (사용자가 이상한 문제를 신고)
create table if not exists question_reports (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid,
  user_id     uuid references auth.users(id) on delete set null,
  question    text,
  reason      text,
  created_at  timestamptz default now()
);
alter table question_reports enable row level security;
drop policy if exists "본인 신고 저장" on question_reports;
create policy "본인 신고 저장" on question_reports for insert with check (auth.uid() = user_id);


-- 뷰는 컬럼 순서 변경 충돌을 피하려고 먼저 삭제 후 재생성
drop view if exists leaderboard;
drop view if exists leaderboard_weekly;

-- 전체 랭킹 뷰 (누적 포인트 기준)
create view leaderboard with (security_invoker = true) as
select
  p.id                                   as user_id,
  p.nickname,
  p.avatar_url,
  count(s.id)                            as plays,
  coalesce(sum(s.score), 0)              as total_score,
  coalesce(sum(s.points), 0)             as total_points,
  coalesce(max(s.percentage), 0)         as best_percentage,
  coalesce(round(avg(s.percentage))::int, 0) as avg_percentage,
  max(s.created_at)                      as last_played
from profiles p
left join scores s on s.user_id = p.id
group by p.id, p.nickname, p.avatar_url;

-- 주간 랭킹 뷰 (최근 7일 점수만)
create view leaderboard_weekly with (security_invoker = true) as
select
  p.id                                   as user_id,
  p.nickname,
  p.avatar_url,
  count(s.id)                            as plays,
  coalesce(sum(s.score), 0)              as total_score,
  coalesce(sum(s.points), 0)             as total_points,
  coalesce(max(s.percentage), 0)         as best_percentage,
  coalesce(round(avg(s.percentage))::int, 0) as avg_percentage,
  max(s.created_at)                      as last_played
from profiles p
join scores s on s.user_id = p.id and s.created_at >= now() - interval '7 days'
group by p.id, p.nickname, p.avatar_url;

-- 권한 부여
grant select on leaderboard to anon, authenticated;
grant select on leaderboard_weekly to anon, authenticated;

-- 테이블 접근 권한(GRANT) — RLS 와 별개로 역할에 부여해야 함
-- (없으면 "permission denied for table ..." 오류가 난다)
grant usage on schema public to anon, authenticated;
grant select on profiles to anon, authenticated;
grant insert, update on profiles to authenticated;
grant select on scores to anon, authenticated;
grant insert on scores to authenticated;
grant select, insert on wrong_answers to authenticated;
grant insert on question_reports to authenticated;


-- =========================================================================
-- 양육 과정 수료 진도 + 관리자(현황판용)
-- =========================================================================
create table if not exists lesson_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  course     text not null,
  lesson     text not null,
  created_at timestamptz default now(),
  primary key (user_id, course, lesson)
);
alter table lesson_progress enable row level security;
drop policy if exists "진도 읽기" on lesson_progress;
create policy "진도 읽기" on lesson_progress for select using (true);
drop policy if exists "본인 진도 저장" on lesson_progress;
create policy "본인 진도 저장" on lesson_progress for insert with check (auth.uid() = user_id);
grant select on lesson_progress to anon, authenticated;
grant insert on lesson_progress to authenticated;

-- 관리자(목사님) 표시: true 인 사람만 현황판 접근
alter table profiles add column if not exists is_admin boolean not null default false;
