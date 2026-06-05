-- DB에서 직접 무작위로 N개 문제를 뽑는 함수.
-- 기존 방식(count*5 조회 후 앱에서 셔플)보다 DB 조회량이 적고 분포가 균등합니다.
-- Supabase SQL Editor에서 한 번 실행해 등록하세요.
create or replace function get_random_questions(
  p_count     int,
  p_level     text   default null,
  p_testament text   default null,
  p_books     text[] default null
)
returns setof questions
language sql
stable
as $$
  select *
  from questions
  where (p_level     is null or level     = p_level)
    and (p_testament is null or testament = p_testament)
    and (p_books     is null or book = any(p_books))
  order by random()
  limit greatest(1, least(p_count, 30));
$$;
