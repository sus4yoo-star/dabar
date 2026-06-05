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
  created_at  timestamptz default now()
);

create index if not exists idx_questions_testament on questions(testament);
create index if not exists idx_questions_level     on questions(level);
create index if not exists idx_questions_book      on questions(book);

alter table questions enable row level security;
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
-- 랭킹에 닉네임을 보여줘야 하므로 읽기는 모두 허용
create policy "프로필 누구나 읽기" on profiles for select using (true);
-- 단, 본인 것만 만들고 수정할 수 있음
create policy "본인 프로필 생성" on profiles for insert with check (auth.uid() = id);
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
-- 랭킹 집계를 위해 읽기는 모두 허용
create policy "점수 누구나 읽기" on scores for select using (true);
-- 저장은 본인(로그인한 사용자)만, 그리고 본인 user_id 로만
create policy "본인 점수 저장" on scores for insert with check (auth.uid() = user_id);

create index if not exists idx_scores_user    on scores(user_id);
create index if not exists idx_scores_created on scores(created_at desc);


-- 랭킹 뷰: 사용자별로 집계 (누적 정답 수 기준 랭킹)
create or replace view leaderboard as
select
  p.id                                   as user_id,
  p.nickname,
  p.avatar_url,
  count(s.id)                            as plays,
  coalesce(sum(s.score), 0)              as total_score,
  coalesce(max(s.percentage), 0)         as best_percentage,
  coalesce(round(avg(s.percentage))::int, 0) as avg_percentage,
  max(s.created_at)                      as last_played
from profiles p
left join scores s on s.user_id = p.id
group by p.id, p.nickname, p.avatar_url;

-- PostgREST(API) 로 뷰를 읽을 수 있도록 권한 부여
grant select on leaderboard to anon, authenticated;
