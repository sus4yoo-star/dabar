-- =====================================================================
--  모임 삭제 권한 — 리더만 자기 모임 삭제 가능.
--  (besora-groups.sql 에 포함돼 있지만, 삭제가 안 되면 이 부분만 따로 RUN)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. (여러 번 실행해도 안전)
-- =====================================================================

drop policy if exists grp_del on besora.groups;
create policy grp_del on besora.groups for delete
  using (leader = auth.uid());

grant delete on besora.groups to authenticated;

-- 끝.  (멤버·채팅·사진은 외래키 on delete cascade 로 함께 정리됩니다)
