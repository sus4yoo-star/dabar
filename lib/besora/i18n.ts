// 앱 UI(버튼/안내) 다국어. 전도 콘텐츠는 DB에 있고, 여기는 화면 골격용.

// 현재 콘텐츠·이름이 준비된 언어 (선택지에 이 언어들만 노출).
export const SUPPORTED_LANGS = ["ko", "en", "th"];

// 선택지에 항상 뜨도록 언어 메타를 내장 (besora DB 'languages' 테이블이 없어도 동작).
// DB에 같은 code 가 있으면 그 값으로 덮어씀.
export const LANG_META: Record<string, { code: string; name_native: string; name_en: string; rtl: boolean; enabled: boolean; sort: number }> = {
  ko: { code: "ko", name_native: "한국어", name_en: "Korean", rtl: false, enabled: true, sort: 1 },
  en: { code: "en", name_native: "English", name_en: "English", rtl: false, enabled: true, sort: 2 },
  th: { code: "th", name_native: "ไทย", name_en: "Thai", rtl: false, enabled: true, sort: 3 },
};

export const UI = {
  ko: {
    appName: "복음 전하기",
    tagline: "온 인류를 향한 기쁜 소식",
    start: "전도 시작",
    chooseTool: "도구 선택",
    myLanguage: "내 언어",
    seekerLanguage: "상대의 언어",
    setMyLanguage: "내 언어를 골라주세요",
    setSeekerLanguage: "상대가 읽을 언어를 골라주세요",
    next: "다음",
    prev: "이전",
    toDecision: "결단으로",
    listen: "들려주기",
    follow: "따라읽기",
    pray: "함께 기도하기",
    amen: "기도를 마쳤어요",
    again: "다시 전도하기",
    notNow: "조금 더 생각해볼게요",
    yes: "네, 영접할게요",
    myRecords: "나의 전도 기록",
    offlineReady: "오프라인 준비됨",
    home: "홈",
    growStart: "양육 시작하기",
    voice: "음성 통역",
    tapToTalk: "마이크를 탭하고 말하세요",
    listening: "듣는 중… 탭하면 멈춰요",
  },
  en: {
    appName: "Share the Gospel",
    tagline: "Good news for all humanity",
    start: "Start sharing",
    chooseTool: "Choose a tool",
    myLanguage: "My language",
    seekerLanguage: "Their language",
    setMyLanguage: "Pick your language",
    setSeekerLanguage: "Pick the language they will read",
    next: "Next",
    prev: "Back",
    toDecision: "To decision",
    listen: "Play audio",
    follow: "Read along",
    pray: "Pray together",
    amen: "Finished praying",
    again: "Share again",
    notNow: "I want to think more",
    yes: "Yes, I receive Jesus",
    myRecords: "My records",
    offlineReady: "Offline ready",
    home: "Home",
    growStart: "Start discipleship",
    voice: "Voice translate",
    tapToTalk: "Tap the mic and speak",
    listening: "Listening… tap to stop",
  },
  th: {
    appName: "ประกาศข่าวประเสริฐ",
    tagline: "ข่าวดีสำหรับมวลมนุษยชาติ",
    start: "เริ่มประกาศ",
    chooseTool: "เลือกเครื่องมือ",
    myLanguage: "ภาษาของฉัน",
    seekerLanguage: "ภาษาของผู้ฟัง",
    setMyLanguage: "เลือกภาษาของคุณ",
    setSeekerLanguage: "เลือกภาษาที่ผู้ฟังจะอ่าน",
    next: "ถัดไป",
    prev: "ย้อนกลับ",
    toDecision: "สู่การตัดสินใจ",
    listen: "ฟังเสียง",
    follow: "อ่านตาม",
    pray: "อธิษฐานด้วยกัน",
    amen: "อธิษฐานเสร็จแล้ว",
    again: "ประกาศอีกครั้ง",
    notNow: "ขอคิดดูก่อน",
    yes: "ใช่ ฉันรับพระเยซู",
    myRecords: "บันทึกของฉัน",
    offlineReady: "พร้อมใช้ออฟไลน์",
    home: "หน้าแรก",
    growStart: "เริ่มการเป็นสาวก",
    voice: "ล่ามเสียง",
    tapToTalk: "แตะไมโครโฟนแล้วพูด",
    listening: "กำลังฟัง… แตะเพื่อหยุด",
  },
} as const;

export type UILang = keyof typeof UI;
export type UIKey = keyof (typeof UI)["ko"];

export function ui(lang: string, key: UIKey): string {
  const l = (lang in UI ? lang : "ko") as UILang;
  return UI[l][key];
}

// 도구 이름 다국어 (도구는 5개 고정이라 여기서 관리). 없는 언어는 en→ko 폴백.
export const TOOL_NAMES: Record<string, Record<string, string>> = {
  wordless: {
    ko: "글없는책",
    en: "The Wordless Book",
    th: "หนังสือไร้คำ",
  },
  "four-laws": {
    ko: "사영리",
    en: "Four Spiritual Laws",
    th: "กฎทางวิญญาณสี่ประการ",
  },
  bridge: {
    ko: "다리 예화",
    en: "The Bridge to Life",
    th: "สะพานสู่ชีวิต",
  },
  "three-circles": {
    ko: "세 개의 원",
    en: "Three Circles",
    th: "สามวงกลม",
  },
  romans: {
    ko: "로마서로의 길",
    en: "The Romans Road",
    th: "ถนนสู่ความรอด (โรม)",
  },
};

export function toolName(slug: string, lang: string): string {
  const m = TOOL_NAMES[slug];
  if (!m) return slug;
  return m[lang] ?? m.en ?? m.ko ?? slug;
}
