"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type Lang =
  | "ko" | "en" | "th" | "lo"
  | "es" | "pt" | "zh" | "hi" | "ar" | "fa" | "my" | "ms"
  | "vi" | "id" | "bn" | "ja" | "ur" | "fr" | "ru" | "sw";
// 라벨은 "원어 (코드)" 형식 — 코드로 식별 가능하게.
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어 (ko)" },
  { code: "en", label: "English (en)" },
  { code: "th", label: "ไทย (th)" },
  { code: "lo", label: "ລາວ (lo)" },
  { code: "es", label: "Español (es)" },
  { code: "pt", label: "Português (pt)" },
  { code: "zh", label: "中文 (zh)" },
  { code: "hi", label: "हिन्दी (hi)" },
  { code: "ar", label: "العربية (ar)" },
  { code: "fa", label: "فارسی (fa)" },
  { code: "my", label: "မြန်မာ (my)" },
  { code: "ms", label: "Bahasa Melayu (ms)" },
  { code: "vi", label: "Tiếng Việt (vi)" },
  { code: "id", label: "Bahasa Indonesia (id)" },
  { code: "bn", label: "বাংলা (bn)" },
  { code: "ja", label: "日本語 (ja)" },
  { code: "ur", label: "اردو (ur)" },
  { code: "fr", label: "Français (fr)" },
  { code: "ru", label: "Русский (ru)" },
  { code: "sw", label: "Kiswahili (sw)" },
];

// DICT 는 ko/en/th/lo 만 직접 번역. 그 외 언어는 영어로 폴백하고, 콘텐츠는 자동번역됨.
type Dict = Record<string, Record<"ko" | "en" | "th" | "lo", string>>;

