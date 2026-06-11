-- =====================================================================
--  베소라 "동행(Companion)" — 전도 후 1:1 연결 + 채팅
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN 하세요.
--  (여러 번 실행해도 안전 / besora 스키마 안에 격리)
-- =====================================================================

-- ---------- 1) 초대 (전도자가 만든 링크/QR의 코드) ----------
create table if not exists besora.invites (
  code        text primary key,
  inviter     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);
create index if not exists idx_invites_inviter on besora.invites(inviter);

-- ---------- 2) 동행 연결 (두 사람) ----------
create table if not exists besora.companions (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references auth.users(id) on delete cascade,  -- 초대한 사람
  user_b      uuid not null references auth.users(id) on delete cascade,  -- 수락한 사람
  created_at  timestamptz not null default now(),
  last_at     timestamptz not null default now(),                          -- 최근 메시지 시각(정렬용)
  unique (user_a, user_b)
);
create index if not exists idx_companions_a on besora.companions(user_a);
create index if not exists idx_companions_b on besora.companions(user_b);

-- ---------- 3) 메시지 ----------
create table if not exists besora.messages (
  id            uuid primary key default gen_random_uuid(),
  companion_id  uuid not null references besora.companions(id) on delete cascade,
  sender        uuid not null references auth.users(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_messages_companion on besora.messages(companion_id, created_at);

-- =====================================================================
--  RLS (행 보안) — 연결된 본인들만 읽고 쓰게
-- =====================================================================
alter table besora.invites    enable row level security;
alter table besora.companions enable row level security;
alter table besora.messages   enable row level security;

-- 초대: 본인이 만든 것만 보고 만든다 (수락은 아래 RPC가 처리)
drop policy if exists inv_sel on besora.invites;
create policy inv_sel on besora.invites for select using (inviter = auth.uid());
drop policy if exists inv_ins on besora.invites;
create policy inv_ins on besora.invites for insert with check (inviter = auth.uid());

-- 동행: 내가 속한 연결만 조회 (생성은 RPC)
drop policy if exists comp_sel on besora.companions;
create policy comp_sel on besora.companions for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- 메시지: 내가 속한 연결의 메시지만 읽고, 내 이름으로만 보낸다
drop policy if exists msg_sel on besora.messages;
create policy msg_sel on besora.messages for select using (
  exists (select 1 from besora.companions c
          where c.id = companion_id and (c.user_a = auth.uid() or c.user_b = auth.uid()))
);
drop policy if exists msg_ins on besora.messages;
create policy msg_ins on besora.messages for insert with check (
  sender = auth.uid() and exists (
    select 1 from besora.companions c
    where c.id = companion_id and (c.user_a = auth.uid() or c.user_b = auth.uid()))
);

-- =====================================================================
--  RPC — 초대 만들기 / 초대 수락 (SECURITY DEFINER 로 안전하게)
-- =====================================================================

-- 초대 코드 생성 (재사용 가능 — 한 QR로 여러 명 연결 가능)
create or replace function besora.create_invite()
returns text
language plpgsql security definer set search_path = besora, public
as $$
declare c text;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  c := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  insert into besora.invites (code, inviter) values (c, auth.uid());
  return c;
end $$;

-- 초대 수락 → 동행 연결 생성(또는 기존 연결 반환). companion id 반환.
create or replace function besora.accept_invite(p_code text)
returns uuid
language plpgsql security definer set search_path = besora, public
as $$
declare v_inviter uuid; v_id uuid;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  select inviter into v_inviter from besora.invites where code = p_code;
  if v_inviter is null then raise exception 'invalid invite'; end if;
  if v_inviter = auth.uid() then raise exception 'self invite'; end if;

  -- 이미 연결돼 있으면(양방향 어느 쪽이든) 그걸 반환
  select id into v_id from besora.companions
   where (user_a = v_inviter and user_b = auth.uid())
      or (user_a = auth.uid() and user_b = v_inviter)
   limit 1;
  if v_id is not null then return v_id; end if;

  insert into besora.companions (user_a, user_b) values (v_inviter, auth.uid())
  returning id into v_id;
  return v_id;
end $$;

-- =====================================================================
--  권한 (GRANT) — RLS 와 별개로 역할에 부여
-- =====================================================================
grant usage on schema besora to anon, authenticated;
grant select, insert on besora.invites    to authenticated;
grant select          on besora.companions to authenticated;
grant select, insert on besora.messages   to authenticated;
grant execute on function besora.create_invite()        to authenticated;
grant execute on function besora.accept_invite(text)     to authenticated;

-- =====================================================================
--  실시간 (메시지 즉시 수신)
-- =====================================================================
alter table besora.messages replica identity full;
do $$
begin
  alter publication supabase_realtime add table besora.messages;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;

-- 메시지가 오면 동행의 last_at 갱신 (목록 정렬용)
create or replace function besora.touch_companion()
returns trigger language plpgsql security definer set search_path = besora as $$
begin
  update besora.companions set last_at = new.created_at where id = new.companion_id;
  return new;
end $$;
drop trigger if exists trg_touch_companion on besora.messages;
create trigger trg_touch_companion after insert on besora.messages
  for each row execute function besora.touch_companion();

-- 끝.
