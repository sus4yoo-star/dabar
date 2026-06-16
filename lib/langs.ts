// 🌐 지원 언어 — 단일 출처(single source of truth).
//  - lib/i18n.tsx (메인 앱)와 lib/besora/i18n.ts (전도 도구)가 모두 여기서 파생한다.
//    → 언어를 추가/제거할 때 한 곳만 고치면 두 시스템이 항상 일치한다(분기 버그 방지).
//  - 순수 데이터 모듈(무거운 의존성 없음)이라 어느 번들에 들어가도 비용이 거의 없다.
export type LangBase = { code: string; native: string; en: string; rtl: boolean };

export const LANGS_BASE: readonly LangBase[] = [
  { code: "ko", native: "한국어", en: "Korean", rtl: false },
  { code: "en", native: "English", en: "English", rtl: false },
  { code: "th", native: "ไทย", en: "Thai", rtl: false },
  { code: "lo", native: "ລາວ", en: "Lao", rtl: false },
  { code: "es", native: "Español", en: "Spanish", rtl: false },
  { code: "pt", native: "Português", en: "Portuguese", rtl: false },
  { code: "zh", native: "中文", en: "Chinese", rtl: false },
  { code: "hi", native: "हिन्दी", en: "Hindi", rtl: false },
  { code: "ar", native: "العربية", en: "Arabic", rtl: true },
  { code: "fa", native: "فارسی", en: "Persian", rtl: true },
  { code: "my", native: "မြန်မာ", en: "Burmese", rtl: false },
  { code: "ms", native: "Bahasa Melayu", en: "Malay", rtl: false },
  { code: "vi", native: "Tiếng Việt", en: "Vietnamese", rtl: false },
  { code: "id", native: "Bahasa Indonesia", en: "Indonesian", rtl: false },
  { code: "bn", native: "বাংলা", en: "Bengali", rtl: false },
  { code: "ja", native: "日本語", en: "Japanese", rtl: false },
  { code: "ur", native: "اردو", en: "Urdu", rtl: true },
  { code: "fr", native: "Français", en: "French", rtl: false },
  { code: "ru", native: "Русский", en: "Russian", rtl: false },
  { code: "sw", native: "Kiswahili", en: "Swahili", rtl: false },
];

// 코드 union 타입 — 두 i18n 시스템이 공유.
export type LangCode = (typeof LANGS_BASE)[number]["code"];
