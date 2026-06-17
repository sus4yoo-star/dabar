-- =====================================================================
--  besora 전도 콘텐츠 — 기반 스키마 (languages / tools / tool_steps /
--  tool_step_translations / decision_translations / sessions)
-- =====================================================================
--  ⚠️ 재구성본(reconstructed): 이 테이블들의 원본 생성 DDL 이 저장소에 없어,
--     앱 코드(lib/besora/content.ts·types.ts)의 사용 형태에서 구조를 추론해
--     RLS·GRANT 와 함께 "검토 가능·재현 가능" 하도록 작성했습니다.
--     운영 DB 에는 이미 이 테이블들이 존재합니다. 적용 전 반드시 운영 스키마와
--     대조하세요. 모든 문장은 멱등(if not exists / drop policy if exists)이며
--     데이터를 삭제하지 않지만, RLS/GRANT 는 "의도한 상태"로 (재)설정하므로
--     운영 정책과 다르면 변경될 수 있습니다. — verify before RUN.
--
--  보안 의도(이 스택 규칙: RLS enabled AND 일치하는 GRANT):
--   · 콘텐츠 테이블(languages/tools/tool_steps/tool_step_translations/
--     decision_translations): 공개 읽기(anon+authenticated SELECT), 쓰기는
--     서비스롤/관리자(SQL)로만 — INSERT/UPDATE/DELETE 정책 없음.
--   · sessions: 전도 결과 로깅. 비로그인 전도자도 기록할 수 있어 INSERT 는
--     anon+authenticated 허용(evangelist_id 는 null 가능). 되읽기 불필요 →
--     SELECT 정책 없음(서비스롤만 조회).
-- =====================================================================

create schema if not exists besora;
grant usage on schema besora to anon, authenticated;

-- ── 언어 ──────────────────────────────────────────────
create table if not exists besora.languages (
  code        text primary key,
  name_native text not null,
  name_en     text not null,
  rtl         boolean not null default false,
  enabled     boolean not null default true,
  sort        int     not null default 0
);

-- ── 도구(전도 도구) ───────────────────────────────────
create table if not exists besora.tools (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  name_ko   text not null,
  color_key text,
  sort      int  not null default 0,
  enabled   boolean not null default true
);

-- ── 도구 단계 ─────────────────────────────────────────
create table if not exists besora.tool_steps (
  id         uuid primary key default gen_random_uuid(),
  tool_id    uuid not null references besora.tools(id) on delete cascade,
  step_order int  not null,
  kind       text not null,                       -- intro|color|diagram|verse|decision
  color_key  text,
  sketch_key text,
  verse_ref  text,
  unique (tool_id, step_order)
);

-- ── 단계 번역(상대/전도자 언어별 콘텐츠) ──────────────
create table if not exists besora.tool_step_translations (
  step_id       uuid not null references besora.tool_steps(id) on delete cascade,
  language_code text not null,
  title         text,
  body          text,
  audio_url     text,
  verse_ref     text,
  guide         text,
  primary key (step_id, language_code)
);

-- ── 결단(영접) 화면 번역 ──────────────────────────────
create table if not exists besora.decision_translations (
  language_code text primary key,
  ask_title     text not null,
  ask_body      text,
  prayer_text   text not null,
  welcome_title text not null,
  welcome_body  text,
  audio_url     text
);

-- ── 전도 세션 로그 ────────────────────────────────────
create table if not exists besora.sessions (
  id              uuid primary key default gen_random_uuid(),
  evangelist_id   uuid references auth.users(id) on delete set null,
  tool_slug       text,
  seeker_language text,
  decided         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- =====================================================================
--  RLS + GRANT  (enabled 와 grant 를 항상 짝으로)
-- =====================================================================
alter table besora.languages               enable row level security;
alter table besora.tools                    enable row level security;
alter table besora.tool_steps               enable row level security;
alter table besora.tool_step_translations   enable row level security;
alter table besora.decision_translations    enable row level security;
alter table besora.sessions                 enable row level security;

-- 콘텐츠: 공개 읽기만
do $$
declare t text;
begin
  foreach t in array array['languages','tools','tool_steps','tool_step_translations','decision_translations']
  loop
    execute format('drop policy if exists "%s_public_read" on besora.%I', t, t);
    execute format('create policy "%s_public_read" on besora.%I for select using (true)', t, t);
    execute format('grant select on besora.%I to anon, authenticated', t);
  end loop;
end $$;

-- sessions: 누구나 기록(INSERT), 되읽기 없음
drop policy if exists "sessions_insert" on besora.sessions;
create policy "sessions_insert" on besora.sessions for insert with check (true);
grant insert on besora.sessions to anon, authenticated;
