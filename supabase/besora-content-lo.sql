-- =====================================================================
--  베소라 전도 콘텐츠 — 라오스어(lo) 추가
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN 하세요.
--  (upsert 방식이라 여러 번 실행해도 안전)
--  ※ 로마서 구절 본문은 라오스어 표준 성경 2015(ພຣະຄຳພີ ພາສາລາວ) 공인 본문.
--    영접 기도는 현장 사용 전 라오스어 모어 신자의 최종 교정을 권장합니다.
-- =====================================================================

-- 0) 언어 등록 (FK 필요)
insert into besora.languages (code, name_native, name_en, rtl, enabled, sort)
values ('lo', 'ລາວ', 'Lao', false, true, 4)
on conflict (code) do update set enabled=true, name_native=excluded.name_native, name_en=excluded.name_en, sort=excluded.sort;

do $$
declare s uuid;
begin
  -- ============ 글없는책 (wordless) — LO ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຂ່າວປະເສີດໃນຫ້າສີ','ຂ່າວດີທີ່ສຸດ ເລົ່າດ້ວຍຫ້າສີ ມາເບິ່ງນຳກັນບໍ?')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີຄຳ — ຄວາມຮັກຂອງພຣະເຈົ້າ','ພຣະເຈົ້າຊົງຮັກທ່ານ ແລະ ຊົງຕຽມບ້ານນິລັນດອນໃນສະຫວັນໄວ້ແລ້ວ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີດຳ — ຄວາມບາບ','ແຕ່ຄວາມບາບໄດ້ແຍກເຮົາອອກຈາກພຣະເຈົ້າ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີແດງ — ພຣະໂລຫິດຂອງພຣະເຢຊູ','ພຣະເຢຊູຊົງຈ່າຍລາຄາດ້ວຍການຫຼັ່ງພຣະໂລຫິດເທິງໄມ້ກາງເຂນ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີຂາວ — ສະອາດ','ເມື່ອທ່ານເຊື່ອໃນພຣະອົງ ໃຈຂອງທ່ານຈະຂາວສະອາດຄືຫິມະ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=6;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີຂຽວ — ເຕີບໂຕ','ບັດນີ້ຊີວິດໃໝ່ທີ່ເຕີບໂຕຂຶ້ນທຸກມື້ໄດ້ເລີ່ມຕົ້ນແລ້ວ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 사영리 (four-laws) — LO ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຄວາມຈິງທາງວິນຍານສີ່ປະການ','ຂໍແບ່ງປັນຄວາມຈິງສີ່ປະການທີ່ເປີດຄວາມສຳພັນກັບພຣະເຈົ້າ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ໜຶ່ງ: ຄວາມຮັກ ແລະ ແຜນການ','ພຣະເຈົ້າຊົງຮັກທ່ານ ແລະ ຊົງມີແຜນການທີ່ດີເລີດສຳລັບຊີວິດຂອງທ່ານ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສອງ: ບາບ ແລະ ການແຍກຈາກ','ຄວາມບາບຂອງເຮົາຂວາງກັ້ນຄວາມຮັກນັ້ນ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສາມ: ພຣະເຢຊູຄຣິດ','ພຣະເຢຊູຊົງເປັນທາງດຽວທີ່ເຊື່ອມການແຍກຈາກນັ້ນ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສີ່: ຕ້ອນຮັບພຣະອົງ','ບັດນີ້ທ່ານສາມາດເປີດປະຕູໃຈ ແລະ ຕ້ອນຮັບພຣະອົງເຂົ້າມາ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 다리 예화 (bridge) — LO ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ສອງຟາກຝັ່ງ','ຟາກໜຶ່ງຄືມະນຸດ ອີກຟາກຄືພຣະເຈົ້າຜູ້ບໍລິສຸດ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ເຫວທີ່ບາບສ້າງຂຶ້ນ','ຄວາມບາບເປີດເຫວເລິກລະຫວ່າງສອງຟາກ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ໄມ້ກາງເຂນຄືຂົວ','ໄມ້ກາງເຂນຂອງພຣະເຢຊູກາຍເປັນຂົວຂ້າມເຫວນັ້ນ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຂ້າມດ້ວຍຄວາມເຊື່ອ','ໂດຍຄວາມເຊື່ອ ທ່ານຂ້າມຂົວນັ້ນມາຫາພຣະເຈົ້າໄດ້')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 세 개의 원 (three-circles) — LO ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ມາແຕ້ມນຳກັນ','ຂໍແຕ້ມເລື່ອງລາວນີ້ດ້ວຍວົງມົນສາມວົງ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ແຜນການຂອງພຣະເຈົ້າ','ພຣະເຈົ້າຊົງອອກແບບຊີວິດທີ່ດີ ແລະ ງົດງາມ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຄວາມແຕກສະຫຼາຍ','ເຮົາອອກຈາກທາງນັ້ນ ແລະ ຊີວິດກໍແຕກສະຫຼາຍ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຂ່າວປະເສີດ ແລະ ການຟື້ນຟູ','ພຣະເຢຊູສະເດັດມາເພື່ອຟື້ນຟູສິ່ງທີ່ແຕກສະຫຼາຍ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ກັບໃຈ ແລະ ເຊື່ອ','ເຮົາຫັນກັບ ເຊື່ອ ແລະ ຕິດຕາມພຣະອົງ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 로마서로의 길 (romans) — LO (LSV 문체) ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ທຸກຄົນເຮັດບາບ','ດ້ວຍວ່າທຸກຄົນໄດ້ເຮັດຜິດບາບ ແລະຂາດຈາກພຣະລັດສະໝີຂອງພຣະເຈົ້າ.')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຄ່າຈ້າງ ແລະ ຂອງປະທານ','ດ້ວຍວ່າຄ່າຈ້າງຂອງຄວາມຜິດບາບຄືຄວາມຕາຍ ແຕ່ຂອງພຣະລາຊະທານອັນໂຜດມາແຕ່ພຣະເຈົ້າ ກໍຄືຊີວິດອັນຕະຫລອດໄປເປັນນິດໃນພຣະຄຣິດ ຄືພຣະເຢຊູເຈົ້າຂອງພວກເຮົາ.')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຄວາມຮັກນັ້ນ','ແຕ່ຝ່າຍພຣະເຈົ້າຊົງສະແດງຄວາມຮັກຂອງພຣະອົງແກ່ເຮົາທັງຫລາຍ ຄືຂະນະທີ່ພວກເຮົາຍັງເປັນຄົນຜິດບາບຢູ່ນັ້ນ ພຣະຄຣິດໄດ້ຊົງຍອມສິ້ນພຣະຊົນແທນເຮົາ.')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ຍອມຮັບ ແລະ ເຊື່ອ','ຄືວ່າຖ້າເຈົ້າຈະຮັບດ້ວຍປາກຂອງເຈົ້າວ່າ ພຣະເຢຊູຊົງເປັນອົງພຣະຜູ້ເປັນເຈົ້າ ແລະເຊື່ອໃນຈິດໃຈວ່າ ພຣະເຈົ້າໄດ້ຊົງບັນດານໃຫ້ພຣະອົງຄືນພຣະຊົນຈາກຕາຍ ເຈົ້າກໍຈະພົ້ນ.')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'lo','ທຸກຄົນທີ່ຮ້ອງເອີ້ນ','ເພາະວ່າ ທຸກຄົນທີ່ຮ້ອງອອກພຣະນາມຂອງອົງພຣະຜູ້ເປັນເຈົ້າ ກໍຈະພົ້ນ.')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
