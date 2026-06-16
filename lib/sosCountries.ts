// 🆘 국가별 긴급 연락처 — 선교 현장이 태국 밖으로 넓어져도 "맞는 번호"로 걸도록.
// 번호는 웹 교차검증(영국 gov.uk·호주 Smartraveller·위키피디아·각국 공식 .go.th/.gov.kh 등) 기반.
// 확신이 낮은 번호는 "잘못된 응급번호" 위험이 커서 일부러 넣지 않았다(예: 미얀마 구급/소방).
// 어느 나라든 한국 외교부 영사콜센터(24h)는 항상 함께 노출한다.

export type HotKind = "tourist" | "police" | "medical" | "fire" | "unified" | "embassy" | "consular";

export type Hotline = { kind: HotKind; num: string; emoji: string };

export type Country = {
  code: string;       // ISO 2글자
  flag: string;       // 국기 이모지
  nameKey: string;    // i18n 키 (국가명)
  lang: string;       // 현지인에게 보여줄 번역 대상 언어 (Google 번역 코드)
  lines: Hotline[];   // 그 나라의 긴급번호 (consular 는 자동 추가하므로 제외)
};

// 한국 외교부 영사콜센터 (24시간, 해외에서 국제전화로 연결) — 모든 나라 공통.
export const CONSULAR: Hotline = { kind: "consular", num: "+82233210404", emoji: "☎️" };

export const COUNTRIES: Country[] = [
  {
    code: "TH", flag: "🇹🇭", nameKey: "sos.c.TH", lang: "th",
    lines: [
      { kind: "tourist", num: "1155", emoji: "👮" },
      { kind: "police",  num: "191",  emoji: "🚓" },
      { kind: "medical", num: "1669", emoji: "🚑" },
      { kind: "fire",    num: "199",  emoji: "🚒" },
      { kind: "embassy", num: "+66819145803", emoji: "🇰🇷" }, // 주태국 한국대사관 긴급(검증 HIGH)
    ],
  },
  {
    code: "LA", flag: "🇱🇦", nameKey: "sos.c.LA", lang: "lo",
    lines: [
      { kind: "police",  num: "1191", emoji: "🚓" }, // UK·호주 정부 기준 4자리
      { kind: "medical", num: "1195", emoji: "🚑" },
      { kind: "fire",    num: "1190", emoji: "🚒" },
    ],
  },
  {
    code: "KH", flag: "🇰🇭", nameKey: "sos.c.KH", lang: "km",
    lines: [
      { kind: "police",  num: "117", emoji: "🚓" },
      { kind: "medical", num: "119", emoji: "🚑" },
      { kind: "fire",    num: "118", emoji: "🚒" },
    ],
  },
  {
    code: "VN", flag: "🇻🇳", nameKey: "sos.c.VN", lang: "vi",
    lines: [
      { kind: "police",  num: "113", emoji: "🚓" },
      { kind: "fire",    num: "114", emoji: "🚒" },
      { kind: "medical", num: "115", emoji: "🚑" },
    ],
  },
  {
    code: "MM", flag: "🇲🇲", nameKey: "sos.c.MM", lang: "my",
    // 미얀마는 구급/소방 번호 출처가 엇갈려(LOW) 잘못 걸 위험 → 경찰만, 나머지는 영사콜센터로.
    lines: [
      { kind: "police",  num: "199", emoji: "🚓" },
    ],
  },
  {
    code: "KR", flag: "🇰🇷", nameKey: "sos.c.KR", lang: "ko",
    lines: [
      { kind: "police",  num: "112", emoji: "🚓" },
      { kind: "medical", num: "119", emoji: "🚑" }, // 119 = 구급·소방 공용
    ],
  },
  {
    code: "PH", flag: "🇵🇭", nameKey: "sos.c.PH", lang: "tl",
    lines: [
      { kind: "unified", num: "911", emoji: "🆘" }, // 통합 긴급번호
    ],
  },
  {
    code: "ID", flag: "🇮🇩", nameKey: "sos.c.ID", lang: "id",
    lines: [
      { kind: "unified", num: "112", emoji: "🆘" },
      { kind: "police",  num: "110", emoji: "🚓" },
      { kind: "medical", num: "119", emoji: "🚑" },
      { kind: "fire",    num: "113", emoji: "🚒" },
    ],
  },
  {
    code: "MY", flag: "🇲🇾", nameKey: "sos.c.MY", lang: "ms",
    lines: [
      { kind: "unified", num: "999", emoji: "🆘" },
    ],
  },
  {
    // 그 외 지역 — GSM 휴대폰 통용 번호 112 + 영사콜센터. 현지어는 영어로.
    code: "XX", flag: "🌐", nameKey: "sos.c.XX", lang: "en",
    lines: [
      { kind: "unified", num: "112", emoji: "🆘" },
    ],
  },
];

const TZ_MAP: Record<string, string> = {
  "Asia/Bangkok": "TH",
  "Asia/Vientiane": "LA",
  "Asia/Phnom_Penh": "KH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Saigon": "VN",
  "Asia/Yangon": "MM", "Asia/Rangoon": "MM",
  "Asia/Seoul": "KR",
  "Asia/Manila": "PH",
  "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID", "Asia/Pontianak": "ID",
  "Asia/Kuala_Lumpur": "MY", "Asia/Kuching": "MY",
};

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1];
}

// 타임존으로 현재 국가를 추측 (오프라인에서도 동작 — 네트워크/위치권한 불필요).
export function detectCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_MAP[tz]) return TZ_MAP[tz];
  } catch { /* */ }
  return "TH"; // 주 사역지 기본값
}

// consular(영사콜센터)를 포함한 최종 표시용 핫라인 목록.
export function hotlinesFor(code: string): Hotline[] {
  return [...getCountry(code).lines, CONSULAR];
}
