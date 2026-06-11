-- =====================================================================
--  베소라 전도 콘텐츠 — 풀 보강 (구절 출처 + 본문 확장 + 전도자 가이드)
--  대상 언어: 한국어(ko) · 영어(en) · 태국어(th)
--  Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 RUN 하세요.
--  (upsert 방식이라 여러 번 실행해도 안전 / 추가·갱신만 하며 삭제 없음)
--
--  ※ 영어 성경 본문: WEB(World English Bible, 퍼블릭 도메인) 기준.
--    한국어 본문: 저작권 안전을 위한 평이한 의역(특정 번역본 직접 인용 아님).
--    태국어 본문: TSV 문체 기준 — 현장 사용 전 태국어 사용자 검수 권장.
--  ※ verse_ref(구절 출처)·guide(전도자 코칭) 컬럼을 새로 추가합니다.
-- =====================================================================

-- 0) 새 컬럼 (이미 있으면 건너뜀)
alter table besora.tool_step_translations add column if not exists verse_ref text;
alter table besora.tool_step_translations add column if not exists guide     text;

do $$
declare s uuid;
begin
  -- =============================================================
  --  글없는책 (wordless) — 표지 + 5색
  -- =============================================================
  -- 1) 표지
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','색으로 듣는 복음','가장 좋은 소식을 다섯 가지 색으로 들려드릴게요. 글자가 없어도 마음으로 함께 보면 돼요. 천천히 시작해 볼까요?',null,'상대의 눈을 보며 부드럽게. 색 카드를 한 장씩 넘기며 서두르지 말고 전하세요.'),
    (s,'en','The Gospel in Colors','Let me share the best news of all in five colors. No words are needed — we can simply look together. Shall we begin?',null,'Make warm eye contact. Move through the colors one at a time, unhurried.'),
    (s,'th','ข่าวประเสริฐในห้าสี','ขอเล่าข่าวดีที่สุดด้วยห้าสี ไม่ต้องมีตัวอักษรก็เข้าใจด้วยใจได้ มาเริ่มด้วยกันไหม?',null,'สบตาอย่างอบอุ่น ค่อย ๆ เปิดทีละสี ไม่ต้องรีบ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- 2) 금 — 하나님의 사랑
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','금 — 하나님의 사랑','하나님은 당신을 지으셨고 깊이 사랑하세요. 죄와 죽음이 없는 빛나는 천국, 영원한 집을 당신을 위해 준비해 두셨어요.','요한복음 3:16','금색은 천국과 하나님의 사랑이에요. "하나님이 당신을 사랑하세요"를 꼭 강조하세요.'),
    (s,'en','Gold — God''s Love','God made you and loves you deeply. He has prepared a shining, eternal home in heaven for you, where there is no sin or death.','John 3:16','Gold is heaven and God''s love. Be sure to stress, "God loves you."'),
    (s,'th','สีทอง — ความรักของพระเจ้า','พระเจ้าทรงสร้างคุณและทรงรักคุณอย่างลึกซึ้ง พระองค์ทรงเตรียมบ้านนิรันดร์อันรุ่งโรจน์ในสวรรค์ไว้สำหรับคุณ ที่ซึ่งไม่มีบาปและความตาย','ยอห์น 3:16','สีทองคือสวรรค์และความรักของพระเจ้า ย้ำว่า "พระเจ้าทรงรักคุณ"')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- 3) 검정 — 죄
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','검정 — 죄','그런데 우리 모두 잘못을 저질렀어요. 이 죄가 어둠처럼 우리와 하나님 사이를 갈라놓았어요. 우리 힘으로는 이 어둠을 없앨 수 없어요.','로마서 3:23','검정은 죄예요. 정죄하지 말고 "나도 똑같았어요"라는 마음으로 부드럽게.'),
    (s,'en','Black — Sin','But every one of us has done wrong. This sin separates us from God like darkness, and we cannot remove it on our own.','Romans 3:23','Black is sin. Do not condemn — speak gently, as one who needed grace too.'),
    (s,'th','สีดำ — ความบาป','แต่เราทุกคนล้วนทำผิด ความบาปนี้แยกเราออกจากพระเจ้าเหมือนความมืด และเราเองไม่อาจลบมันออกได้','โรม 3:23','สีดำคือความบาป อย่าตัดสิน พูดอย่างอ่อนโยนเหมือนคนที่ก็ต้องการพระคุณเช่นกัน')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- 4) 빨강 — 예수님의 피
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','빨강 — 예수님의 피','하나님은 외아들 예수님을 보내셨어요. 예수님이 십자가에서 피를 흘려 당신의 죄값을 대신 치르셨고, 사흘 만에 죽음을 이기고 다시 살아나셨어요.','로마서 5:8','빨강은 예수님의 피예요. 십자가와 부활을 함께 전하세요.'),
    (s,'en','Red — The Blood of Jesus','God sent his only Son, Jesus. On the cross Jesus shed his blood to pay for your sin, and three days later he rose again, defeating death.','Romans 5:8','Red is the blood of Jesus. Tell of both the cross and the resurrection.'),
    (s,'th','สีแดง — พระโลหิตของพระเยซู','พระเจ้าทรงส่งพระบุตรองค์เดียวคือพระเยซู พระเยซูทรงหลั่งพระโลหิตบนกางเขนเพื่อชดใช้ค่าบาปของคุณ และในวันที่สามทรงเป็นขึ้นมาชนะความตาย','โรม 5:8','สีแดงคือพระโลหิตของพระเยซู เล่าทั้งกางเขนและการคืนพระชนม์')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- 5) 하양 — 깨끗함
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','하양 — 깨끗함','예수님을 믿고 마음에 모셔들이면 모든 죄가 용서돼요. 당신의 마음이 눈처럼 희고 깨끗해지고, 하나님의 자녀가 되는 거예요.','이사야 1:18','하양은 깨끗해진 마음. "당신도 이렇게 깨끗해질 수 있어요"라고 권하세요.'),
    (s,'en','White — Made Clean','When you believe in Jesus and welcome him in, every sin is forgiven. Your heart becomes white as snow, and you become a child of God.','Isaiah 1:18','White is the cleansed heart. Invite them: "You can be made this clean too."'),
    (s,'th','สีขาว — สะอาด','เมื่อคุณเชื่อในพระเยซูและต้อนรับพระองค์ บาปทั้งสิ้นได้รับการอภัย ใจของคุณจะขาวสะอาดดังหิมะ และคุณจะเป็นบุตรของพระเจ้า','อิสยาห์ 1:18','สีขาวคือใจที่สะอาด ชวนเขาว่า "คุณก็สะอาดได้เช่นนี้"')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- 6) 초록 — 자라남
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='wordless') and step_order=6;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','초록 — 자라남','이제 새 생명이 시작돼요. 기도와 말씀, 그리고 함께하는 교회 안에서 매일 조금씩 자라가요. 혼자가 아니라 함께 걸어가는 길이에요.','베드로후서 3:18','초록은 성장이에요. 영접 후 양육·교회로 자연스럽게 이어주세요.'),
    (s,'en','Green — Growing','Now a new life begins. Through prayer, the Word, and a church family, you grow a little each day. You do not walk alone — we walk together.','2 Peter 3:18','Green is growth. After they receive Christ, connect them to discipleship and a church.'),
    (s,'th','สีเขียว — เติบโต','บัดนี้ชีวิตใหม่เริ่มต้นแล้ว ผ่านการอธิษฐาน พระวจนะ และครอบครัวคริสตจักร คุณจะเติบโตขึ้นทุกวัน คุณไม่ได้เดินลำพัง เราเดินไปด้วยกัน','2 เปโตร 3:18','สีเขียวคือการเติบโต หลังต้อนรับพระคริสต์ เชื่อมเขาสู่การเป็นสาวกและคริสตจักร')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- =============================================================
  --  사영리 (four-laws) — 인트로 + 4단계
  -- =============================================================
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','네 가지 영적 진리','하나님과의 관계를 여는 네 가지 진리를 나눌게요. 잠깐이면 돼요. 함께 들어보시겠어요?',null,'가볍게 시작하세요. 부담을 주지 말고 초대하듯이.'),
    (s,'en','Four Spiritual Truths','Let me share four truths that open a relationship with God. It only takes a moment. Would you listen with me?',null,'Open lightly. Invite rather than pressure.'),
    (s,'th','ความจริงฝ่ายวิญญาณสี่ประการ','ขอแบ่งปันความจริงสี่ประการที่เปิดความสัมพันธ์กับพระเจ้า ใช้เวลาเพียงครู่เดียว คุณจะฟังด้วยกันไหม?',null,'เริ่มอย่างเบา ๆ เชื้อเชิญ ไม่กดดัน')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','하나 — 사랑과 계획','하나님은 당신을 사랑하시고, 당신을 향한 놀라운 계획을 가지고 계세요. 그분은 당신을 풍성한 삶으로 초대하세요.','요한복음 3:16 · 10:10','첫째 법칙: 하나님의 사랑과 선한 계획.'),
    (s,'en','One — Love and a Plan','God loves you and has a wonderful plan for your life. He invites you into a full and abundant life.','John 3:16; 10:10','First truth: God''s love and good plan.'),
    (s,'th','หนึ่ง — ความรักและแผนการ','พระเจ้าทรงรักคุณ และทรงมีแผนการที่ยอดเยี่ยมสำหรับชีวิตของคุณ พระองค์ทรงเชิญคุณสู่ชีวิตที่บริบูรณ์','ยอห์น 3:16; 10:10','ความจริงข้อแรก: ความรักและแผนการอันดีของพระเจ้า')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','둘 — 죄와 단절','그런데 사람은 죄로 하나님과 멀어졌어요. 우리 힘으로는 그 사랑을 누릴 수 없어요. 이것은 우리 모두의 문제예요.','로마서 3:23 · 6:23','둘째: 죄로 인한 단절. 함께 겸손히.'),
    (s,'en','Two — Sin and Separation','But people are separated from God by sin. On our own we cannot reach his love. This is true of every one of us.','Romans 3:23; 6:23','Second: separation by sin. Stay humble — we share it.'),
    (s,'th','สอง — บาปและการแยกจาก','แต่มนุษย์ถูกแยกจากพระเจ้าด้วยความบาป เราเองไม่อาจเข้าถึงความรักนั้นได้ นี่เป็นความจริงของเราทุกคน','โรม 3:23; 6:23','ข้อสอง: การแยกจากเพราะบาป จงถ่อมใจ เราต่างก็มีบาป')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','셋 — 예수 그리스도','예수님은 우리 죄를 위해 죽으시고 다시 살아나셨어요. 그분만이 하나님께 이르는 유일한 길이세요. 그 길을 하나님이 친히 열어 주셨어요.','로마서 5:8 · 요한복음 14:6','셋째: 유일한 길이신 예수.'),
    (s,'en','Three — Jesus Christ','Jesus died for our sins and rose again. He alone is the way to God, and God himself opened that way for us.','Romans 5:8; John 14:6','Third: Jesus, the only way.'),
    (s,'th','สาม — พระเยซูคริสต์','พระเยซูทรงสิ้นพระชนม์เพื่อบาปของเราและทรงเป็นขึ้นมา พระองค์ทรงเป็นทางเดียวสู่พระเจ้า และพระเจ้าเองทรงเปิดทางนั้นให้เรา','โรม 5:8; ยอห์น 14:6','ข้อสาม: พระเยซูทางเดียว')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='four-laws') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','넷 — 영접','이제 믿음으로 예수님을 마음에 모셔들이면 돼요. 마음의 문을 열고 그분을 삶의 주인으로 초대하세요. 결정은 당신의 몫이에요.','요한복음 1:12 · 요한계시록 3:20','넷째: 영접. 보좌 그림으로 "누가 내 삶의 주인인가" 물어보세요.'),
    (s,'en','Four — Receive Him','Now, by faith, you can welcome Jesus into your heart. Open the door and invite him to be Lord of your life. The choice is yours.','John 1:12; Revelation 3:20','Fourth: receiving him. With the throne picture, ask, "Who is on the throne of your life?"'),
    (s,'th','สี่ — ต้อนรับพระองค์','บัดนี้ด้วยความเชื่อ คุณสามารถต้อนรับพระเยซูเข้ามาในใจ เปิดประตูใจและเชิญพระองค์เป็นองค์พระผู้เป็นเจ้าของชีวิต การตัดสินใจเป็นของคุณ','ยอห์น 1:12; วิวรณ์ 3:20','ข้อสี่: การต้อนรับ ใช้ภาพพระที่นั่งถามว่า "ใครครองชีวิตคุณ?"')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- =============================================================
  --  다리 예화 (bridge) — 4단계
  -- =============================================================
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','두 편에 선 우리','한쪽엔 우리 사람이, 다른 한쪽엔 거룩하신 하나님이 계세요. 하나님은 본래 우리와 함께하기를 원하세요.','로마서 6:23','종이에 절벽 둘을 그리며 시작하면 좋아요.'),
    (s,'en','On Two Sides','On one side stands humanity; on the other, the holy God. From the beginning, God has wanted to be with us.','Romans 6:23','It helps to draw two cliffs on paper as you begin.'),
    (s,'th','สองฟากฝั่ง','ฟากหนึ่งคือมนุษย์ อีกฟากคือพระเจ้าผู้บริสุทธิ์ ตั้งแต่แรกพระเจ้าทรงปรารถนาจะอยู่กับเรา','โรม 6:23','วาดหน้าผาสองฝั่งบนกระดาษขณะเริ่มจะช่วยได้')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','죄가 만든 간격','그러나 죄가 둘 사이에 깊은 골을 만들었어요. 착한 행실이나 노력으로는 이 골을 건널 수 없어요. 누구도 스스로는 건너지 못해요.','이사야 59:2','깊은 틈을 그리며, 인간의 노력으로는 안 됨을 보여주세요.'),
    (s,'en','The Gap Sin Made','But sin opened a deep canyon between the two. No good deeds or efforts can cross it. No one can make it across on their own.','Isaiah 59:2','Draw a deep gap; show that human effort cannot bridge it.'),
    (s,'th','เหวที่บาปสร้างขึ้น','แต่ความบาปเปิดเหวลึกระหว่างทั้งสองฝั่ง ความดีหรือความพยายามใด ๆ ก็ข้ามไม่ได้ ไม่มีใครข้ามไปเองได้','อิสยาห์ 59:2','วาดเหวลึก แสดงว่าความพยายามของมนุษย์ข้ามไม่ได้')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','십자가라는 다리','예수님이 십자가에서 죽고 다시 살아나심으로, 그 골을 잇는 다리가 되셨어요. 하나님이 먼저 우리에게 길을 내신 거예요.','베드로전서 3:18','십자가를 다리 모양으로 그려 양쪽을 연결하세요.'),
    (s,'en','The Cross as a Bridge','By dying and rising again, Jesus became the bridge across that canyon. God himself made the way to us first.','1 Peter 3:18','Draw the cross as a bridge connecting both sides.'),
    (s,'th','กางเขนคือสะพาน','โดยการสิ้นพระชนม์และคืนพระชนม์ พระเยซูทรงกลายเป็นสะพานข้ามเหวนั้น พระเจ้าทรงสร้างทางมาหาเราก่อน','1 เปโตร 3:18','วาดกางเขนเป็นสะพานเชื่อมสองฝั่ง')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='bridge') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','믿음으로 건너감','이제 믿음으로 그 다리를 건너 하나님께 갈 수 있어요. 예수님을 신뢰하고 받아들이는 것이 곧 건너가는 거예요. 지금 건너오시겠어요?','요한복음 5:24','사람이 다리를 건너는 모습으로 결단을 권하세요.'),
    (s,'en','Crossing by Faith','Now, by faith, you can cross that bridge and come to God. Trusting and receiving Jesus is how you cross. Will you cross over today?','John 5:24','Show a person crossing the bridge, and invite a decision.'),
    (s,'th','ข้ามด้วยความเชื่อ','บัดนี้ด้วยความเชื่อ คุณข้ามสะพานนั้นมาหาพระเจ้าได้ การวางใจและต้อนรับพระเยซูคือการข้าม คุณจะข้ามมาวันนี้ไหม?','ยอห์น 5:24','แสดงคนกำลังข้ามสะพาน แล้วเชิญชวนให้ตัดสินใจ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- =============================================================
  --  세 개의 원 (three-circles) — 인트로 + 4단계
  -- =============================================================
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','함께 그려볼까요','세 개의 원으로 우리 삶의 이야기를 그려볼게요. 종이와 펜만 있으면 돼요. 편하게 들어 주세요.',null,'대화하듯 그림을 그려가며 천천히.'),
    (s,'en','Let Us Draw Together','Let me draw the story of our lives with three circles. All we need is paper and a pen. Just relax and listen.',null,'Draw as you talk, like a conversation — unhurried.'),
    (s,'th','มาวาดด้วยกัน','ขอวาดเรื่องราวชีวิตเราด้วยวงกลมสามวง มีกระดาษกับปากกาก็พอ สบาย ๆ แล้วฟังไปด้วยกัน',null,'วาดไปคุยไปเหมือนการสนทนา อย่างไม่รีบ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','하나님의 디자인','하나님은 선하고 아름다운 삶을 디자인하셨어요. 평화와 사랑이 가득한, 그분과 함께하는 삶이었죠.','창세기 1:31','첫 원: 하나님의 선한 디자인.'),
    (s,'en','The Design of God','God designed a good and beautiful life — a life full of peace and love, lived together with him.','Genesis 1:31','First circle: God''s good design.'),
    (s,'th','แผนการของพระเจ้า','พระเจ้าทรงออกแบบชีวิตที่ดีและงดงาม ชีวิตที่เปี่ยมด้วยสันติและความรัก อยู่ร่วมกับพระองค์','ปฐมกาล 1:31','วงแรก: การออกแบบอันดีของพระเจ้า')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','깨어짐','하지만 우리가 그 길을 벗어났어요. 그래서 삶이 깨어지고 아픔과 공허가 들어왔어요. 누구나 마음 깊이 이 깨어짐을 느껴요.','로마서 3:23','상대의 삶의 아픔(깨어짐)에 진심으로 공감하며.'),
    (s,'en','Brokenness','But we turned from that path, and life became broken — pain and emptiness moved in. Deep down, everyone feels this brokenness.','Romans 3:23','Genuinely empathize with the brokenness and pain in their life.'),
    (s,'th','ความแตกสลาย','แต่เราหันออกจากทางนั้น ชีวิตจึงแตกสลาย ความเจ็บปวดและความว่างเปล่าเข้ามา ลึก ๆ ทุกคนรู้สึกถึงความแตกสลายนี้','โรม 3:23','เห็นอกเห็นใจความเจ็บปวดในชีวิตของเขาอย่างจริงใจ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','복음과 회복','예수님이 오셔서, 죽고 다시 살아나심으로 깨어진 것을 회복하세요. 그분이 우리를 본래의 자리로 되돌리시고 새롭게 하세요.','고린도후서 5:17','복음의 원: 예수님의 회복과 새 창조.'),
    (s,'en','The Gospel and Recovery','Jesus came, and by dying and rising he restores what was broken. He brings us back to our place and makes us new.','2 Corinthians 5:17','The gospel circle: Jesus restores and makes new.'),
    (s,'th','ข่าวประเสริฐและการฟื้นฟู','พระเยซูเสด็จมา และโดยการสิ้นพระชนม์และคืนพระชนม์ ทรงฟื้นฟูสิ่งที่แตกสลาย ทรงนำเรากลับสู่ที่ของเราและทรงทำให้ใหม่','2 โครินธ์ 5:17','วงข่าวประเสริฐ: พระเยซูทรงฟื้นฟูและสร้างใหม่')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='three-circles') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','회개와 믿음','우리는 옛 길에서 돌이켜(회개), 예수님을 믿고 따라가요. 화살표처럼 삶의 방향을 바꾸는 거예요. 지금 그 방향으로 돌아오시겠어요?','마가복음 1:15','화살표로 회개=방향 전환을 설명하고 결단을 권하세요.'),
    (s,'en','Repent and Believe','We turn from the old way (repent), believe in Jesus, and follow him. It is like an arrow changing direction. Will you turn that way today?','Mark 1:15','Use the arrow to explain repentance as a change of direction, then invite a decision.'),
    (s,'th','กลับใจและเชื่อ','เราหันจากทางเดิม (กลับใจ) เชื่อในพระเยซูและติดตามพระองค์ เหมือนลูกศรที่เปลี่ยนทิศ คุณจะหันมาทางนั้นวันนี้ไหม?','มาระโก 1:15','ใช้ลูกศรอธิบายการกลับใจว่าเป็นการเปลี่ยนทิศ แล้วเชิญให้ตัดสินใจ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  -- =============================================================
  --  로마서로의 길 (romans) — 5 구절 (본문은 말씀 그대로, 출처·가이드 보강)
  -- =============================================================
  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=1;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','모든 사람이 죄를 지음','모든 사람이 죄를 범하여 하나님의 영광에 이르지 못합니다.','로마서 3:23','첫 디딤돌: 우리 모두가 죄인임을 인정하기.'),
    (s,'en','All have sinned','For all have sinned, and fall short of the glory of God.','Romans 3:23','First stone: admitting that all of us are sinners.'),
    (s,'th','ทุกคนทำบาป','เพราะว่าทุกคนทำบาป และเสื่อมจากพระสิริของพระเจ้า','โรม 3:23','ก้อนหินแรก: ยอมรับว่าเราทุกคนเป็นคนบาป')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=2;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','죄의 삯과 선물','죄의 삯은 사망이지만, 하나님의 선물은 그리스도 예수 우리 주 안에 있는 영생입니다.','로마서 6:23','죄의 결과(사망)와 하나님의 선물(영생)을 대비해 주세요.'),
    (s,'en','Wages and gift','For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.','Romans 6:23','Contrast the wages of sin (death) with God''s gift (eternal life).'),
    (s,'th','ค่าจ้างและของประทาน','เพราะว่าค่าจ้างของความบาปคือความตาย แต่ของประทานจากพระเจ้าคือชีวิตนิรันดร์ในพระเยซูคริสต์องค์พระผู้เป็นเจ้าของเรา','โรม 6:23','เปรียบค่าจ้างของบาป (ความตาย) กับของประทานของพระเจ้า (ชีวิตนิรันดร์)')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=3;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','그 사랑','우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로, 하나님께서 우리를 향한 자기의 사랑을 확증하셨습니다.','로마서 5:8','하나님이 먼저, 조건 없이 사랑하셨음을 강조하세요.'),
    (s,'en','That love','But God commends his own love toward us, in that while we were yet sinners, Christ died for us.','Romans 5:8','Stress that God loved first, with no conditions.'),
    (s,'th','ความรักนั้น','แต่พระเจ้าทรงสำแดงความรักของพระองค์แก่เรา คือขณะที่เรายังเป็นคนบาปอยู่นั้น พระคริสต์ได้สิ้นพระชนม์เพื่อเรา','โรม 5:8','ย้ำว่าพระเจ้าทรงรักก่อนโดยไม่มีเงื่อนไข')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=4;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','믿음과 고백','네가 만일 입으로 예수를 주로 시인하며, 하나님께서 그를 죽은 자 가운데서 살리신 것을 마음으로 믿으면 구원을 받습니다.','로마서 10:9','입의 고백과 마음의 믿음, 둘을 함께 짚어 주세요.'),
    (s,'en','Confess and believe','If you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.','Romans 10:9','Point to both: confession with the mouth and belief in the heart.'),
    (s,'th','ยอมรับและเชื่อ','ถ้าท่านยอมรับด้วยปากว่าพระเยซูทรงเป็นองค์พระผู้เป็นเจ้า และเชื่อในใจว่าพระเจ้าทรงให้พระองค์เป็นขึ้นจากความตาย ท่านก็จะรอด','โรม 10:9','ชี้ทั้งสองอย่าง: การยอมรับด้วยปากและความเชื่อในใจ')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;

  select id into s from besora.tool_steps where tool_id=(select id from besora.tools where slug='romans') and step_order=5;
  insert into besora.tool_step_translations (step_id,language_code,title,body,verse_ref,guide) values
    (s,'ko','누구든지','누구든지 주의 이름을 부르는 자는 구원을 받습니다.','로마서 10:13','마지막 디딤돌: 지금 이 자리에서 누구든 부를 수 있어요. 함께 기도로 이어가세요.'),
    (s,'en','Whoever calls','For whoever will call on the name of the Lord will be saved.','Romans 10:13','Final stone: anyone can call right now. Lead into prayer together.'),
    (s,'th','ทุกคนที่ร้องเรียก','เพราะว่าทุกคนที่ร้องออกพระนามขององค์พระผู้เป็นเจ้าจะรอด','โรม 10:13','ก้อนหินสุดท้าย: ใครก็ร้องเรียกได้เดี๋ยวนี้ นำเข้าสู่การอธิษฐานด้วยกัน')
  on conflict (step_id,language_code) do update set title=excluded.title, body=excluded.body, verse_ref=excluded.verse_ref, guide=excluded.guide;
end $$;

-- 끝.
