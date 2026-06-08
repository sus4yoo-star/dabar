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
            style={{ fontSize: 12, fontWeight: on ? 800 : 600, padding: "4px 9px", borderRadius: 13, border: "none", cursor: "pointer", background: on ? "#d8be6e" : "transparent", color: on ? "#241246" : "#cfc2ef" }}>
            {l.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
