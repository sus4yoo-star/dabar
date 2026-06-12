-- 성경퀴즈 questions 테이블에 라오스어(lo) 허용
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN 하세요. (번역 스크립트 실행 전 1회)
alter table questions drop constraint if exists questions_lang_check;
alter table questions add constraint questions_lang_check check (lang in ('ko', 'en', 'th', 'lo'));
