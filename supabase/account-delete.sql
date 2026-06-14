-- =====================================================================
--  계정 삭제 (앱 내 자가 삭제 — 애플 앱스토어 가이드 5.1.1(v) 필수)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN.
--  현재 로그인한 사용자가 자기 계정을 영구 삭제한다.
--  auth.users 삭제 시 on delete cascade 로 연결된 데이터가 함께 삭제됨
--  (profiles, besora.companions/messages/groups/group_members/group_photos 등).
-- =====================================================================

create or replace function public.delete_me()
returns void
language plpgsql
security definer
set search_path = public, auth, besora
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'login required'; end if;
  -- 혹시 cascade 가 안 걸린 앱 데이터 대비(있으면 정리)
  delete from public.profiles where id = uid;
  -- 인증 사용자 삭제 → 나머지 FK(on delete cascade) 자동 정리
  delete from auth.users where id = uid;
end $$;

grant execute on function public.delete_me() to authenticated;
