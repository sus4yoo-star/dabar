-- =====================================================================
--  전도 간증 나눔 — 전한 이야기를 공유하고 '아멘'으로 서로 격려
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
-- =====================================================================

-- 1) 간증 글
create table if not exists besora.testimonies (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users(id) on delete cascade,
  display_name text,                    -- null = 익명
  body         text not null,
  tool_slug    text,                    -- 어떤 전도 도구로 전했는지(선택)
  amen_count   int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_testi_created on besora.testimonies(created_at desc);

alter table besora.testimonies enable row level security;
-- 읽기: 로그인 사용자 모두(공유 피드)
drop policy if exists testi_sel on besora.testimonies;
create policy testi_sel on besora.testimonies for select to authenticated using (true);
-- 쓰기: 본인만
drop policy if exists testi_ins on besora.testimonies;
create policy testi_ins on besora.testimonies for insert to authenticated with check (owner = auth.uid());
-- 삭제: 본인만 (관리자 삭제는 서비스 롤/대시보드에서)
drop policy if exists testi_del on besora.testimonies;
create policy testi_del on besora.testimonies for delete to authenticated using (owner = auth.uid());
grant select, insert, delete on besora.testimonies to authenticated;

-- 2) 아멘(공감) — 1인 1회, 중복 방지
create table if not exists besora.testimony_amens (
  testimony_id uuid not null references besora.testimonies(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  primary key (testimony_id, user_id)
);
alter table besora.testimony_amens enable row level security;
-- 내가 누른 것만 조회(내 아멘 상태 표시용)
drop policy if exists amen_sel on besora.testimony_amens;
create policy amen_sel on besora.testimony_amens for select to authenticated using (user_id = auth.uid());
grant select on besora.testimony_amens to authenticated;
-- 직접 insert/delete 는 막고, 토글은 아래 RPC(보안 정의자)로만
revoke insert, update, delete on besora.testimony_amens from authenticated;

-- 3) 아멘 토글 — 있으면 취소, 없으면 추가. amen_count 를 함께 갱신하고 새 값 반환.
create or replace function besora.toggle_amen(p_testimony uuid)
returns table (new_count int, amened boolean)
language plpgsql security definer set search_path = besora
as $$
declare _has boolean; _c int;
begin
  select exists(select 1 from besora.testimony_amens where testimony_id = p_testimony and user_id = auth.uid()) into _has;
  if _has then
    delete from besora.testimony_amens where testimony_id = p_testimony and user_id = auth.uid();
    update besora.testimonies set amen_count = greatest(0, amen_count - 1) where id = p_testimony returning amen_count into _c;
    return query select coalesce(_c, 0), false;
  else
    insert into besora.testimony_amens(testimony_id, user_id) values (p_testimony, auth.uid()) on conflict do nothing;
    update besora.testimonies set amen_count = amen_count + 1 where id = p_testimony returning amen_count into _c;
    return query select coalesce(_c, 0), true;
  end if;
end;
$$;
grant execute on function besora.toggle_amen(uuid) to authenticated;
