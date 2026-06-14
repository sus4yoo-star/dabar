-- =====================================================================
--  나눔 모임 (오프라인 모임) — 리더가 개설, 공개 목록에서 참여, 그룹 나눔 채팅
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN 하세요.
--  (여러 번 실행해도 안전 / 동행 채팅과 같은 besora 스키마)
-- =====================================================================

-- ---------- 0) 리더 권한 (관리자가 지정) ----------
alter table public.profiles add column if not exists is_leader boolean not null default false;

-- ---------- 1) 모임 ----------
create table if not exists besora.groups (
  id           uuid primary key default gen_random_uuid(),
  leader       uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  place        text,            -- 오프라인 장소 (예: ○○카페 / △△교회)
  schedule     text,            -- 일정 (예: 매주 화 19:00)
  description  text,
  is_public    boolean not null default true,
  member_count int  not null default 0,
  created_at   timestamptz not null default now(),
  last_at      timestamptz not null default now()   -- 최근 활동(메시지) 시각
);
create index if not exists idx_groups_public on besora.groups(is_public, last_at desc);

-- ---------- 2) 멤버 ----------
create table if not exists besora.group_members (
  group_id   uuid not null references besora.groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member',          -- 'leader' | 'member'
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists idx_gm_user on besora.group_members(user_id);

-- ---------- 3) 그룹 나눔 메시지 ----------
create table if not exists besora.group_messages (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references besora.groups(id) on delete cascade,
  sender      uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_gmsg_group on besora.group_messages(group_id, created_at);

-- ---------- 멤버 여부 헬퍼 (RLS 재귀 방지용, SECURITY DEFINER) ----------
create or replace function besora.is_member(p_group uuid)
returns boolean language sql security definer set search_path = besora as $$
  select exists (select 1 from besora.group_members m
                 where m.group_id = p_group and m.user_id = auth.uid());
$$;

-- =====================================================================
--  RLS
-- =====================================================================
alter table besora.groups         enable row level security;
alter table besora.group_members  enable row level security;
alter table besora.group_messages enable row level security;

-- 모임: 공개 모임은 누구나, 비공개는 멤버만 조회. 생성은 RPC(create_group).
drop policy if exists grp_sel on besora.groups;
create policy grp_sel on besora.groups for select
  using (is_public or besora.is_member(id));

-- 멤버: 같은 모임의 멤버끼리 명단 조회. 본인 참여(insert)/탈퇴(delete)는 직접.
drop policy if exists gm_sel on besora.group_members;
create policy gm_sel on besora.group_members for select using (besora.is_member(group_id));
drop policy if exists gm_ins on besora.group_members;
create policy gm_ins on besora.group_members for insert with check (
  user_id = auth.uid()
  and exists (select 1 from besora.groups g where g.id = group_id and g.is_public)
);
drop policy if exists gm_del on besora.group_members;
create policy gm_del on besora.group_members for delete using (
  user_id = auth.uid() and role <> 'leader'   -- 리더는 탈퇴 불가(모임 유지)
);

-- 메시지: 멤버만 읽고, 본인 이름으로만 보냄.
drop policy if exists gmsg_sel on besora.group_messages;
create policy gmsg_sel on besora.group_messages for select using (besora.is_member(group_id));
drop policy if exists gmsg_ins on besora.group_messages;
create policy gmsg_ins on besora.group_messages for insert with check (
  sender = auth.uid() and besora.is_member(group_id)
);

-- =====================================================================
--  RPC — 모임 개설 (리더/관리자만)
-- =====================================================================
create or replace function besora.create_group(p_name text, p_place text, p_schedule text, p_desc text)
returns uuid
language plpgsql security definer set search_path = besora, public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if not exists (select 1 from public.profiles p
                 where p.id = auth.uid() and (p.is_leader or p.is_admin)) then
    raise exception 'leader only';
  end if;
  if coalesce(btrim(p_name), '') = '' then raise exception 'name required'; end if;

  insert into besora.groups (leader, name, place, schedule, description)
    values (auth.uid(), p_name, nullif(btrim(p_place),''), nullif(btrim(p_schedule),''), nullif(btrim(p_desc),''))
    returning id into v_id;
  insert into besora.group_members (group_id, user_id, role) values (v_id, auth.uid(), 'leader');
  update besora.groups set member_count = 1 where id = v_id;
  return v_id;
end $$;

-- =====================================================================
--  멤버 수 유지 (트리거)
-- =====================================================================
create or replace function besora.touch_group_count()
returns trigger language plpgsql security definer set search_path = besora as $$
begin
  if tg_op = 'INSERT' then
    update besora.groups set member_count = member_count + 1 where id = new.group_id;
  elsif tg_op = 'DELETE' then
    update besora.groups set member_count = greatest(0, member_count - 1) where id = old.group_id;
  end if;
  return null;
end $$;
drop trigger if exists trg_group_count on besora.group_members;
create trigger trg_group_count after insert or delete on besora.group_members
  for each row execute function besora.touch_group_count();

-- 메시지가 오면 모임 last_at 갱신 (목록 정렬용)
create or replace function besora.touch_group()
returns trigger language plpgsql security definer set search_path = besora as $$
begin
  update besora.groups set last_at = new.created_at where id = new.group_id;
  return new;
end $$;
drop trigger if exists trg_touch_group on besora.group_messages;
create trigger trg_touch_group after insert on besora.group_messages
  for each row execute function besora.touch_group();

-- =====================================================================
--  권한 (GRANT)
-- =====================================================================
grant usage on schema besora to anon, authenticated;
grant select                 on besora.groups         to anon, authenticated;
grant select, insert, delete on besora.group_members  to authenticated;
grant select, insert         on besora.group_messages to authenticated;
grant execute on function besora.create_group(text, text, text, text) to authenticated;
grant execute on function besora.is_member(uuid) to authenticated;

-- =====================================================================
--  실시간 (그룹 메시지 즉시 수신)
-- =====================================================================
alter table besora.group_messages replica identity full;
do $$
begin
  alter publication supabase_realtime add table besora.group_messages;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;

-- 끝. (리더 지정: public.profiles 의 해당 사용자 is_leader = true)
