// 성경 권 이름 · 분류의 "표시용" 다국어 매핑.
// DB/필터 값은 한국어(개역개정) 그대로 두고, 화면에 보일 때만 언어별로 변환한다.
// 라오스어(lo)는 라오스어 표준 성경 2015 표기 기준.

type Tri = { en: string; th: string; lo: string };

export const BOOK_I18N: Record<string, Tri> = {
  // ── 구약 ──
  "창세기":   { en: "Genesis", th: "ปฐมกาล", lo: "ປະຖົມມະການ" },
  "출애굽기": { en: "Exodus", th: "อพยพ", lo: "ອົບພະຍົບ" },
  "레위기":   { en: "Leviticus", th: "เลวีนิติ", lo: "ລະບຽບພວກເລວີ" },
  "민수기":   { en: "Numbers", th: "กันดารวิถี", lo: "ຈົດເຊັນບັນຊີ" },
  "신명기":   { en: "Deuteronomy", th: "เฉลยธรรมบัญญัติ", lo: "ພຣະບັນຍັດສອງ" },
  "여호수아": { en: "Joshua", th: "โยชูวา", lo: "ໂຢຊວຍ" },
  "사사기":   { en: "Judges", th: "ผู้วินิจฉัย", lo: "ພວກຜູ້ປົກຄອງ" },
  "룻기":     { en: "Ruth", th: "นางรูธ", lo: "ນາງຣຸດ" },
  "사무엘상": { en: "1 Samuel", th: "1 ซามูเอล", lo: "1 ຊາມູເອນ" },
  "사무엘하": { en: "2 Samuel", th: "2 ซามูเอล", lo: "2 ຊາມູເອນ" },
  "열왕기상": { en: "1 Kings", th: "1 พงศ์กษัตริย์", lo: "1 ກະສັດ" },
  "열왕기하": { en: "2 Kings", th: "2 พงศ์กษัตริย์", lo: "2 ກະສັດ" },
  "역대상":   { en: "1 Chronicles", th: "1 พงศาวดาร", lo: "1 ຂ່າວຄາວ" },
  "역대하":   { en: "2 Chronicles", th: "2 พงศาวดาร", lo: "2 ຂ່າວຄາວ" },
  "에스라":   { en: "Ezra", th: "เอสรา", lo: "ເອັດຊະຣາ" },
  "느헤미야": { en: "Nehemiah", th: "เนหะมีย์", lo: "ເນເຮມີຢາ" },
  "에스더":   { en: "Esther", th: "เอสเธอร์", lo: "ເອສະເທີ" },
  "욥기":     { en: "Job", th: "โยบ", lo: "ໂຢບ" },
  "시편":     { en: "Psalms", th: "สดุดี", lo: "ເພງສັນລະເສີນ" },
  "잠언":     { en: "Proverbs", th: "สุภาษิต", lo: "ສຸພາສິດ" },
  "전도서":   { en: "Ecclesiastes", th: "ปัญญาจารย์", lo: "ປັນຍາຈານ" },
  "아가":     { en: "Song of Songs", th: "เพลงซาโลมอน", lo: "ຍອດເພງ" },
  "이사야":   { en: "Isaiah", th: "อิสยาห์", lo: "ເອຊາຢາ" },
  "예레미야": { en: "Jeremiah", th: "เยเรมีย์", lo: "ເຢເຣມີຢາ" },
  "예레미야애가": { en: "Lamentations", th: "เพลงคร่ำครวญ", lo: "ເພງຄ່ຳຄວນ" },
  "에스겔":   { en: "Ezekiel", th: "เอเสเคียล", lo: "ເອເຊກີເອນ" },
  "다니엘":   { en: "Daniel", th: "ดาเนียล", lo: "ດານີເອນ" },
  "호세아":   { en: "Hosea", th: "โฮเชยา", lo: "ໂຮເຊອາ" },
  "요엘":     { en: "Joel", th: "โยเอล", lo: "ໂຢເອນ" },
  "아모스":   { en: "Amos", th: "อาโมส", lo: "ອາໂມດ" },
  "오바댜":   { en: "Obadiah", th: "โอบาดีห์", lo: "ໂອບາດີຢາ" },
  "요나":     { en: "Jonah", th: "โยนาห์", lo: "ໂຢນາ" },
  "미가":     { en: "Micah", th: "มีคาห์", lo: "ມີກາ" },
  "나훔":     { en: "Nahum", th: "นาฮูม", lo: "ນາຮູມ" },
  "하박국":   { en: "Habakkuk", th: "ฮาบากุก", lo: "ຮາບາກຸກ" },
  "스바냐":   { en: "Zephaniah", th: "เศฟันยาห์", lo: "ເຊຟານີຢາ" },
  "학개":     { en: "Haggai", th: "ฮักกัย", lo: "ຮັກກາຍ" },
  "스가랴":   { en: "Zechariah", th: "เศคาริยาห์", lo: "ເຊຄາຣີຢາ" },
  "말라기":   { en: "Malachi", th: "มาลาคี", lo: "ມາລາກີ" },
  // ── 신약 ──
  "마태복음": { en: "Matthew", th: "มัทธิว", lo: "ມັດທາຍ" },
  "마가복음": { en: "Mark", th: "มาระโก", lo: "ມາຣະໂກ" },
  "누가복음": { en: "Luke", th: "ลูกา", lo: "ລູກາ" },
  "요한복음": { en: "John", th: "ยอห์น", lo: "ໂຢຮັນ" },
  "사도행전": { en: "Acts", th: "กิจการ", lo: "ກິດຈະການ" },
  "로마서":   { en: "Romans", th: "โรม", lo: "ໂຣມ" },
  "고린도전서": { en: "1 Corinthians", th: "1 โครินธ์", lo: "1 ໂກຣິນໂທ" },
  "고린도후서": { en: "2 Corinthians", th: "2 โครินธ์", lo: "2 ໂກຣິນໂທ" },
  "갈라디아서": { en: "Galatians", th: "กาลาเทีย", lo: "ຄາລາເຕຍ" },
  "에베소서": { en: "Ephesians", th: "เอเฟซัส", lo: "ເອເຟໂຊ" },
  "빌립보서": { en: "Philippians", th: "ฟีลิปปี", lo: "ຟີລິບປອຍ" },
  "골로새서": { en: "Colossians", th: "โคโลสี", lo: "ໂກໂລຊາຍ" },
  "데살로니가전서": { en: "1 Thessalonians", th: "1 เธสะโลนิกา", lo: "1 ເທຊະໂລນິກ" },
  "데살로니가후서": { en: "2 Thessalonians", th: "2 เธสะโลนิกา", lo: "2 ເທຊະໂລນິກ" },
  "디모데전서": { en: "1 Timothy", th: "1 ทิโมธี", lo: "1 ຕີໂມທຽວ" },
  "디모데후서": { en: "2 Timothy", th: "2 ทิโมธี", lo: "2 ຕີໂມທຽວ" },
  "디도서":   { en: "Titus", th: "ทิตัส", lo: "ຕີໂຕ" },
  "빌레몬서": { en: "Philemon", th: "ฟีเลโมน", lo: "ຟີເລໂມນ" },
  "히브리서": { en: "Hebrews", th: "ฮีบรู", lo: "ເຮັບເຣີ" },
  "야고보서": { en: "James", th: "ยากอบ", lo: "ຢາໂກໂບ" },
  "베드로전서": { en: "1 Peter", th: "1 เปโตร", lo: "1 ເປໂຕ" },
  "베드로후서": { en: "2 Peter", th: "2 เปโตร", lo: "2 ເປໂຕ" },
  "요한일서": { en: "1 John", th: "1 ยอห์น", lo: "1 ໂຢຮັນ" },
  "요한이서": { en: "2 John", th: "2 ยอห์น", lo: "2 ໂຢຮັນ" },
  "요한삼서": { en: "3 John", th: "3 ยอห์น", lo: "3 ໂຢຮັນ" },
  "유다서":   { en: "Jude", th: "ยูดา", lo: "ຢູດາ" },
  "요한계시록": { en: "Revelation", th: "วิวรณ์", lo: "ພຣະນິມິດ" },
};

// 문제 분류 (인물/사건/말씀/지명)
export const CATEGORY_I18N: Record<string, Tri> = {
  "인물": { en: "Person", th: "บุคคล", lo: "ບຸກຄົນ" },
  "사건": { en: "Event", th: "เหตุการณ์", lo: "ເຫດການ" },
  "말씀": { en: "Teaching", th: "พระวจนะ", lo: "ພຣະທຳ" },
  "지명": { en: "Place", th: "สถานที่", lo: "ສະຖານທີ່" },
};

const STATIC = (lang: string): keyof Tri | null =>
  lang === "en" ? "en" : lang === "th" ? "th" : lang === "lo" ? "lo" : null;

// 표시용 권 이름 (한국어 키 → 현재 언어). 매핑 없으면 원문 유지.
export function bookLabel(koBook: string, lang: string): string {
  const k = STATIC(lang);
  return (k && BOOK_I18N[koBook]?.[k]) || koBook;
}

// 표시용 분류 이름
export function categoryLabel(koCat: string, lang: string): string {
  const k = STATIC(lang);
  return (k && CATEGORY_I18N[koCat]?.[k]) || koCat;
}