// UI 문자열 사전 (콘텐츠가 아닌 화면 라벨). 콘텐츠(문제·교재)는 별도 단계.
const DICT: Dict = {
  "common.ranking":   { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ", lo: "🏆 ອັນດັບ" },
  "common.companions": { ko: "🤝 동행", en: "🤝 Companions", th: "🤝 เพื่อนร่วมทาง", lo: "🤝 ເພື່ອນຮ່ວມທາງ" },
  "common.wrongnote": { ko: "📒 오답", en: "📒 Notes", th: "📒 ข้อผิด", lo: "📒 ຂໍ້ຜິດ" },
  "common.login":     { ko: "로그인", en: "Login", th: "เข้าสู่ระบบ", lo: "ເຂົ້າສູ່ລະບົບ" },
  "common.logout":    { ko: "로그아웃", en: "Logout", th: "ออกจากระบบ", lo: "ອອກຈາກລະບົບ" },
  "common.save":      { ko: "저장", en: "Save", th: "บันทึก", lo: "ບັນທຶກ" },
  "common.home":      { ko: "← 홈", en: "← Home", th: "← หน้าแรก", lo: "← ໜ້າຫຼັກ" },
  "common.nickFail":  { ko: "닉네임을 바꾸지 못했어요.", en: "Couldn't change nickname.", th: "เปลี่ยนชื่อเล่นไม่สำเร็จ", lo: "ປ່ຽນຊື່ຫຼິ້ນບໍ່ສຳເລັດ" },
  "common.langSwitched": { ko: "이 언어로 화면·콘텐츠·음성이 표시돼요", en: "Screen, content & audio are now in this language", th: "หน้าจอ เนื้อหา และเสียงจะเป็นภาษานี้", lo: "ໜ້າຈໍ ເນື້ອຫາ ແລະ ສຽງຈະເປັນພາສານີ້" },

  "home.tagline":     { ko: "다바르 · 말씀 — 무엇부터 시작할까요?", en: "DABAR · The Word — where to begin?", th: "ดาบาร์ · พระวจนะ — เริ่มจากตรงไหนดี?", lo: "ດາບາ · ພຣະທຳ — ເລີ່ມຈາກໃສດີ?" },
  "home.greeting":    { ko: "{name}님, 오늘도 말씀과 함께해요 👋", en: "{name}, walk with the Word today 👋", th: "{name} วันนี้มาเดินกับพระวจนะกัน 👋", lo: "{name} ມື້ນີ້ມາຍ່າງກັບພຣະທຳນຳກັນ 👋" },
  "home.streakToday": { ko: "🔥 {n}일 연속 출석!", en: "🔥 {n}-day streak!", th: "🔥 ต่อเนื่อง {n} วัน!", lo: "🔥 ຕໍ່ເນື່ອງ {n} ມື້!" },
  "home.streakGo":    { ko: "🔥 {n}일 연속 — 오늘도 풀면 이어져요!", en: "🔥 {n}-day streak — keep it going today!", th: "🔥 ต่อเนื่อง {n} วัน — ทำต่อวันนี้สิ!", lo: "🔥 ຕໍ່ເນື່ອງ {n} ມື້ — ເຮັດຕໍ່ມື້ນີ້ເລີຍ!" },
  "home.invite":      { ko: "👋 친구 초대하고 함께 공부하기", en: "👋 Invite friends & study together", th: "👋 ชวนเพื่อนมาเรียนด้วยกัน", lo: "👋 ເຊີນໝູ່ມາຮຽນນຳກັນ" },
  "home.guide":       { ko: "📋 학습·세례·입교 절차 안내", en: "📋 Membership steps guide", th: "📋 ขั้นตอนการเป็นสมาชิก", lo: "📋 ຂັ້ນຕອນການເປັນສະມາຊິກ" },
  "home.admin":       { ko: "🔧 목사님 현황판", en: "🔧 Pastor dashboard", th: "🔧 แดชบอร์ดศิษยาภิบาล", lo: "🔧 ກະດານສິດຍາພິບານ" },
  "home.growSection": { ko: "양육 · 교육 과정", en: "Discipleship · Education", th: "การเป็นสาวก · การศึกษา", lo: "ການເປັນສາວົກ · ການສຶກສາ" },
  "home.growSub":     { ko: "새신자부터 소요리문답까지", en: "From new believer to catechism", th: "ตั้งแต่ผู้เชื่อใหม่ถึงคำสอนสั้น", lo: "ຕັ້ງແຕ່ຜູ້ເຊື່ອໃໝ່ຮອດຄຳສອນສັ້ນ" },
  "home.shareTitle":  { ko: "복음 전하기 · 새신자 영접", en: "Share the Gospel · Lead to Christ", th: "ประกาศข่าวประเสริฐ · นำสู่พระคริสต์", lo: "ປະກາດຂ່າວປະເສີດ · ນຳສູ່ພຣະຄຣິດ" },
  "home.shareSub":    { ko: "다국어·음성으로 복음을 전하고 영접까지", en: "Share in many languages & voice, to decision", th: "ประกาศหลายภาษา·เสียง จนถึงการตัดสินใจ", lo: "ປະກາດຫຼາຍພາສາ·ສຽງ ຈົນຮອດການຕັດສິນໃຈ" },

  "menu.newcomer.t":  { ko: "새신자", en: "New Believer", th: "ผู้เชื่อใหม่", lo: "ຜູ້ເຊື່ອໃໝ່" },
  "menu.newcomer.s":  { ko: "예수님을 처음 만난 분", en: "Just met Jesus", th: "เพิ่งพบพระเยซู", lo: "ຫາກໍພົບພຣະເຢຊູ" },
  "menu.baptism.t":   { ko: "세례자", en: "Baptism", th: "บัพติศมา", lo: "ບັບຕິສະມາ" },
  "menu.baptism.s":   { ko: "세례를 준비하는 분", en: "Preparing for baptism", th: "เตรียมรับบัพติศมา", lo: "ກຽມຮັບບັບຕິສະມາ" },
  "menu.confirmation.t": { ko: "입교자", en: "Confirmation", th: "การเป็นสมาชิกสมบูรณ์", lo: "ການເປັນສະມາຊິກສົມບູນ" },
  "menu.confirmation.s": { ko: "입교를 준비하는 분", en: "Preparing for confirmation", th: "เตรียมเป็นสมาชิกสมบูรณ์", lo: "ກຽມເປັນສະມາຊິກສົມບູນ" },
  "menu.deep.t":      { ko: "제자양육", en: "Discipleship", th: "การเป็นสาวก", lo: "ການເປັນສາວົກ" },
  "menu.deep.s":      { ko: "더 깊은 성경공부", en: "Deeper Bible Study", th: "ศึกษาพระคัมภีร์เชิงลึก", lo: "ສຶກສາພຣະຄຳພີເລິກເຊິ່ງ" },
  "menu.catechism.t": { ko: "소요리문답", en: "Catechism", th: "คำสอนสั้น", lo: "ຄຳສອນສັ້ນ" },
  "menu.catechism.s": { ko: "웨스트민스터 107문답", en: "Westminster Shorter (107)", th: "เวสต์มินสเตอร์ 107 ข้อ", lo: "ເວສມິນສະເຕີ 107 ຂໍ້" },
  "menu.quiz.t":      { ko: "성경퀴즈", en: "Bible Quiz", th: "ควิซพระคัมภีร์", lo: "ຄິວສ໌ພຣະຄຳພີ" },
  "menu.quiz.s":      { ko: "말씀 퀴즈로 도전 · 랭킹", en: "Quiz & ranking", th: "ควิซและอันดับ", lo: "ຄິວສ໌ ແລະ ອັນດັບ" },

  "login.tagline1":   { ko: "말씀을 즐겁게, 퀴즈로 만나는 시간.", en: "Meet the Word, joyfully — through quiz.", th: "พบพระวจนะอย่างสนุก ผ่านควิซ", lo: "ພົບພຣະທຳຢ່າງມ່ວນຊື່ນ ຜ່ານຄິວສ໌" },
  "login.tagline2":   { ko: "남녀노소 누구나 함께해요.", en: "For everyone, all ages.", th: "สำหรับทุกเพศทุกวัย", lo: "ສຳລັບທຸກເພດທຸກໄວ" },
  "login.kakao":      { ko: "카카오로 시작하기", en: "Start with Kakao", th: "เริ่มด้วย Kakao", lo: "ເລີ່ມດ້ວຍ Kakao" },
  "login.google":     { ko: "구글(Gmail)로 시작하기", en: "Continue with Google", th: "ดำเนินการต่อด้วย Google", lo: "ດຳເນີນຕໍ່ດ້ວຍ Google" },
  "login.redirecting":{ ko: "이동 중...", en: "Redirecting...", th: "กำลังนำทาง...", lo: "ກຳລັງນຳທາງ..." },
  "login.free":       { ko: "가입은 무료예요. 카카오·구글 계정으로 3초 만에 시작할 수 있어요.", en: "Free to join — start in 3 seconds with Kakao or Google.", th: "สมัครฟรี เริ่มได้ใน 3 วินาทีด้วย Kakao หรือ Google", lo: "ສະໝັກຟຣີ ເລີ່ມໄດ້ໃນ 3 ວິນາທີດ້ວຍ Kakao ຫຼື Google" },
  "login.fail":       { ko: "로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.", en: "Couldn't start login. Please try again shortly.", th: "เริ่มเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", lo: "ເລີ່ມເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່" },
  // 로그인 화면 말씀 (시편 119:105 · NIV / Thai / Lao)
  "login.verse":      { ko: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", en: "Your word is a lamp for my feet, a light on my path.", th: "พระวจนะของพระองค์เป็นโคมสำหรับเท้าของข้าพระองค์ และเป็นความสว่างแก่ทางของข้าพระองค์", lo: "ພຣະທຳຂອງພຣະອົງເປັນໂຄມສຳລັບຕີນຂອງຂ້ານ້ອຍ ແລະ ເປັນແສງສະຫວ່າງແກ່ທາງຂອງຂ້ານ້ອຍ" },
  "login.verseRef":   { ko: "시편 119:105", en: "Psalm 119:105 (NIV)", th: "สดุดี 119:105", lo: "ເພງສັນລະເສີນ 119:105" },

  // 공통
  "c.loading":  { ko: "로딩 중...", en: "Loading...", th: "กำลังโหลด...", lo: "ກຳລັງໂຫຼດ..." },
  "c.back":     { ko: "← 목록", en: "← List", th: "← รายการ", lo: "← ລາຍການ" },
  "c.retry":    { ko: "다시 풀기 →", en: "Try again →", th: "ลองอีกครั้ง →", lo: "ລອງອີກຄັ້ງ →" },
  "c.answer":   { ko: "정답", en: "Answer", th: "คำตอบ", lo: "ຄຳຕອບ" },
  "c.me":       { ko: "(나)", en: "(me)", th: "(ฉัน)", lo: "(ຂ້ອຍ)" },
  "c.autoTrans":   { ko: "⚠ 자동 번역 (현지 검수 권장)", en: "⚠ Auto-translated (review advised)", th: "⚠ แปลอัตโนมัติ (ควรตรวจทาน)", lo: "⚠ ແປອັດຕະໂນມັດ (ຄວນກວດທານ)" },
  "c.autoTransing":{ ko: "⚠ 자동 번역 중…", en: "⚠ Translating…", th: "⚠ กำลังแปล…", lo: "⚠ ກຳລັງແປ…" },

  // 퀴즈
  "q.loading":  { ko: "문제를 불러오는 중...", en: "Loading questions...", th: "กำลังโหลดคำถาม...", lo: "ກຳລັງໂຫຼດຄຳຖາມ..." },
  "q.none":     { ko: "문제가 없습니다.", en: "No questions.", th: "ไม่มีคำถาม", lo: "ບໍ່ມີຄຳຖາມ" },
  "q.easy":     { ko: "쉬움", en: "Easy", th: "ง่าย", lo: "ງ່າຍ" },
  "q.medium":   { ko: "보통", en: "Medium", th: "ปานกลาง", lo: "ປານກາງ" },
  "q.hard":     { ko: "어려움", en: "Hard", th: "ยาก", lo: "ຍາກ" },
  "q.sec":      { ko: "초", en: "s", th: "วิ", lo: "ວິ" },
  "q.combo":    { ko: "🔥 {n}연속", en: "🔥 {n} streak", th: "🔥 {n} ติด", lo: "🔥 {n} ຕິດ" },
  "q.correct":  { ko: "🎉 정답!", en: "🎉 Correct!", th: "🎉 ถูกต้อง!", lo: "🎉 ຖືກຕ້ອງ!" },
  "q.pts":      { ko: "+{n}점", en: "+{n} pts", th: "+{n} แต้ม", lo: "+{n} ຄະແນນ" },
  "q.answerIs": { ko: "💡 정답: {a}", en: "💡 Answer: {a}", th: "💡 คำตอบ: {a}", lo: "💡 ຄຳຕອບ: {a}" },
  "q.hintShow": { ko: "💡 힌트 보기", en: "💡 Show hint", th: "💡 ดูคำใบ้", lo: "💡 ເບິ່ງຄຳໃບ້" },
  "q.hintHide": { ko: "💡 힌트 숨기기", en: "💡 Hide hint", th: "💡 ซ่อนคำใบ้", lo: "💡 ເຊື່ອງຄຳໃບ້" },
  "q.report":   { ko: "🚩 이 문제 신고", en: "🚩 Report this", th: "🚩 รายงานข้อนี้", lo: "🚩 ລາຍງານຂໍ້ນີ້" },
  "q.reported": { ko: "신고 접수됨 ✓", en: "Reported ✓", th: "รายงานแล้ว ✓", lo: "ລາຍງານແລ້ວ ✓" },
  "q.reportAlert": { ko: "신고가 접수됐어요. 검토하겠습니다. 감사합니다! 🙏", en: "Report received. We'll review it. Thank you! 🙏", th: "รับรายงานแล้ว เราจะตรวจสอบ ขอบคุณ! 🙏", lo: "ຮັບລາຍງານແລ້ວ ພວກເຮົາຈະກວດສອບ ຂອບໃຈ! 🙏" },
  "q.next":     { ko: "다음 문제 →", en: "Next →", th: "ถัดไป →", lo: "ຕໍ່ໄປ →" },
  "q.result":   { ko: "결과 보기 →", en: "See result →", th: "ดูผล →", lo: "ເບິ່ງຜົນ →" },

  // 결과
  "r.grade90":  { ko: "🏆 말씀의 달인!", en: "🏆 Word Master!", th: "🏆 ปรมาจารย์พระวจนะ!", lo: "🏆 ຈອມຍຸດແຫ່ງພຣະທຳ!" },
  "r.grade70":  { ko: "😊 훌륭해요!", en: "😊 Great job!", th: "😊 เยี่ยมมาก!", lo: "😊 ດີຫຼາຍ!" },
  "r.grade50":  { ko: "📖 조금 더!", en: "📖 Keep going!", th: "📖 อีกนิด!", lo: "📖 ອີກໜ້ອຍ!" },
  "r.grade0":   { ko: "🌱 다시 도전!", en: "🌱 Try again!", th: "🌱 สู้ใหม่!", lo: "🌱 ສູ້ໃໝ່!" },
  "r.accuracy": { ko: "정답률 {n}%", en: "{n}% correct", th: "ถูก {n}%", lo: "ຖືກ {n}%" },
  "r.points":   { ko: "⭐ {n}점 획득", en: "⭐ {n} points earned", th: "⭐ ได้ {n} แต้ม", lo: "⭐ ໄດ້ {n} ຄະແນນ" },
  "r.saving":   { ko: "점수 저장 중...", en: "Saving score...", th: "กำลังบันทึกคะแนน...", lo: "ກຳລັງບັນທຶກຄະແນນ..." },
  "r.saved":    { ko: "✅ 점수가 저장되었어요", en: "✅ Score saved", th: "✅ บันทึกคะแนนแล้ว", lo: "✅ ບັນທຶກຄະແນນແລ້ວ" },
  "r.saveFail": { ko: "점수 저장 실패", en: "Save failed", th: "บันทึกล้มเหลว", lo: "ບັນທຶກລົ້ມເຫຼວ" },
  "r.saveRetry":{ ko: "다시 저장", en: "Retry", th: "ลองอีกครั้ง", lo: "ບັນທຶກອີກຄັ້ງ" },
  "r.loginSave":{ ko: "하면 점수가 저장되고 랭킹에 올라가요", en: " to save your score and join the ranking", th: " เพื่อบันทึกคะแนนและขึ้นอันดับ", lo: " ເພື່ອບັນທຶກຄະແນນ ແລະ ຂຶ້ນອັນດັບ" },
  "r.imgSave":  { ko: "🖼️ 이미지 저장", en: "🖼️ Save image", th: "🖼️ บันทึกรูป", lo: "🖼️ ບັນທຶກຮູບ" },
  "r.share":    { ko: "💬 공유하기", en: "💬 Share", th: "💬 แชร์", lo: "💬 ແບ່ງປັນ" },
  "r.wrongNote":{ ko: "📝 오답노트", en: "📝 Wrong-answer notes", th: "📝 สมุดข้อผิด", lo: "📝 ປຶ້ມຂໍ້ຜິດ" },
  "r.perfect":  { ko: "🎉 만점! 틀린 문제가 없어요", en: "🎉 Perfect! No wrong answers", th: "🎉 เต็ม! ไม่มีข้อผิด", lo: "🎉 ເຕັມ! ບໍ່ມີຂໍ້ຜິດ" },
  "r.answerLine": { ko: "정답: {a}", en: "Answer: {a}", th: "คำตอบ: {a}", lo: "ຄຳຕອບ: {a}" },
  "r.more":     { ko: "외 {n}개 더 틀렸어요 — 다시 풀며 복습해 보세요!", en: "{n} more wrong — review by retrying!", th: "ผิดอีก {n} ข้อ — ทบทวนด้วยการลองใหม่!", lo: "ຜິດອີກ {n} ຂໍ້ — ທົບທວນດ້ວຍການລອງໃໝ່!" },
  "r.ranking":  { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ", lo: "🏆 ອັນດັບ" },
  "r.myNotes":  { ko: "📒 내 오답노트", en: "📒 My notes", th: "📒 สมุดของฉัน", lo: "📒 ປຶ້ມຂອງຂ້ອຍ" },
  "r.home":     { ko: "홈으로", en: "Home", th: "หน้าแรก", lo: "ໜ້າຫຼັກ" },
  "r.again":    { ko: "다시 도전 →", en: "Play again →", th: "เล่นอีก →", lo: "ຫຼິ້ນອີກ →" },
  "r.tryComplete": { ko: "📚 신학생·목회자라면 ‘빠짐없이 풀기’로 전 문제 완주", en: "📚 Students & pastors — complete every question", th: "📚 นักศึกษา·ศิษยาภิบาล — ทำครบทุกข้อ", lo: "📚 ນັກສຶກສາ·ສິດຍາພິບານ — ເຮັດຄົບທຸກຂໍ້" },

  // 랭킹
  "rk.title":   { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ", lo: "🏆 ອັນດັບ" },
  "rk.weekly":  { ko: "🔥 주간", en: "🔥 Weekly", th: "🔥 รายสัปดาห์", lo: "🔥 ລາຍອາທິດ" },
  "rk.all":     { ko: "🏆 전체", en: "🏆 All-time", th: "🏆 ทั้งหมด", lo: "🏆 ທັງໝົດ" },
  "rk.descWeekly": { ko: "최근 7일 동안 모은 점수예요. (전체 기록은 사라지지 않아요)", en: "Points from the last 7 days. (All-time record stays.)", th: "คะแนนใน 7 วันล่าสุด (สถิติรวมไม่หาย)", lo: "ຄະແນນໃນ 7 ມື້ຫຼ້າສຸດ (ສະຖິຕິລວມບໍ່ຫາຍ)" },
  "rk.descAll": { ko: "지금까지 모은 누적 점수예요 — 사라지지 않고 계속 쌓입니다 ⭐", en: "Your all-time points — they keep adding up ⭐", th: "คะแนนสะสมทั้งหมด — สะสมต่อเนื่อง ⭐", lo: "ຄະແນນສະສົມທັງໝົດ — ສະສົມຕໍ່ເນື່ອງ ⭐" },
  "rk.loginRank": { ko: "하면 내 순위가 표시돼요", en: " to see your rank", th: " เพื่อดูอันดับของคุณ", lo: " ເພື່ອເບິ່ງອັນດັບຂອງທ່ານ" },
  "rk.fail":    { ko: "랭킹을 불러오지 못했어요.", en: "Couldn't load the ranking.", th: "โหลดอันดับไม่สำเร็จ", lo: "ໂຫຼດອັນດັບບໍ່ສຳເລັດ" },
  "rk.empty":   { ko: "아직 기록이 없어요. 첫 주인공이 되어보세요!", en: "No records yet. Be the first!", th: "ยังไม่มีสถิติ มาเป็นคนแรกสิ!", lo: "ຍັງບໍ່ມີສະຖິຕິ ມາເປັນຄົນທຳອິດເລີຍ!" },
  "rk.rankUnit":{ ko: "{n}위", en: "#{n}", th: "อันดับ {n}", lo: "ອັນດັບ {n}" },
  "rk.plays":   { ko: "{n}판", en: "{n} plays", th: "{n} ครั้ง", lo: "{n} ຄັ້ງ" },

  // 오답노트(history)
  "h.title":    { ko: "📒 내 오답노트", en: "📒 My Wrong-Answer Notes", th: "📒 สมุดข้อผิดของฉัน", lo: "📒 ປຶ້ມຂໍ້ຜິດຂອງຂ້ອຍ" },
  "h.total":    { ko: "총 {n}개 틀렸어요", en: "{n} wrong answers", th: "ผิดทั้งหมด {n} ข้อ", lo: "ຜິດທັງໝົດ {n} ຂໍ້" },
  "h.topBooks": { ko: "자주 틀리는 권: {b} — 여길 더 읽어보세요!", en: "Most missed: {b} — read these more!", th: "ผิดบ่อย: {b} — อ่านเพิ่ม!", lo: "ຜິດເລື້ອຍ: {b} — ອ່ານເພີ່ມ!" },
  "h.retry":    { ko: "🔁 틀린 문제 다시 풀기", en: "🔁 Retry wrong questions", th: "🔁 ทำข้อที่ผิดอีกครั้ง", lo: "🔁 ເຮັດຂໍ້ທີ່ຜິດອີກຄັ້ງ" },
  "h.fail":     { ko: "불러오지 못했어요.", en: "Couldn't load.", th: "โหลดไม่สำเร็จ", lo: "ໂຫຼດບໍ່ສຳເລັດ" },
  "h.emptyT":   { ko: "아직 틀린 문제가 없어요", en: "No wrong answers yet", th: "ยังไม่มีข้อผิด", lo: "ຍັງບໍ່ມີຂໍ້ຜິດ" },
  "h.emptyS":   { ko: "퀴즈를 풀면 틀린 문제가 여기 모여요.", en: "Wrong answers will appear here.", th: "ข้อที่ผิดจะมาอยู่ที่นี่", lo: "ຂໍ້ທີ່ຜິດຈະມາຢູ່ນີ້" },
  "h.retryNone":{ ko: "다시 풀 문제를 찾지 못했어요.", en: "No questions to retry.", th: "ไม่พบข้อให้ทำใหม่", lo: "ບໍ່ພົບຂໍ້ໃຫ້ເຮັດໃໝ່" },
  "h.retryFail":{ ko: "다시 풀 문제를 불러오지 못했어요.", en: "Couldn't load questions to retry.", th: "โหลดข้อสำหรับทำใหม่ไม่สำเร็จ", lo: "ໂຫຼດຂໍ້ສຳລັບເຮັດໃໝ່ບໍ່ສຳເລັດ" },

  // 과정(course)
  "co.done":    { ko: "{a} / {b} 수료", en: "{a} / {b} done", th: "เสร็จ {a} / {b}", lo: "ສຳເລັດ {a} / {b}" },
  "co.courseTitle": { ko: "{t} 과정", en: "{t} Course", th: "หลักสูตร {t}", lo: "ຫຼັກສູດ {t}" },
  "co.allDone": { ko: "🎉 {t} 과정 수료!", en: "🎉 {t} course complete!", th: "🎉 จบหลักสูตร {t}!", lo: "🎉 ຈົບຫຼັກສູດ {t}!" },
  "co.allDoneSub": { ko: "모든 과를 마쳤어요. 정말 잘하셨습니다!", en: "You finished every lesson. Well done!", th: "คุณเรียนครบทุกบทแล้ว เยี่ยมมาก!", lo: "ທ່ານຮຽນຄົບທຸກບົດແລ້ວ ດີຫຼາຍ!" },
  "co.notFound":{ ko: "과정을 찾을 수 없어요.", en: "Course not found.", th: "ไม่พบหลักสูตร", lo: "ບໍ່ພົບຫຼັກສູດ" },
  "co.lessonNotFound": { ko: "과를 찾을 수 없어요.", en: "Lesson not found.", th: "ไม่พบบทเรียน", lo: "ບໍ່ພົບບົດຮຽນ" },
  "co.done2":   { ko: "수료 완료", en: "Completed", th: "เสร็จแล้ว", lo: "ສຳເລັດແລ້ວ" },
  "co.learnQuiz": { ko: "배우고 문제 풀기", en: "Learn & quiz", th: "เรียนและทำควิซ", lo: "ຮຽນ ແລະ ເຮັດຄິວສ໌" },
  "co.disclaimer": { ko: "※ 예장 합동(웨스트민스터 표준문서) 기준 v1 초안입니다. 사용 전 검토해 주세요.", en: "※ Draft v1 (Westminster standards). Please review before use.", th: "※ ฉบับร่าง v1 (มาตรฐานเวสต์มินสเตอร์) โปรดตรวจก่อนใช้", lo: "※ ສະບັບຮ່າງ v1 (ມາດຕະຖານເວສມິນສະເຕີ) ກະລຸນາກວດກ່ອນໃຊ້" },
  "co.startQuiz": { ko: "문제 풀기 →", en: "Start quiz →", th: "เริ่มควิซ →", lo: "ເລີ່ມຄິວສ໌ →" },
  "co.finishLesson": { ko: "이 과 마치기 →", en: "Finish lesson →", th: "จบบทนี้ →", lo: "ຈົບບົດນີ້ →" },
  "co.lessonDone": { ko: "수료!", en: "Completed!", th: "เสร็จแล้ว!", lo: "ສຳເລັດແລ້ວ!" },
  "co.scoreLine": { ko: "{total}문제 중 {n}문제 정답", en: "{n} of {total} correct", th: "ถูก {n} จาก {total} ข้อ", lo: "ຖືກ {n} ຈาก {total} ຂໍ້" },
  "co.nextLesson": { ko: "다음 과로 →", en: "Next lesson →", th: "บทถัดไป →", lo: "ບົດຕໍ່ໄປ →" },
  "co.lastLesson": { ko: "🏅 {t} 과정의 마지막 과예요!", en: "🏅 Last lesson of {t}!", th: "🏅 บทสุดท้ายของ {t}!", lo: "🏅 ບົດສຸດທ້າຍຂອງ {t}!" },
  "co.toList":  { ko: "과정 목록으로", en: "Back to lessons", th: "กลับไปรายการบท", lo: "ກັບໄປລາຍການບົດ" },

  // 소요리문답
  "cat.title":  { ko: "웨스트민스터 소요리문답", en: "Westminster Shorter Catechism", th: "คำสอนสั้นเวสต์มินสเตอร์", lo: "ຄຳສອນສັ້ນເວສມິນສະເຕີ" },
  "cat.sub":    { ko: "전체 107문답 · 예장 합동 표준", en: "All 107 Q&A · Westminster standard", th: "ทั้งหมด 107 ข้อ · มาตรฐานเวสต์มินสเตอร์", lo: "ທັງໝົດ 107 ຂໍ້ · ມາດຕະຖານເວສມິນສະເຕີ" },
  "cat.memProg":{ ko: "외운 문답", en: "Memorized", th: "ท่องได้แล้ว", lo: "ທ່ອງໄດ້ແລ້ວ" },
  "cat.all":    { ko: "전체", en: "All", th: "ทั้งหมด", lo: "ທັງໝົດ" },
  "cat.god":    { ko: "하나님", en: "God", th: "พระเจ้า", lo: "ພຣະເຈົ້າ" },
  "cat.salv":   { ko: "구원", en: "Salvation", th: "ความรอด", lo: "ຄວາມລອດ" },
  "cat.law":    { ko: "십계명", en: "Commandments", th: "บัญญัติ", lo: "ບັນຍັດ" },
  "cat.prayer": { ko: "기도", en: "Prayer", th: "การอธิษฐาน", lo: "ການອະທິຖານ" },
  "cat.readMode": { ko: "📖 전체 보기", en: "📖 Read all", th: "📖 อ่านทั้งหมด", lo: "📖 ອ່ານທັງໝົດ" },
  "cat.memMode":{ ko: "🧠 외우기(답 가림)", en: "🧠 Memorize (hide)", th: "🧠 ท่องจำ (ซ่อน)", lo: "🧠 ທ່ອງຈຳ (ເຊື່ອງ)" },
  "cat.qno":    { ko: "제{n}문", en: "Q{n}", th: "ข้อ {n}", lo: "ຂໍ້ {n}" },
  "cat.tapAns": { ko: "👆 눌러서 답 보기", en: "👆 Tap to reveal answer", th: "👆 แตะเพื่อดูคำตอบ", lo: "👆 ແຕະເພື່ອເບິ່ງຄຳຕອບ" },
  "cat.memOn":  { ko: "✓ 외움", en: "✓ Memorized", th: "✓ ท่องได้", lo: "✓ ທ່ອງໄດ້" },
  "cat.memOff": { ko: "외움 표시", en: "Mark memorized", th: "ทำเครื่องหมาย", lo: "ໝາຍວ່າທ່ອງໄດ້" },
  "cat.quizBtn":{ ko: "🎯 퀴즈", en: "🎯 Quiz", th: "🎯 ควิซ", lo: "🎯 ຄິວສ໌" },
  "cat.quizDone": { ko: "소요리문답 퀴즈 정답률 {n}%", en: "Catechism quiz: {n}% correct", th: "ควิซคำสอน: ถูก {n}%", lo: "ຄິວສ໌ຄຳສອນ: ຖືກ {n}%" },
  "cat.toCat":  { ko: "문답으로 돌아가기", en: "Back to catechism", th: "กลับไปคำสอน", lo: "ກັບໄປຄຳສອນ" },
  "cat.exit":   { ko: "✕ 나가기", en: "✕ Exit", th: "✕ ออก", lo: "✕ ອອກ" },

  // 현황판
  "ad.title":   { ko: "🔧 현황판", en: "🔧 Dashboard", th: "🔧 แดชบอร์ด", lo: "🔧 ກະດານ" },
  "ad.desc":    { ko: "성도별 양육 과정 수료 진도와 퀴즈 참여 현황이에요.", en: "Each member's course progress and quiz activity.", th: "ความคืบหน้าหลักสูตรและควิซของสมาชิกแต่ละคน", lo: "ຄວາມຄືບໜ້າຫຼັກສູດ ແລະ ຄິວສ໌ຂອງສະມາຊິກແຕ່ລະຄົນ" },
  "ad.denied":  { ko: "관리자 전용 페이지예요", en: "Admins only", th: "เฉพาะผู้ดูแล", lo: "ສະເພາະຜູ້ດູແລ" },
  "ad.deniedSub": { ko: "목사님(관리자)만 볼 수 있습니다.", en: "Only the pastor (admin) can view this.", th: "เฉพาะศิษยาภิบาล(ผู้ดูแล)เท่านั้น", lo: "ສະເພາະສິດຍາພິບານ(ຜູ້ດູແລ)ເທົ່ານັ້ນ" },
  "ad.total":   { ko: "총 {n}명", en: "{n} members", th: "{n} คน", lo: "{n} ຄົນ" },
  "ad.empty":   { ko: "아직 등록된 성도가 없어요.", en: "No members yet.", th: "ยังไม่มีสมาชิก", lo: "ຍັງບໍ່ມີສະມາຊິກ" },
  "ad.quizStat":{ ko: "퀴즈 {p}판 · ⭐{pt}", en: "{p} plays · ⭐{pt}", th: "{p} ครั้ง · ⭐{pt}", lo: "{p} ຄັ້ງ · ⭐{pt}" },

  // 절차 안내
  "g.title":    { ko: "교인 절차 안내", en: "Membership Steps", th: "ขั้นตอนการเป็นสมาชิก", lo: "ຂັ້ນຕອນການເປັນສະມາຊິກ" },
  "g.sub":      { ko: "등록 → 학습 → 세례 / 입교 (예장 합동 기준)", en: "Register → Catechumen → Baptism / Confirmation", th: "ลงทะเบียน → ผู้เรียน → บัพติศมา / สมาชิก", lo: "ລົງທະບຽນ → ຜູ້ຮຽນ → ບັບຕິສະມາ / ສະມາຊິກ" },
  "g.step1t":   { ko: "등록교인 (새신자)", en: "Registered (New Believer)", th: "ผู้ลงทะเบียน (ผู้เชื่อใหม่)", lo: "ຜູ້ລົງທະບຽນ (ຜູ້ເຊື່ອໃໝ່)" },
  "g.step1d":   { ko: "교회에 처음 등록하고 예배에 참여하는 단계입니다. 새신자 과정으로 신앙의 기초를 배웁니다.", en: "You register at the church and join worship. The New Believer course teaches the basics of faith.", th: "ลงทะเบียนกับคริสตจักรและร่วมนมัสการ หลักสูตรผู้เชื่อใหม่สอนพื้นฐานความเชื่อ", lo: "ລົງທະບຽນກັບໂບດ ແລະ ຮ່ວມນະມັດສະການ ຫຼັກສູດຜູ້ເຊື່ອໃໝ່ສອນພື້ນຖານຄວາມເຊື່ອ" },
  "g.step2t":   { ko: "학습교인 (학습)", en: "Catechumen", th: "ผู้เรียนคำสอน", lo: "ຜູ້ຮຽນຄຳສອນ" },
  "g.step2d":   { ko: "일정 기간 출석한 뒤, 학습 문답을 통해 신앙을 점검받고 '학습'을 받습니다. 세례를 준비하는 단계입니다.", en: "After attending for a time, your faith is examined through catechism and you become a catechumen — preparing for baptism.", th: "หลังเข้าร่วมระยะหนึ่ง ความเชื่อจะถูกตรวจสอบผ่านคำสอน เพื่อเตรียมรับบัพติศมา", lo: "ຫຼັງເຂົ້າຮ່ວມໄລຍະໜຶ່ງ ຄວາມເຊື່ອຈະຖືກກວດສອບຜ່ານຄຳສອນ ເພື່ອກຽມຮັບບັບຕິສະມາ" },
  "g.step3t":   { ko: "세례교인 (세례)", en: "Baptized Member", th: "สมาชิกที่รับบัพติศมา", lo: "ສະມາຊິກທີ່ຮັບບັບຕິສະມາ" },
  "g.step3d":   { ko: "신앙을 고백하고 세례 문답을 거쳐 세례를 받습니다. 이제 성찬에 참여하는 정식 교인(정회원)이 됩니다.", en: "You confess your faith, pass the baptism examination, and are baptized — becoming a full member who partakes in Communion.", th: "สารภาพความเชื่อ ผ่านการสอบบัพติศมา และรับบัพติศมา เป็นสมาชิกเต็มที่ร่วมพิธีมหาสนิท", lo: "ສາລະພາບຄວາມເຊື່ອ ຜ່ານການສອບບັບຕິສະມາ ແລະ ຮັບບັບຕິສະມາ ກາຍເປັນສະມາຊິກເຕັມຕົວທີ່ຮ່ວມພິທີມະຫາສະນິດ" },
  "g.step4t":   { ko: "입교 (유아세례자)", en: "Confirmation (Infant-baptized)", th: "การเป็นสมาชิกสมบูรณ์ (ผู้รับบัพติศมาทารก)", lo: "ການເປັນສະມາຊິກສົມບູນ (ຜູ້ຮັບບັບຕິສະມາແຕ່ນ້ອຍ)" },
  "g.step4d":   { ko: "어려서 유아세례를 받은 '언약의 자녀'는, 자라서 스스로 신앙을 고백함으로 입교하여 세례교인이 됩니다.", en: "A 'covenant child' baptized as an infant grows up to confess faith personally and is confirmed as a full member.", th: "'บุตรแห่งพันธสัญญา' ที่รับบัพติศมาตั้งแต่ทารก เมื่อโตขึ้นสารภาพความเชื่อด้วยตนเองและเป็นสมาชิกสมบูรณ์", lo: "'ບຸດແຫ່ງພັນທະສັນຍາ' ທີ່ຮັບບັບຕິສະມາແຕ່ນ້ອຍ ເມື່ອໃຫຍ່ຂຶ້ນສາລະພາບຄວາມເຊື່ອດ້ວຍຕົນເອງ ແລະ ເປັນສະມາຊິກສົມບູນ" },
  "g.callout":  { ko: "✔ 세례·입교교인은 성찬에 참여하고 공동의회 등 교회의 권리와 의무를 함께 집니다.\n✔ 세부 기간·문답·자격은 교회(당회)마다 차이가 있을 수 있으니 섬기는 교회의 안내를 따르세요.", en: "✔ Baptized/confirmed members partake in Communion and share the church's rights and duties.\n✔ Exact periods, catechism, and requirements vary by church — follow your church's guidance.", th: "✔ สมาชิกที่รับบัพติศมา/เป็นสมาชิกสมบูรณ์ร่วมพิธีมหาสนิทและมีสิทธิหน้าที่ในคริสตจักร\n✔ ระยะเวลา คำสอน และคุณสมบัติอาจต่างกันในแต่ละคริสตจักร โปรดทำตามคำแนะนำของคริสตจักรคุณ", lo: "✔ ສະມາຊິກທີ່ຮັບບັບຕິສະມາ/ເປັນສະມາຊິກສົມບູນຮ່ວມພິທີມະຫາສະນິດ ແລະ ມີສິດໜ້າທີ່ໃນໂບด\n✔ ໄລຍະເວລາ ຄຳສອນ ແລະ ຄຸນສົມບັດອາດຕ່າງກັນໃນແຕ່ລະໂບດ ກະລຸນາເຮັດຕາມຄຳແນະນຳຂອງໂບດທ່ານ" },
  "g.footer":   { ko: "※ 예장 합동 일반 절차 안내(v1). 교회 당회의 지침이 우선합니다.", en: "※ General steps (v1, Westminster tradition). Your church session's guidance takes precedence.", th: "※ ขั้นตอนทั่วไป (v1) คำแนะนำของคริสตจักรมีความสำคัญก่อน", lo: "※ ຂັ້ນຕອນທົ່ວໄປ (v1) ຄຳແນະນຳຂອງໂບດມີຄວາມສຳຄັນກ່ອນ" },
  "g.btnNew":   { ko: "🌱 새신자", en: "🌱 New", th: "🌱 ใหม่", lo: "🌱 ໃໝ່" },
  "g.btnBap":   { ko: "💧 세례", en: "💧 Baptism", th: "💧 บัพติศมา", lo: "💧 ບັບຕິສະມາ" },
  "g.btnConf":  { ko: "✝️ 입교", en: "✝️ Confirm", th: "✝️ สมาชิก", lo: "✝️ ສະມາຊິກ" },

  // 퀴즈 설정(play)
  "pl.title":     { ko: "📖 성경 퀴즈", en: "📖 Bible Quiz", th: "📖 ควิซพระคัมภีร์", lo: "📖 ຄິວສ໌ພຣະຄຳພີ" },
  "pl.all":       { ko: "전체", en: "All", th: "ทั้งหมด", lo: "ທັງໝົດ" },
  "pl.old":       { ko: "구약", en: "Old Testament", th: "พันธสัญญาเดิม", lo: "ພັນທະສັນຍາເດີມ" },
  "pl.new":       { ko: "신약", en: "New Testament", th: "พันธสัญญาใหม่", lo: "ພັນທະສັນຍາໃໝ່" },
  "pl.testament": { ko: "성경 구분", en: "Testament", th: "ภาคพระคัมภีร์", lo: "ພາກພຣະຄຳພີ" },
  "pl.level":     { ko: "난이도", en: "Difficulty", th: "ระดับ", lo: "ລະດັບ" },
  "pl.count":     { ko: "문제 수", en: "Questions", th: "จำนวนข้อ", lo: "ຈຳນວນຂໍ້" },
  "pl.countN":    { ko: "{n}문제", en: "{n} Q", th: "{n} ข้อ", lo: "{n} ຂໍ້" },
  "pl.books":     { ko: "성경 권 (선택)", en: "Books (optional)", th: "หนังสือ (เลือกได้)", lo: "ໜັງສື (ເລືອກໄດ້)" },
  "pl.allBooks":  { ko: "전체 권에서 출제", en: "From all books", th: "จากทุกเล่ม", lo: "ຈากທຸກຫົວ" },
  "pl.booksSel":  { ko: "{n}권 선택됨", en: "{n} selected", th: "เลือก {n} เล่ม", lo: "ເລືອກ {n} ຫົວ" },
  "pl.close":     { ko: "▲ 닫기", en: "▲ Close", th: "▲ ปิด", lo: "▲ ປິດ" },
  "pl.openPick":  { ko: "▼ 골라보기", en: "▼ Pick", th: "▼ เลือก", lo: "▼ ເລືອກ" },
  "pl.selectAll": { ko: "전체 선택", en: "Select all", th: "เลือกทั้งหมด", lo: "ເລືອກທັງໝົດ" },
  "pl.clear":     { ko: "선택 해제", en: "Clear", th: "ล้าง", lo: "ລ້າງ" },
  "pl.start":     { ko: "퀴즈 시작 →", en: "Start quiz →", th: "เริ่มควิซ →", lo: "ເລີ່ມຄິວສ໌ →" },
  "pl.complete":  { ko: "📚 빠짐없이 풀기 (전 문제)", en: "📚 Complete all", th: "📚 ทำครบทุกข้อ", lo: "📚 ເຮັດຄົບທຸກຂໍ້" },
  "pl.completeHint": { ko: "신학생·목회자용 — 범위 내 모든 문제를 순서대로(타이머 없이), 이어풀기 됩니다", en: "For students & pastors — every question in order, no timer, resumable", th: "สำหรับนักศึกษา·ศิษยาภิบาล — ทุกข้อตามลำดับ ไม่มีเวลาจับ ทำต่อได้", lo: "ສຳລັບນັກສຶກສາ·ສິດຍາພິບານ — ທຸກຂໍ້ຕາມລຳດັບ ບໍ່ມີໂມງຈັບ ສືບຕໍ່ໄດ້" },
  "q.restart":    { ko: "↺ 처음부터", en: "↺ Restart", th: "↺ เริ่มใหม่", lo: "↺ ເລີ່ມໃໝ່" },
  "q.studyDone":  { ko: "🎓 이 범위를 완주했어요!", en: "🎓 You completed this scope!", th: "🎓 ทำครบขอบเขตนี้แล้ว!", lo: "🎓 ເຮັດຄົບຂອບເຂດນີ້ແລ້ວ!" },
  "q.retryWrong": { ko: "❌ 틀린 {n}문제 다시 풀기", en: "❌ Retry {n} wrong", th: "❌ ทำข้อผิด {n} ข้ออีกครั้ง", lo: "❌ ເຮັດຂໍ້ຜິດ {n} ຂໍ້ອີກ" },
  "q.progressBtn":{ ko: "📊 진도", en: "📊 Progress", th: "📊 ความคืบหน้า", lo: "📊 ຄວາມຄືບໜ້າ" },
  "q.bookProg":   { ko: "권별 진도율", en: "Progress by book", th: "ความคืบหน้าตามเล่ม", lo: "ຄວາມຄືບໜ້າຕາມຫົວ" },
  "q.studyScore": { ko: "맞음 {o} · 틀림 {x} / 전체 {t}", en: "Correct {o} · Wrong {x} / Total {t}", th: "ถูก {o} · ผิด {x} / ทั้งหมด {t}", lo: "ຖືກ {o} · ຜິດ {x} / ທັງໝົດ {t}" },
  "prog.title":   { ko: "📊 내 완주 진도", en: "📊 My progress", th: "📊 ความคืบหน้าของฉัน", lo: "📊 ຄວາມຄືບໜ້າຂອງຂ້ອຍ" },
  "prog.link":    { ko: "📊 내 진도", en: "📊 My progress", th: "📊 ความคืบหน้า", lo: "📊 ຄວາມຄືບໜ້າ" },
  "prog.login":   { ko: "로그인하면 권별 완주 진도를 볼 수 있어요.", en: "Log in to see your progress by book.", th: "เข้าสู่ระบบเพื่อดูความคืบหน้าตามเล่ม", lo: "ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງຄວາມຄືບໜ້າຕາມຫົວ" },
  "prog.overall": { ko: "전체 {a} / {t} ({p}%)", en: "Total {a} / {t} ({p}%)", th: "ทั้งหมด {a} / {t} ({p}%)", lo: "ທັງໝົດ {a} / {t} ({p}%)" },
  "prog.empty":   { ko: "아직 푼 문제가 없어요. ‘빠짐없이 풀기’로 시작해 보세요!", en: "No questions answered yet. Try Complete mode!", th: "ยังไม่ได้ทำข้อใด ลองโหมดทำครบทุกข้อ!", lo: "ຍັງບໍ່ໄດ້ເຮັດຂໍ້ໃດ ລອງໂໝດເຮັດຄົບທຸກຂໍ້!" },
};

interface I18n { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string; }
const I18nCtx = createContext<I18n>({ lang: "ko", setLang: () => {}, t: (k) => k });

const STATIC_UI = ["ko", "en", "th", "lo"]; // 직접 번역 보유 언어
const RTL_LANGS = new Set(["ar", "fa", "ur"]);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");
  const [uiMap, setUiMap] = useState<Record<string, string>>({}); // 영어 원문 → 현재 언어 번역(자동)

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("dabar_lang")) as Lang | null;
    if (saved && LANGS.some(l => l.code === saved)) setLangState(saved);
  }, []);

  // 방향(RTL) + UI 자동번역 (ko/en/th/lo 외 언어)
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
    if (STATIC_UI.includes(lang)) { setUiMap({}); return; }
    const cacheKey = `dabar_ui_${lang}`;
    let cache: Record<string, string> = {};
    try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch { /* */ }
    // 치환자({n} 등)가 없는 영어 문자열만 자동번역 (치환자 보존 위해)
    const allEn = Array.from(new Set(Object.values(DICT).map(e => e.en).filter(s => s && !s.includes("{"))));
    const need = allEn.filter(s => !(s in cache));
    if (!need.length) { setUiMap(cache); return; }
    setUiMap(cache);
    let cancelled = false;
    (async () => {
      for (let i = 0; i < need.length; i += 50) {
        const slice = need.slice(i, i + 50);
        try {
          const r = await fetch("/api/translate-batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: slice, source: "en", target: lang }) });
          if (!r.ok) break;
          const d = await r.json();
          (d.translations as string[] ?? []).forEach((tr, j) => { if (tr) cache[slice[j]] = tr; });
          if (cancelled) return;
          setUiMap({ ...cache });
        } catch { break; }
      }
      try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch { /* */ }
    })();
    return () => { cancelled = true; };
  }, [lang]);

  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("dabar_lang", l); } catch { /* ignore */ } };
  const t = (key: string, vars?: Record<string, string | number>) => {
    const e = DICT[key] as Record<string, string> | undefined;
    const en = e?.en;
    // 자동번역 언어: UI 번역맵 우선 → 없으면 영어
    let s = STATIC_UI.includes(lang)
      ? (e?.[lang] ?? en ?? e?.ko ?? key)
      : ((en && uiMap[en]) ?? en ?? e?.ko ?? key);
    if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
    return s;
  };
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);