end $$;

-- ============ 결단/영접 (decision) — LO ============
insert into besora.decision_translations
  (language_code, ask_title, ask_body, prayer_text, welcome_title, welcome_body) values
  ('lo','ທ່ານຢາກຕ້ອນຮັບພຣະເຢຊູບໍ?','ບໍ່ມີການບັງຄັບ ຖ້າໃຈຂອງທ່ານເປີດຢູ່ ມາອະທິຖານນຳກັນ',
   'ຂ້າແດ່ພຣະເຢຊູເຈົ້າ ຂ້ານ້ອຍເປັນຄົນບາບ ຂ້ານ້ອຍເຊື່ອວ່າພຣະອົງສິ້ນພຣະຊົນເພື່ອຂ້ານ້ອຍ ແລະ ຊົງເປັນຄືນມາ ຂໍສະເດັດເຂົ້າມາໃນໃຈຂອງຂ້ານ້ອຍ ແລະ ຊົງເປັນອົງພຣະຜູ້ເປັນເຈົ້າຂອງຂ້ານ້ອຍ ຂອບພຣະຄຸນ ອາແມນ',
   'ຍິນດີຕ້ອນຮັບ!','ມື້ນີ້ຊີວິດໃໝ່ໄດ້ເລີ່ມຕົ້ນແລ້ວ ເຮົາຈະຍ່າງໄປນຳກັນເທື່ອລະກ້າວ')
on conflict (language_code) do update set
  ask_title=excluded.ask_title, ask_body=excluded.ask_body, prayer_text=excluded.prayer_text,
  welcome_title=excluded.welcome_title, welcome_body=excluded.welcome_body;

-- 끝.
