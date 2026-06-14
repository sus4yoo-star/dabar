-- =====================================================================
--  소그룹 모임 사진 — Supabase Storage 버킷 + 메타 테이블 + 정책
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN.
--  (besora-groups.sql 을 먼저 적용한 상태여야 함 — besora.is_member 필요)
-- =====================================================================

-- 1) 공개 버킷 (URL로 표시)
insert into storage.buckets (id, name, public)
values ('group-photos', 'group-photos', true)
on conflict (id) do update set public = true;

-- 2) 사진 메타 테이블 (실제 이미지는 Storage, 여기는 경로·업로더만)
create table if not exists besora.group_photos (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references besora.groups(id) on delete cascade,
  uploader    uuid not null references auth.users(id) on delete cascade,
  path        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_gphoto_group on besora.group_photos(group_id, created_at desc);

alter table besora.group_photos enable row level security;
drop policy if exists gph_sel on besora.group_photos;
create policy gph_sel on besora.group_photos for select using (besora.is_member(group_id));
drop policy if exists gph_ins on besora.group_photos;
create policy gph_ins on besora.group_photos for insert with check (uploader = auth.uid() and besora.is_member(group_id));
drop policy if exists gph_del on besora.group_photos;
create policy gph_del on besora.group_photos for delete using (
  uploader = auth.uid()
  or exists (select 1 from besora.groups g where g.id = group_id and g.leader = auth.uid()));

grant select, insert, delete on besora.group_photos to authenticated;

-- 3) Storage 객체 정책 (storage.objects) — 경로 {group_id}/{파일}
-- 업로드: 그 모임 멤버만
drop policy if exists "grpphoto upload" on storage.objects;
create policy "grpphoto upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'group-photos'
  and besora.is_member(((storage.foldername(name))[1])::uuid)
);
-- 읽기: group-photos 버킷 객체 허용 (공개)
drop policy if exists "grpphoto read" on storage.objects;
create policy "grpphoto read" on storage.objects for select
using (bucket_id = 'group-photos');
-- 삭제: 올린 사람(owner) 또는 모임 리더
drop policy if exists "grpphoto delete" on storage.objects;
create policy "grpphoto delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'group-photos'
  and (
    owner = auth.uid()
    or exists (select 1 from besora.groups g
               where g.id = ((storage.foldername(name))[1])::uuid and g.leader = auth.uid())
  )
);

-- 끝.
