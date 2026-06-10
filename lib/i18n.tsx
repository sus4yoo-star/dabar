"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ko" | "en" | "th";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "th", label: "ไทย" },
];

type Dict = Record<string, Record<Lang, string>>;

// UI 문자열 사전 (콘텐츠가 아닌 화면 라벨). 콘텐츠(문제·교재)는 별도 단계.
const DICT: Dict = {
  "common.ranking":   { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ" },
  "common.wrongnote": { ko: "📒 오답", en: "📒 Notes", th: "📒 ข้อผิด" },
  "common.login":     { ko: "로그인", en: "Login", th: "เข้าสู่ระบบ" },
  "common.logout":    { ko: "로그아웃", en: "Logout", th: "ออกจากระบบ" },
  "common.save":      { ko: "저장", en: "Save", th: "บันทึก" },
  "common.home":      { ko: "← 홈", en: "← Home", th: "← หน้าแรก" },

  "home.tagline":     { ko: "다바르 · 말씀 — 무엇부터 시작할까요?", en: "DABAR · The Word — where to begin?", th: "ดาบาร์ · พระวจนะ — เริ่มจากตรงไหนดี?" },
  "home.greeting":    { ko: "{name}님, 오늘도 말씀과 함께해요 👋", en: "{name}, walk with the Word today 👋", th: "{name} วันนี้มาเดินกับพระวจนะกัน 👋" },
  "home.streakToday": { ko: "🔥 {n}일 연속 출석!", en: "🔥 {n}-day streak!", th: "🔥 ต่อเนื่อง {n} วัน!" },
  "home.streakGo":    { ko: "🔥 {n}일 연속 — 오늘도 풀면 이어져요!", en: "🔥 {n}-day streak — keep it going today!", th: "🔥 ต่อเนื่อง {n} วัน — ทำต่อวันนี้สิ!" },
  "home.invite":      { ko: "👋 친구 초대하고 같이 경쟁하기", en: "👋 Invite friends & compete", th: "👋 ชวนเพื่อนมาแข่งกัน" },
  "home.guide":       { ko: "📋 학습·세례·입교 절차 안내", en: "📋 Membership steps guide", th: "📋 ขั้นตอนการเป็นสมาชิก" },
  "home.admin":       { ko: "🔧 목사님 현황판", en: "🔧 Pastor dashboard", th: "🔧 แดชบอร์ดศิษยาภิบาล" },
  "home.growSection": { ko: "양육 · 교육 과정", en: "Discipleship · Education", th: "การเป็นสาวก · การศึกษา" },
  "home.shareTitle":  { ko: "복음 전하기 · 새신자 영접", en: "Share the Gospel · Lead to Christ", th: "ประกาศข่าวประเสริฐ · นำสู่พระคริสต์" },
  "home.shareSub":    { ko: "다국어·음성으로 복음을 전하고 영접까지", en: "Share in many languages & voice, to decision", th: "ประกาศหลายภาษา·เสียง จนถึงการตัดสินใจ" },

  "menu.newcomer.t":  { ko: "새신자", en: "New Believer", th: "ผู้เชื่อใหม่" },
  "menu.newcomer.s":  { ko: "예수님을 처음 만난 분", en: "Just met Jesus", th: "เพิ่งพบพระเยซู" },
  "menu.baptism.t":   { ko: "세례자", en: "Baptism", th: "บัพติศมา" },
  "menu.baptism.s":   { ko: "세례를 준비하는 분", en: "Preparing for baptism", th: "เตรียมรับบัพติศมา" },
  "menu.confirmation.t": { ko: "입교자", en: "Confirmation", th: "การเป็นสมาชิกสมบูรณ์" },
  "menu.confirmation.s": { ko: "입교를 준비하는 분", en: "Preparing for confirmation", th: "เตรียมเป็นสมาชิกสมบูรณ์" },
  "menu.deep.t":      { ko: "더 깊은 성경공부", en: "Deeper Bible Study", th: "ศึกษาพระคัมภีร์เชิงลึก" },
  "menu.deep.s":      { ko: "제자 양육", en: "Discipleship", th: "การเป็นสาวก" },
  "menu.catechism.t": { ko: "소교리문답", en: "Catechism", th: "คำสอนสั้น" },
  "menu.catechism.s": { ko: "웨스트민스터 107문답", en: "Westminster Shorter (107)", th: "เวสต์มินสเตอร์ 107 ข้อ" },
  "menu.quiz.t":      { ko: "성경퀴즈", en: "Bible Quiz", th: "ควิซพระคัมภีร์" },
  "menu.quiz.s":      { ko: "말씀 퀴즈로 도전 · 랭킹", en: "Quiz & ranking", th: "ควิซและอันดับ" },

  "login.tagline1":   { ko: "말씀을 즐겁게, 퀴즈로 만나는 시간.", en: "Meet the Word, joyfully — through quiz.", th: "พบพระวจนะอย่างสนุก ผ่านควิซ" },
  "login.tagline2":   { ko: "남녀노소 누구나 함께해요.", en: "For everyone, all ages.", th: "สำหรับทุกเพศทุกวัย" },
  "login.kakao":      { ko: "카카오로 시작하기", en: "Start with Kakao", th: "เริ่มด้วย Kakao" },
  "login.google":     { ko: "구글(Gmail)로 시작하기", en: "Continue with Google", th: "ดำเนินการต่อด้วย Google" },
  "login.redirecting":{ ko: "이동 중...", en: "Redirecting...", th: "กำลังนำทาง..." },
  "login.free":       { ko: "가입은 무료예요. 카카오·구글 계정으로 3초 만에 시작할 수 있어요.", en: "Free to join — start in 3 seconds with Kakao or Google.", th: "สมัครฟรี เริ่มได้ใน 3 วินาทีด้วย Kakao หรือ Google" },
  // 로그인 화면 말씀 (시편 119:105 · NIV / Thai)
  "login.verse":      { ko: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", en: "Your word is a lamp for my feet, a light on my path.", th: "พระวจนะของพระองค์เป็นโคมสำหรับเท้าของข้าพระองค์ และเป็นความสว่างแก่ทางของข้าพระองค์" },
  "login.verseRef":   { ko: "시편 119:105", en: "Psalm 119:105 (NIV)", th: "สดุดี 119:105" },

  // 공통
  "c.loading":  { ko: "로딩 중...", en: "Loading...", th: "กำลังโหลด..." },
  "c.back":     { ko: "← 목록", en: "← List", th: "← รายการ" },
  "c.retry":    { ko: "다시 풀기 →", en: "Try again →", th: "ลองอีกครั้ง →" },
  "c.answer":   { ko: "정답", en: "Answer", th: "คำตอบ" },
  "c.me":       { ko: "(나)", en: "(me)", th: "(ฉัน)" },

  // 퀴즈
  "q.loading":  { ko: "문제를 불러오는 중...", en: "Loading questions...", th: "กำลังโหลดคำถาม..." },
  "q.none":     { ko: "문제가 없습니다.", en: "No questions.", th: "ไม่มีคำถาม" },
  "q.easy":     { ko: "쉬움", en: "Easy", th: "ง่าย" },
  "q.medium":   { ko: "보통", en: "Medium", th: "ปานกลาง" },
  "q.hard":     { ko: "어려움", en: "Hard", th: "ยาก" },
  "q.sec":      { ko: "초", en: "s", th: "วิ" },
  "q.combo":    { ko: "🔥 {n}연속", en: "🔥 {n} streak", th: "🔥 {n} ติด" },
  "q.correct":  { ko: "🎉 정답!", en: "🎉 Correct!", th: "🎉 ถูกต้อง!" },
  "q.pts":      { ko: "+{n}점", en: "+{n} pts", th: "+{n} แต้ม" },
  "q.answerIs": { ko: "💡 정답: {a}", en: "💡 Answer: {a}", th: "💡 คำตอบ: {a}" },
  "q.hintShow": { ko: "💡 힌트 보기", en: "💡 Show hint", th: "💡 ดูคำใบ้" },
  "q.hintHide": { ko: "💡 힌트 숨기기", en: "💡 Hide hint", th: "💡 ซ่อนคำใบ้" },
  "q.report":   { ko: "🚩 이 문제 신고", en: "🚩 Report this", th: "🚩 รายงานข้อนี้" },
  "q.reported": { ko: "신고 접수됨 ✓", en: "Reported ✓", th: "รายงานแล้ว ✓" },
  "q.reportAlert": { ko: "신고가 접수됐어요. 검토하겠습니다. 감사합니다! 🙏", en: "Report received. We'll review it. Thank you! 🙏", th: "รับรายงานแล้ว เราจะตรวจสอบ ขอบคุณ! 🙏" },
  "q.next":     { ko: "다음 문제 →", en: "Next →", th: "ถัดไป →" },
  "q.result":   { ko: "결과 보기 →", en: "See result →", th: "ดูผล →" },

  // 결과
  "r.grade90":  { ko: "🏆 말씀의 달인!", en: "🏆 Word Master!", th: "🏆 ปรมาจารย์พระวจนะ!" },
  "r.grade70":  { ko: "😊 훌륭해요!", en: "😊 Great job!", th: "😊 เยี่ยมมาก!" },
  "r.grade50":  { ko: "📖 조금 더!", en: "📖 Keep going!", th: "📖 อีกนิด!" },
  "r.grade0":   { ko: "🌱 다시 도전!", en: "🌱 Try again!", th: "🌱 สู้ใหม่!" },
  "r.accuracy": { ko: "정답률 {n}%", en: "{n}% correct", th: "ถูก {n}%" },
  "r.points":   { ko: "⭐ {n}점 획득", en: "⭐ {n} points earned", th: "⭐ ได้ {n} แต้ม" },
  "r.saving":   { ko: "점수 저장 중...", en: "Saving score...", th: "กำลังบันทึกคะแนน..." },
  "r.saved":    { ko: "✅ 점수가 저장되었어요", en: "✅ Score saved", th: "✅ บันทึกคะแนนแล้ว" },
  "r.saveFail": { ko: "점수 저장 실패", en: "Save failed", th: "บันทึกล้มเหลว" },
  "r.saveRetry":{ ko: "다시 저장", en: "Retry", th: "ลองอีกครั้ง" },
  "r.loginSave":{ ko: "하면 점수가 저장되고 랭킹에 올라가요", en: " to save your score and join the ranking", th: " เพื่อบันทึกคะแนนและขึ้นอันดับ" },
  "r.imgSave":  { ko: "🖼️ 이미지 저장", en: "🖼️ Save image", th: "🖼️ บันทึกรูป" },
  "r.share":    { ko: "💬 공유하기", en: "💬 Share", th: "💬 แชร์" },
  "r.wrongNote":{ ko: "📝 오답노트", en: "📝 Wrong-answer notes", th: "📝 สมุดข้อผิด" },
  "r.perfect":  { ko: "🎉 만점! 틀린 문제가 없어요", en: "🎉 Perfect! No wrong answers", th: "🎉 เต็ม! ไม่มีข้อผิด" },
  "r.answerLine": { ko: "정답: {a}", en: "Answer: {a}", th: "คำตอบ: {a}" },
  "r.more":     { ko: "외 {n}개 더 틀렸어요 — 다시 풀며 복습해 보세요!", en: "{n} more wrong — review by retrying!", th: "ผิดอีก {n} ข้อ — ทบทวนด้วยการลองใหม่!" },
  "r.ranking":  { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ" },
  "r.myNotes":  { ko: "📒 내 오답노트", en: "📒 My notes", th: "📒 สมุดของฉัน" },
  "r.home":     { ko: "홈으로", en: "Home", th: "หน้าแรก" },
  "r.again":    { ko: "다시 도전 →", en: "Play again →", th: "เล่นอีก →" },

  // 랭킹
  "rk.title":   { ko: "🏆 랭킹", en: "🏆 Ranking", th: "🏆 อันดับ" },
  "rk.weekly":  { ko: "🔥 주간", en: "🔥 Weekly", th: "🔥 รายสัปดาห์" },
  "rk.all":     { ko: "🏆 전체", en: "🏆 All-time", th: "🏆 ทั้งหมด" },
  "rk.descWeekly": { ko: "최근 7일 동안 모은 점수예요. (전체 기록은 사라지지 않아요)", en: "Points from the last 7 days. (All-time record stays.)", th: "คะแนนใน 7 วันล่าสุด (สถิติรวมไม่หาย)" },
  "rk.descAll": { ko: "지금까지 모은 누적 점수예요 — 사라지지 않고 계속 쌓입니다 ⭐", en: "Your all-time points — they keep adding up ⭐", th: "คะแนนสะสมทั้งหมด — สะสมต่อเนื่อง ⭐" },
  "rk.loginRank": { ko: "하면 내 순위가 표시돼요", en: " to see your rank", th: " เพื่อดูอันดับของคุณ" },
  "rk.fail":    { ko: "랭킹을 불러오지 못했어요.", en: "Couldn't load the ranking.", th: "โหลดอันดับไม่สำเร็จ" },
  "rk.empty":   { ko: "아직 기록이 없어요. 첫 주인공이 되어보세요!", en: "No records yet. Be the first!", th: "ยังไม่มีสถิติ มาเป็นคนแรกสิ!" },
  "rk.rankUnit":{ ko: "{n}위", en: "#{n}", th: "อันดับ {n}" },
  "rk.plays":   { ko: "{n}판", en: "{n} plays", th: "{n} ครั้ง" },

  // 오답노트(history)
  "h.title":    { ko: "📒 내 오답노트", en: "📒 My Wrong-Answer Notes", th: "📒 สมุดข้อผิดของฉัน" },
  "h.total":    { ko: "총 {n}개 틀렸어요", en: "{n} wrong answers", th: "ผิดทั้งหมด {n} ข้อ" },
  "h.topBooks": { ko: "자주 틀리는 권: {b} — 여길 더 읽어보세요!", en: "Most missed: {b} — read these more!", th: "ผิดบ่อย: {b} — อ่านเพิ่ม!" },
  "h.retry":    { ko: "🔁 틀린 문제 다시 풀기", en: "🔁 Retry wrong questions", th: "🔁 ทำข้อที่ผิดอีกครั้ง" },
  "h.fail":     { ko: "불러오지 못했어요.", en: "Couldn't load.", th: "โหลดไม่สำเร็จ" },
  "h.emptyT":   { ko: "아직 틀린 문제가 없어요", en: "No wrong answers yet", th: "ยังไม่มีข้อผิด" },
  "h.emptyS":   { ko: "퀴즈를 풀면 틀린 문제가 여기 모여요.", en: "Wrong answers will appear here.", th: "ข้อที่ผิดจะมาอยู่ที่นี่" },
  "h.retryNone":{ ko: "다시 풀 문제를 찾지 못했어요.", en: "No questions to retry.", th: "ไม่พบข้อให้ทำใหม่" },
  "h.retryFail":{ ko: "다시 풀 문제를 불러오지 못했어요.", en: "Couldn't load questions to retry.", th: "โหลดข้อสำหรับทำใหม่ไม่สำเร็จ" },

  // 과정(course)
  "co.done":    { ko: "{a} / {b} 수료", en: "{a} / {b} done", th: "เสร็จ {a} / {b}" },
  "co.courseTitle": { ko: "{t} 과정", en: "{t} Course", th: "หลักสูตร {t}" },
  "co.allDone": { ko: "🎉 {t} 과정 수료!", en: "🎉 {t} course complete!", th: "🎉 จบหลักสูตร {t}!" },
  "co.allDoneSub": { ko: "모든 과를 마쳤어요. 정말 잘하셨습니다!", en: "You finished every lesson. Well done!", th: "คุณเรียนครบทุกบทแล้ว เยี่ยมมาก!" },
  "co.notFound":{ ko: "과정을 찾을 수 없어요.", en: "Course not found.", th: "ไม่พบหลักสูตร" },
  "co.lessonNotFound": { ko: "과를 찾을 수 없어요.", en: "Lesson not found.", th: "ไม่พบบทเรียน" },
  "co.done2":   { ko: "수료 완료", en: "Completed", th: "เสร็จแล้ว" },
  "co.learnQuiz": { ko: "배우고 문제 풀기", en: "Learn & quiz", th: "เรียนและทำควิซ" },
  "co.disclaimer": { ko: "※ 예장 합동(웨스트민스터 표준문서) 기준 v1 초안입니다. 사용 전 검토해 주세요.", en: "※ Draft v1 (Westminster standards). Please review before use.", th: "※ ฉบับร่าง v1 (มาตรฐานเวสต์มินสเตอร์) โปรดตรวจก่อนใช้" },
  "co.startQuiz": { ko: "문제 풀기 →", en: "Start quiz →", th: "เริ่มควิซ →" },
  "co.finishLesson": { ko: "이 과 마치기 →", en: "Finish lesson →", th: "จบบทนี้ →" },
  "co.lessonDone": { ko: "수료!", en: "Completed!", th: "เสร็จแล้ว!" },
  "co.scoreLine": { ko: "{total}문제 중 {n}문제 정답", en: "{n} of {total} correct", th: "ถูก {n} จาก {total} ข้อ" },
  "co.nextLesson": { ko: "다음 과로 →", en: "Next lesson →", th: "บทถัดไป →" },
  "co.lastLesson": { ko: "🏅 {t} 과정의 마지막 과예요!", en: "🏅 Last lesson of {t}!", th: "🏅 บทสุดท้ายของ {t}!" },
  "co.toList":  { ko: "과정 목록으로", en: "Back to lessons", th: "กลับไปรายการบท" },

  // 소교리문답
  "cat.title":  { ko: "웨스트민스터 소교리문답", en: "Westminster Shorter Catechism", th: "คำสอนสั้นเวสต์มินสเตอร์" },
  "cat.sub":    { ko: "전체 107문답 · 예장 합동 표준", en: "All 107 Q&A · Westminster standard", th: "ทั้งหมด 107 ข้อ · มาตรฐานเวสต์มินสเตอร์" },
  "cat.memProg":{ ko: "외운 문답", en: "Memorized", th: "ท่องได้แล้ว" },
  "cat.all":    { ko: "전체", en: "All", th: "ทั้งหมด" },
  "cat.god":    { ko: "하나님", en: "God", th: "พระเจ้า" },
  "cat.salv":   { ko: "구원", en: "Salvation", th: "ความรอด" },
  "cat.law":    { ko: "십계명", en: "Commandments", th: "บัญญัติ" },
  "cat.prayer": { ko: "기도", en: "Prayer", th: "การอธิษฐาน" },
  "cat.readMode": { ko: "📖 전체 보기", en: "📖 Read all", th: "📖 อ่านทั้งหมด" },
  "cat.memMode":{ ko: "🧠 외우기(답 가림)", en: "🧠 Memorize (hide)", th: "🧠 ท่องจำ (ซ่อน)" },
  "cat.qno":    { ko: "제{n}문", en: "Q{n}", th: "ข้อ {n}" },
  "cat.tapAns": { ko: "👆 눌러서 답 보기", en: "👆 Tap to reveal answer", th: "👆 แตะเพื่อดูคำตอบ" },
  "cat.memOn":  { ko: "✓ 외움", en: "✓ Memorized", th: "✓ ท่องได้" },
  "cat.memOff": { ko: "외움 표시", en: "Mark memorized", th: "ทำเครื่องหมาย" },
  "cat.quizBtn":{ ko: "🎯 퀴즈", en: "🎯 Quiz", th: "🎯 ควิซ" },
  "cat.quizDone": { ko: "소교리문답 퀴즈 정답률 {n}%", en: "Catechism quiz: {n}% correct", th: "ควิซคำสอน: ถูก {n}%" },
  "cat.toCat":  { ko: "문답으로 돌아가기", en: "Back to catechism", th: "กลับไปคำสอน" },
  "cat.exit":   { ko: "✕ 나가기", en: "✕ Exit", th: "✕ ออก" },

  // 현황판
  "ad.title":   { ko: "🔧 현황판", en: "🔧 Dashboard", th: "🔧 แดชบอร์ด" },
  "ad.desc":    { ko: "성도별 양육 과정 수료 진도와 퀴즈 참여 현황이에요.", en: "Each member's course progress and quiz activity.", th: "ความคืบหน้าหลักสูตรและควิซของสมาชิกแต่ละคน" },
  "ad.denied":  { ko: "관리자 전용 페이지예요", en: "Admins only", th: "เฉพาะผู้ดูแล" },
  "ad.deniedSub": { ko: "목사님(관리자)만 볼 수 있습니다.", en: "Only the pastor (admin) can view this.", th: "เฉพาะศิษยาภิบาล(ผู้ดูแล)เท่านั้น" },
  "ad.total":   { ko: "총 {n}명", en: "{n} members", th: "{n} คน" },
  "ad.empty":   { ko: "아직 등록된 성도가 없어요.", en: "No members yet.", th: "ยังไม่มีสมาชิก" },
  "ad.quizStat":{ ko: "퀴즈 {p}판 · ⭐{pt}", en: "{p} plays · ⭐{pt}", th: "{p} ครั้ง · ⭐{pt}" },

  // 절차 안내
  "g.title":    { ko: "교인 절차 안내", en: "Membership Steps", th: "ขั้นตอนการเป็นสมาชิก" },
  "g.sub":      { ko: "등록 → 학습 → 세례 / 입교 (예장 합동 기준)", en: "Register → Catechumen → Baptism / Confirmation", th: "ลงทะเบียน → ผู้เรียน → บัพติศมา / สมาชิก" },
  "g.step1t":   { ko: "등록교인 (새신자)", en: "Registered (New Believer)", th: "ผู้ลงทะเบียน (ผู้เชื่อใหม่)" },
  "g.step1d":   { ko: "교회에 처음 등록하고 예배에 참여하는 단계입니다. 새신자 과정으로 신앙의 기초를 배웁니다.", en: "You register at the church and join worship. The New Believer course teaches the basics of faith.", th: "ลงทะเบียนกับคริสตจักรและร่วมนมัสการ หลักสูตรผู้เชื่อใหม่สอนพื้นฐานความเชื่อ" },
  "g.step2t":   { ko: "학습교인 (학습)", en: "Catechumen", th: "ผู้เรียนคำสอน" },
  "g.step2d":   { ko: "일정 기간 출석한 뒤, 학습 문답을 통해 신앙을 점검받고 '학습'을 받습니다. 세례를 준비하는 단계입니다.", en: "After attending for a time, your faith is examined through catechism and you become a catechumen — preparing for baptism.", th: "หลังเข้าร่วมระยะหนึ่ง ความเชื่อจะถูกตรวจสอบผ่านคำสอน เพื่อเตรียมรับบัพติศมา" },
  "g.step3t":   { ko: "세례교인 (세례)", en: "Baptized Member", th: "สมาชิกที่รับบัพติศมา" },
  "g.step3d":   { ko: "신앙을 고백하고 세례 문답을 거쳐 세례를 받습니다. 이제 성찬에 참여하는 정식 교인(정회원)이 됩니다.", en: "You confess your faith, pass the baptism examination, and are baptized — becoming a full member who partakes in Communion.", th: "สารภาพความเชื่อ ผ่านการสอบบัพติศมา และรับบัพติศมา เป็นสมาชิกเต็มที่ร่วมพิธีมหาสนิท" },
  "g.step4t":   { ko: "입교 (유아세례자)", en: "Confirmation (Infant-baptized)", th: "การเป็นสมาชิกสมบูรณ์ (ผู้รับบัพติศมาทารก)" },
  "g.step4d":   { ko: "어려서 유아세례를 받은 '언약의 자녀'는, 자라서 스스로 신앙을 고백함으로 입교하여 세례교인이 됩니다.", en: "A 'covenant child' baptized as an infant grows up to confess faith personally and is confirmed as a full member.", th: "'บุตรแห่งพันธสัญญา' ที่รับบัพติศมาตั้งแต่ทารก เมื่อโตขึ้นสารภาพความเชื่อด้วยตนเองและเป็นสมาชิกสมบูรณ์" },
  "g.callout":  { ko: "✔ 세례·입교교인은 성찬에 참여하고 공동의회 등 교회의 권리와 의무를 함께 집니다.\n✔ 세부 기간·문답·자격은 교회(당회)마다 차이가 있을 수 있으니 섬기는 교회의 안내를 따르세요.", en: "✔ Baptized/confirmed members partake in Communion and share the church's rights and duties.\n✔ Exact periods, catechism, and requirements vary by church — follow your church's guidance.", th: "✔ สมาชิกที่รับบัพติศมา/เป็นสมาชิกสมบูรณ์ร่วมพิธีมหาสนิทและมีสิทธิหน้าที่ในคริสตจักร\n✔ ระยะเวลา คำสอน และคุณสมบัติอาจต่างกันในแต่ละคริสตจักร โปรดทำตามคำแนะนำของคริสตจักรคุณ" },
  "g.footer":   { ko: "※ 예장 합동 일반 절차 안내(v1). 교회 당회의 지침이 우선합니다.", en: "※ General steps (v1, Westminster tradition). Your church session's guidance takes precedence.", th: "※ ขั้นตอนทั่วไป (v1) คำแนะนำของคริสตจักรมีความสำคัญก่อน" },
  "g.btnNew":   { ko: "🌱 새신자", en: "🌱 New", th: "🌱 ใหม่" },
  "g.btnBap":   { ko: "💧 세례", en: "💧 Baptism", th: "💧 บัพติศมา" },
  "g.btnConf":  { ko: "✝️ 입교", en: "✝️ Confirm", th: "✝️ สมาชิก" },

  // 퀴즈 설정(play)
  "pl.title":     { ko: "📖 성경 퀴즈", en: "📖 Bible Quiz", th: "📖 ควิซพระคัมภีร์" },
  "pl.all":       { ko: "전체", en: "All", th: "ทั้งหมด" },
  "pl.old":       { ko: "구약", en: "Old Testament", th: "พันธสัญญาเดิม" },
  "pl.new":       { ko: "신약", en: "New Testament", th: "พันธสัญญาใหม่" },
  "pl.testament": { ko: "성경 구분", en: "Testament", th: "ภาคพระคัมภีร์" },
  "pl.level":     { ko: "난이도", en: "Difficulty", th: "ระดับ" },
  "pl.count":     { ko: "문제 수", en: "Questions", th: "จำนวนข้อ" },
  "pl.countN":    { ko: "{n}문제", en: "{n} Q", th: "{n} ข้อ" },
  "pl.books":     { ko: "성경 권 (선택)", en: "Books (optional)", th: "หนังสือ (เลือกได้)" },
  "pl.allBooks":  { ko: "전체 권에서 출제", en: "From all books", th: "จากทุกเล่ม" },
  "pl.booksSel":  { ko: "{n}권 선택됨", en: "{n} selected", th: "เลือก {n} เล่ม" },
  "pl.close":     { ko: "▲ 닫기", en: "▲ Close", th: "▲ ปิด" },
  "pl.openPick":  { ko: "▼ 골라보기", en: "▼ Pick", th: "▼ เลือก" },
  "pl.selectAll": { ko: "전체 선택", en: "Select all", th: "เลือกทั้งหมด" },
  "pl.clear":     { ko: "선택 해제", en: "Clear", th: "ล้าง" },
  "pl.start":     { ko: "퀴즈 시작 →", en: "Start quiz →", th: "เริ่มควิซ →" },
};

interface I18n { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string; }
const I18nCtx = createContext<I18n>({ lang: "ko", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");
  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("dabar_lang")) as Lang | null;
    if (saved === "ko" || saved === "en" || saved === "th") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("dabar_lang", l); } catch { /* ignore */ } };
  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = DICT[key]?.[lang] ?? DICT[key]?.ko ?? key;
    if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
    return s;
  };
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);

// 🌐 언어 선택 토글
export function LangSelector() {
  const { lang, setLang } = useI18n();
  return (
    <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 16, padding: 3 }}>
      {LANGS.map(l => {
        const on = lang === l.code;
        return (
          <button key={l.code} onClick={() => setLang(l.code)}
            style={{ fontSize: 12, fontWeight: on ? 800 : 600, padding: "4px 9px", borderRadius: 13, border: "none", cursor: "pointer", background: on ? "#9ed62b" : "transparent", color: on ? "#08263a" : "#d4ecfb" }}>
            {l.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
