// 🆘 SOS 오프라인 표현집 — 신호가 없어도 현지인에게 보여줄 핵심 문구를 내장.
// th/lo/en/ko 는 직접 검수, km/vi/my/id/ms/tl 은 미리 채워 오프라인에서도 보이게 한다.
// (네트워크가 있으면 런타임에 사용자 Google 키로 상황·위치를 실시간 번역해 더 다듬는다.)

// 긴급 호소 머리말 (현지어)
const HEADER: Record<string, string> = {
  en: "🆘 Emergency! Please help — I urgently need help.",
  th: "🆘 ฉุกเฉิน! ช่วยด้วย — ฉันต้องการความช่วยเหลือด่วน",
  lo: "🆘 ສຸກເສີນ! ຊ່ວຍດ້ວຍ — ຂ້ອຍຕ້ອງການຄວາມຊ່ວຍເຫຼືອດ່ວນ",
  ko: "🆘 긴급! 도와주세요 — 급히 도움이 필요합니다.",
  vi: "🆘 Khẩn cấp! Xin hãy giúp tôi — Tôi cần giúp đỡ gấp.",
  id: "🆘 Darurat! Tolong saya — Saya sangat membutuhkan bantuan.",
  ms: "🆘 Kecemasan! Tolong saya — Saya sangat memerlukan bantuan.",
  tl: "🆘 Emergency! Tulungan ninyo ako — Kailangan ko ng agarang tulong.",
  km: "🆘 អាសន្ន! សូមជួយខ្ញុំ — ខ្ញុំត្រូវការជំនួយបន្ទាន់។",
  my: "🆘 အရေးပေါ်! ကျေးဇူးပြု၍ ကူညီပါ — အရေးပေါ် အကူအညီ လိုအပ်နေသည်။",
};

// "현지 말을 못합니다. ~로 전화해 주세요" (그 나라의 경찰/구급 번호를 끼워넣음)
const HELP: Record<string, (calls: string) => string> = {
  en: (c) => `I cannot speak the local language 🙏 Please help me call ${c}.`,
  th: (c) => `ฉันพูดภาษาท้องถิ่นไม่ได้ 🙏 กรุณาช่วยโทร ${c} ให้หน่อย`,
  lo: (c) => `ຂ້ອຍເວົ້າພາສາທ້ອງຖິ່ນບໍ່ໄດ້ 🙏 ກະລຸນາຊ່ວຍໂທ ${c} ໃຫ້ແດ່`,
  ko: (c) => `현지 말을 못합니다 🙏 ${c} 로 전화해 주세요.`,
  vi: (c) => `Tôi không nói được tiếng địa phương 🙏 Xin hãy gọi giúp tôi số ${c}.`,
  id: (c) => `Saya tidak bisa berbicara bahasa setempat 🙏 Tolong bantu saya menelepon ${c}.`,
  ms: (c) => `Saya tidak boleh berbahasa tempatan 🙏 Tolong bantu saya menghubungi ${c}.`,
  tl: (c) => `Hindi ako marunong magsalita ng lokal na wika 🙏 Pakitulungan ninyo akong tumawag sa ${c}.`,
  km: (c) => `ខ្ញុំនិយាយភាសាក្នុងស្រុកមិនបាន 🙏 សូមជួយខ្ញុំទូរស័ព្ទទៅ ${c}។`,
  my: (c) => `ဒေသခံဘာသာစကား မပြောတတ်ပါ 🙏 ကျေးဇူးပြု၍ ${c} ကို ဖုန်းခေါ်ပေးပါ။`,
};

export function emergencyHeader(lang: string): string {
  return HEADER[lang] ?? HEADER.en;
}
export function helpCallLine(lang: string, calls: string[]): string {
  const c = calls.filter(Boolean).join(" / ");
  const fn = HELP[lang] ?? HELP.en;
  return fn(c);
}

// 자주 쓰는 상황 — 탭하면 즉시 채워지고, 현지어 번역도 내장(오프라인에서도 보임).
export type CommonSitu = {
  ko: string;
  en: string;
  tr: Record<string, string>; // lang -> 현지어 (없으면 온라인 번역으로 채워짐)
};

export const COMMON_SITU: CommonSitu[] = [
  // REVIEW: my (Burmese) verbs/nouns are correct, but uses the formal written pronoun
  // "ကျွန်ုပ်" throughout while HEADER/HELP omit the pronoun. A native speaker may prefer the
  // spoken "ကျွန်တော်" (m.) / "ကျွန်မ" (f.) when a person actually shows/says these. Safe as-is.
  {
    ko: "길을 잃었어요", en: "I am lost",
    tr: { th: "ฉันหลงทาง", lo: "ຂ້ອຍຫຼົງທາງ", vi: "Tôi bị lạc đường", id: "Saya tersesat", ms: "Saya sesat", tl: "Naliligaw ako", km: "ខ្ញុំវង្វេងផ្លូវ", my: "ကျွန်ုပ် လမ်းပျောက်နေသည်" },
  },
  {
    ko: "몸이 아파요, 병원이 필요해요", en: "I am sick, I need a hospital",
    tr: { th: "ฉันป่วย ต้องการไปโรงพยาบาล", lo: "ຂ້ອຍເຈັບປ່ວຍ ຕ້ອງການໄປໂຮງໝໍ", vi: "Tôi bị bệnh, tôi cần đến bệnh viện", id: "Saya sakit, saya butuh rumah sakit", ms: "Saya sakit, saya perlukan hospital", tl: "May sakit ako, kailangan ko ng ospital", km: "ខ្ញុំឈឺ ខ្ញុំត្រូវការទៅមន្ទីរពេទ្យ", my: "ကျွန်ုပ် နေမကောင်းပါ ဆေးရုံ လိုအပ်သည်" },
  },
  {
    ko: "사고를 당했어요", en: "I had an accident",
    tr: { th: "ฉันประสบอุบัติเหตุ", lo: "ຂ້ອຍປະສົບອຸບັດຕິເຫດ", vi: "Tôi bị tai nạn", id: "Saya mengalami kecelakaan", ms: "Saya mengalami kemalangan", tl: "Naaksidente ako", km: "ខ្ញុំជួបគ្រោះថ្នាក់", my: "ကျွန်ုပ် မတော်တဆ ထိခိုက်မိသည်" },
  },
  {
    ko: "도둑·강도를 당했어요", en: "I was robbed",
    tr: { th: "ฉันถูกปล้น", lo: "ຂ້ອຍຖືກປຸ້ນ", vi: "Tôi bị cướp", id: "Saya dirampok", ms: "Saya dirompak", tl: "Ninakawan ako", km: "ខ្ញុំត្រូវបានគេប្លន់", my: "ကျွန်ုပ် ဓားပြတိုက်ခံရသည်" },
  },
  {
    ko: "위험해요, 도와주세요", en: "I am in danger, please help",
    tr: { th: "ฉันตกอยู่ในอันตราย ช่วยด้วย", lo: "ຂ້ອຍຕົກຢູ່ໃນອັນຕະລາຍ ຊ່ວຍແດ່", vi: "Tôi đang gặp nguy hiểm, xin hãy giúp tôi", id: "Saya dalam bahaya, tolong saya", ms: "Saya dalam bahaya, tolong saya", tl: "Nasa panganib ako, tulungan ninyo ako", km: "ខ្ញុំកំពុងមានគ្រោះថ្នាក់ សូមជួយ", my: "ကျွန်ုပ် အန္တရာယ်ထဲ ရောက်နေသည် ကူညီပါ" },
  },
];
