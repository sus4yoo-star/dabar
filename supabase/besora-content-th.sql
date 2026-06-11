-- =====================================================================
--  베소라 전도 콘텐츠 — 태국어(th) 추가
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN 하세요.
--  (upsert 방식이라 여러 번 실행해도 안전)
--  ※ 로마서 구절은 태국어 표준역(TSV) 문체 기준. 영접 기도는 현장 사용 전
--    태국어 사용자 검수를 권장합니다.
-- =====================================================================

-- 0) 언어 등록 (FK 필요) + 스페인어 비활성화
insert into besora.languages (code, name_native, name_en, rtl, enabled, sort)
values ('th', 'ไทย', 'Thai', false, true, 3)
on conflict (code) do update set enabled=true, name_native=excluded.name_native, name_en=excluded.name_en, sort=excluded.sort;

update besora.languages set enabled=false where code='es';

do $$
declare s uuid;
begin
  -- ============ 글없는책 (wordless) — TH ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ข่าวประเสริฐในห้าสี','ข่าวดีที่สุด เล่าด้วยห้าสี มาดูด้วยกันไหม?')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สีทอง — ความรักของพระเจ้า','พระเจ้าทรงรักคุณ และทรงเตรียมบ้านนิรันดร์ในสวรรค์ไว้แล้ว')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สีดำ — ความบาป','แต่ความบาปได้แยกเราออกจากพระเจ้า')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สีแดง — พระโลหิตของพระเยซู','พระเยซูทรงจ่ายราคาด้วยการหลั่งพระโลหิตบนกางเขน')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สีขาว — สะอาด','เมื่อคุณเชื่อในพระองค์ ใจของคุณจะขาวสะอาดดังหิมะ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=6;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สีเขียว — เติบโต','บัดนี้ชีวิตใหม่ที่เติบโตขึ้นทุกวันได้เริ่มต้นแล้ว')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 사영리 (four-laws) — TH ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ความจริงฝ่ายวิญญาณสี่ประการ','ขอแบ่งปันความจริงสี่ประการที่เปิดความสัมพันธ์กับพระเจ้า')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','หนึ่ง: ความรักและแผนการ','พระเจ้าทรงรักคุณ และทรงมีแผนการที่ยอดเยี่ยมสำหรับชีวิตของคุณ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สอง: บาปและการแยกจาก','ความบาปของเราขวางกั้นความรักนั้น')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สาม: พระเยซูคริสต์','พระเยซูทรงเป็นทางเดียวที่เชื่อมการแยกจากนั้น')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สี่: ต้อนรับพระองค์','บัดนี้คุณสามารถเปิดประตูใจและต้อนรับพระองค์เข้ามา')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 다리 예화 (bridge) — TH ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','สองฟากฝั่ง','ฟากหนึ่งคือมนุษย์ อีกฟากคือพระเจ้าผู้บริสุทธิ์')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','เหวที่บาปสร้างขึ้น','ความบาปเปิดเหวลึกระหว่างทั้งสองฟาก')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','กางเขนคือสะพาน','กางเขนของพระเยซูกลายเป็นสะพานข้ามเหวนั้น')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ข้ามด้วยความเชื่อ','โดยความเชื่อ คุณข้ามสะพานนั้นมาหาพระเจ้าได้')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 세 개의 원 (three-circles) — TH ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','มาวาดด้วยกัน','ขอวาดเรื่องราวนี้ด้วยวงกลมสามวง')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','แผนการของพระเจ้า','พระเจ้าทรงออกแบบชีวิตที่ดีและงดงาม')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ความแตกสลาย','เราออกจากทางนั้น และชีวิตก็แตกสลาย')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ข่าวประเสริฐและการฟื้นฟู','พระเยซูเสด็จมาเพื่อฟื้นฟูสิ่งที่แตกสลาย')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','กลับใจและเชื่อ','เราหันกลับ เชื่อ และติดตามพระองค์')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;

  -- ============ 로마서로의 길 (romans) — TH (TSV 문체) ============
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ทุกคนทำบาป','เพราะว่าทุกคนทำบาป และเสื่อมจากพระสิริของพระเจ้า')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ค่าจ้างและของประทาน','เพราะว่าค่าจ้างของความบาปคือความตาย แต่ของประทานจากพระเจ้าคือชีวิตนิรันดร์ในพระเยซูคริสต์องค์พระผู้เป็นเจ้าของเรา')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ความรักนั้น','แต่พระเจ้าทรงสำแดงความรักของพระองค์แก่เรา คือขณะที่เรายังเป็นคนบาปอยู่นั้น พระคริสต์ได้สิ้นพระชนม์เพื่อเรา')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ยอมรับและเชื่อ','ถ้าท่านยอมรับด้วยปากว่าพระเยซูทรงเป็นองค์พระผู้เป็นเจ้า และเชื่อในใจว่าพระเจ้าทรงให้พระองค์เป็นขึ้นจากความตาย ท่านก็จะรอด')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body) values
    (s,'th','ทุกคนที่ร้องเรียก','เพราะว่าทุกคนที่ร้องออกพระนามขององค์พระผู้เป็นเจ้าจะรอด')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body;
end $$;

-- ============ 결단/영접 (decision) — TH ============
insert into besora.decision_translations
  (language_code, ask_title, ask_body, prayer_text, welcome_title, welcome_body) values
  ('th','คุณอยากต้อนรับพระเยซูไหม?','ไม่มีการบังคับ ถ้าใจของคุณเปิดอยู่ มาอธิษฐานด้วยกัน',
   'พระเยซูเจ้า ข้าพระองค์เป็นคนบาป ข้าพระองค์เชื่อว่าพระองค์สิ้นพระชนม์เพื่อข้าพระองค์และทรงเป็นขึ้นมา ขอเสด็จเข้ามาในใจของข้าพระองค์ และทรงเป็นองค์พระผู้เป็นเจ้าของข้าพระองค์ ขอบพระคุณ อาเมน',
   'ยินดีต้อนรับ!','วันนี้ชีวิตใหม่ได้เริ่มต้นแล้ว เราจะเดินไปด้วยกันทีละก้าว')
on conflict (language_code) do update set
  ask_title=excluded.ask_title, ask_body=excluded.ask_body, prayer_text=excluded.prayer_text,
  welcome_title=excluded.welcome_title, welcome_body=excluded.welcome_body;

-- 끝.