// 🌐 언어 선택 토글
export function LangSelector() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const current = LANGS.find(l => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: "#173249", background: "rgba(13,52,84,0.05)", border: "1px solid rgba(13,52,84,0.15)", borderRadius: 16, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
        🌐 {current.label}<span style={{ fontSize: 9, opacity: 0.55, marginLeft: 1 }}>▼</span>
      </button>
      {open && (
        <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, minWidth: 150, background: "#fff", border: "1px solid rgba(13,52,84,0.15)", borderRadius: 14, boxShadow: "0 12px 32px rgba(23,50,73,0.18)", padding: 4 }}>
          {LANGS.map(l => {
            const on = l.code === lang;
            return (
              <button key={l.code} role="option" aria-selected={on} onClick={() => { const changed = l.code !== lang; setLang(l.code); setOpen(false); if (changed) { const m = DICT["common.langSwitched"] as Record<string, string> | undefined; setToast(m?.[l.code] ?? m?.en ?? ""); setTimeout(() => setToast(null), 3500); } }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 10, fontSize: 14, fontWeight: on ? 800 : 500, color: on ? "#1f9bef" : "#173249", background: on ? "rgba(31,155,239,0.10)" : "transparent", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                {l.label}{on && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 100, background: "#173249", color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", maxWidth: "86vw", textAlign: "center", lineHeight: 1.4 }}>
          🌐 {toast}
        </div>
      )}
    </div>
  );
}
