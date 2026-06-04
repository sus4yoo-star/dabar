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
