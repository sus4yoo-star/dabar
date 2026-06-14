// 성경 66권 구조 데이터 (개역개정 기준)
// - code: OSIS 계열 3자 코드 (verses.ts 의 복음 구절 키와 호환: GEN/ISA/MRK/JHN/ROM/REV/2CO/1PE/2PE 등)
// - abbr: 한국 교회 표준 약어(목차 배지용)  · chapters: 장 수
// - group: 목차 분류(왼쪽 그룹 라벨)        · 절 수는 본문 JSON 적재 시 데이터에서 산출
export type BookGroup =
  | "율법서" | "역사서" | "시가서" | "대선지서" | "소선지서"
  | "복음서" | "사도행전" | "바울서신" | "일반서신" | "예언서";

export interface BookMeta {
  code: string;
  ko: string;
  en: string;
  abbr: string;
  chapters: number;
  group: BookGroup;
  testament: "old" | "new";
}

export const BOOKS: BookMeta[] = [
  { code: "GEN", ko: "창세기", en: "Genesis", abbr: "창", chapters: 50, group: "율법서", testament: "old" },
  { code: "EXO", ko: "출애굽기", en: "Exodus", abbr: "출", chapters: 40, group: "율법서", testament: "old" },
  { code: "LEV", ko: "레위기", en: "Leviticus", abbr: "레", chapters: 27, group: "율법서", testament: "old" },
  { code: "NUM", ko: "민수기", en: "Numbers", abbr: "민", chapters: 36, group: "율법서", testament: "old" },
  { code: "DEU", ko: "신명기", en: "Deuteronomy", abbr: "신", chapters: 34, group: "율법서", testament: "old" },
  { code: "JOS", ko: "여호수아", en: "Joshua", abbr: "수", chapters: 24, group: "역사서", testament: "old" },
  { code: "JDG", ko: "사사기", en: "Judges", abbr: "삿", chapters: 21, group: "역사서", testament: "old" },
  { code: "RUT", ko: "룻기", en: "Ruth", abbr: "룻", chapters: 4, group: "역사서", testament: "old" },
  { code: "1SA", ko: "사무엘상", en: "1 Samuel", abbr: "삼상", chapters: 31, group: "역사서", testament: "old" },
  { code: "2SA", ko: "사무엘하", en: "2 Samuel", abbr: "삼하", chapters: 24, group: "역사서", testament: "old" },
  { code: "1KI", ko: "열왕기상", en: "1 Kings", abbr: "왕상", chapters: 22, group: "역사서", testament: "old" },
  { code: "2KI", ko: "열왕기하", en: "2 Kings", abbr: "왕하", chapters: 25, group: "역사서", testament: "old" },
  { code: "1CH", ko: "역대상", en: "1 Chronicles", abbr: "대상", chapters: 29, group: "역사서", testament: "old" },
  { code: "2CH", ko: "역대하", en: "2 Chronicles", abbr: "대하", chapters: 36, group: "역사서", testament: "old" },
  { code: "EZR", ko: "에스라", en: "Ezra", abbr: "스", chapters: 10, group: "역사서", testament: "old" },
  { code: "NEH", ko: "느헤미야", en: "Nehemiah", abbr: "느", chapters: 13, group: "역사서", testament: "old" },
  { code: "EST", ko: "에스더", en: "Esther", abbr: "에", chapters: 10, group: "역사서", testament: "old" },
  { code: "JOB", ko: "욥기", en: "Job", abbr: "욥", chapters: 42, group: "시가서", testament: "old" },
  { code: "PSA", ko: "시편", en: "Psalms", abbr: "시", chapters: 150, group: "시가서", testament: "old" },
  { code: "PRO", ko: "잠언", en: "Proverbs", abbr: "잠", chapters: 31, group: "시가서", testament: "old" },
  { code: "ECC", ko: "전도서", en: "Ecclesiastes", abbr: "전", chapters: 12, group: "시가서", testament: "old" },
  { code: "SNG", ko: "아가", en: "Song of Songs", abbr: "아", chapters: 8, group: "시가서", testament: "old" },
  { code: "ISA", ko: "이사야", en: "Isaiah", abbr: "사", chapters: 66, group: "대선지서", testament: "old" },
  { code: "JER", ko: "예레미야", en: "Jeremiah", abbr: "렘", chapters: 52, group: "대선지서", testament: "old" },
  { code: "LAM", ko: "예레미야애가", en: "Lamentations", abbr: "애", chapters: 5, group: "대선지서", testament: "old" },
  { code: "EZK", ko: "에스겔", en: "Ezekiel", abbr: "겔", chapters: 48, group: "대선지서", testament: "old" },
  { code: "DAN", ko: "다니엘", en: "Daniel", abbr: "단", chapters: 12, group: "대선지서", testament: "old" },
  { code: "HOS", ko: "호세아", en: "Hosea", abbr: "호", chapters: 14, group: "소선지서", testament: "old" },
  { code: "JOL", ko: "요엘", en: "Joel", abbr: "욜", chapters: 3, group: "소선지서", testament: "old" },
  { code: "AMO", ko: "아모스", en: "Amos", abbr: "암", chapters: 9, group: "소선지서", testament: "old" },
  { code: "OBA", ko: "오바댜", en: "Obadiah", abbr: "옵", chapters: 1, group: "소선지서", testament: "old" },
  { code: "JON", ko: "요나", en: "Jonah", abbr: "욘", chapters: 4, group: "소선지서", testament: "old" },
  { code: "MIC", ko: "미가", en: "Micah", abbr: "미", chapters: 7, group: "소선지서", testament: "old" },
  { code: "NAH", ko: "나훔", en: "Nahum", abbr: "나", chapters: 3, group: "소선지서", testament: "old" },
  { code: "HAB", ko: "하박국", en: "Habakkuk", abbr: "합", chapters: 3, group: "소선지서", testament: "old" },
  { code: "ZEP", ko: "스바냐", en: "Zephaniah", abbr: "습", chapters: 3, group: "소선지서", testament: "old" },
  { code: "HAG", ko: "학개", en: "Haggai", abbr: "학", chapters: 2, group: "소선지서", testament: "old" },
  { code: "ZEC", ko: "스가랴", en: "Zechariah", abbr: "슥", chapters: 14, group: "소선지서", testament: "old" },
  { code: "MAL", ko: "말라기", en: "Malachi", abbr: "말", chapters: 4, group: "소선지서", testament: "old" },
  { code: "MAT", ko: "마태복음", en: "Matthew", abbr: "마", chapters: 28, group: "복음서", testament: "new" },
  { code: "MRK", ko: "마가복음", en: "Mark", abbr: "막", chapters: 16, group: "복음서", testament: "new" },
  { code: "LUK", ko: "누가복음", en: "Luke", abbr: "눅", chapters: 24, group: "복음서", testament: "new" },
  { code: "JHN", ko: "요한복음", en: "John", abbr: "요", chapters: 21, group: "복음서", testament: "new" },
  { code: "ACT", ko: "사도행전", en: "Acts", abbr: "행", chapters: 28, group: "사도행전", testament: "new" },
  { code: "ROM", ko: "로마서", en: "Romans", abbr: "롬", chapters: 16, group: "바울서신", testament: "new" },
  { code: "1CO", ko: "고린도전서", en: "1 Corinthians", abbr: "고전", chapters: 16, group: "바울서신", testament: "new" },
  { code: "2CO", ko: "고린도후서", en: "2 Corinthians", abbr: "고후", chapters: 13, group: "바울서신", testament: "new" },
  { code: "GAL", ko: "갈라디아서", en: "Galatians", abbr: "갈", chapters: 6, group: "바울서신", testament: "new" },
  { code: "EPH", ko: "에베소서", en: "Ephesians", abbr: "엡", chapters: 6, group: "바울서신", testament: "new" },
  { code: "PHP", ko: "빌립보서", en: "Philippians", abbr: "빌", chapters: 4, group: "바울서신", testament: "new" },
  { code: "COL", ko: "골로새서", en: "Colossians", abbr: "골", chapters: 4, group: "바울서신", testament: "new" },
  { code: "1TH", ko: "데살로니가전서", en: "1 Thessalonians", abbr: "살전", chapters: 5, group: "바울서신", testament: "new" },
  { code: "2TH", ko: "데살로니가후서", en: "2 Thessalonians", abbr: "살후", chapters: 3, group: "바울서신", testament: "new" },
  { code: "1TI", ko: "디모데전서", en: "1 Timothy", abbr: "딤전", chapters: 6, group: "바울서신", testament: "new" },
  { code: "2TI", ko: "디모데후서", en: "2 Timothy", abbr: "딤후", chapters: 4, group: "바울서신", testament: "new" },
  { code: "TIT", ko: "디도서", en: "Titus", abbr: "딛", chapters: 3, group: "바울서신", testament: "new" },
  { code: "PHM", ko: "빌레몬서", en: "Philemon", abbr: "몬", chapters: 1, group: "바울서신", testament: "new" },
  { code: "HEB", ko: "히브리서", en: "Hebrews", abbr: "히", chapters: 13, group: "일반서신", testament: "new" },
  { code: "JAS", ko: "야고보서", en: "James", abbr: "약", chapters: 5, group: "일반서신", testament: "new" },
  { code: "1PE", ko: "베드로전서", en: "1 Peter", abbr: "벧전", chapters: 5, group: "일반서신", testament: "new" },
  { code: "2PE", ko: "베드로후서", en: "2 Peter", abbr: "벧후", chapters: 3, group: "일반서신", testament: "new" },
  { code: "1JN", ko: "요한일서", en: "1 John", abbr: "요일", chapters: 5, group: "일반서신", testament: "new" },
  { code: "2JN", ko: "요한이서", en: "2 John", abbr: "요이", chapters: 1, group: "일반서신", testament: "new" },
  { code: "3JN", ko: "요한삼서", en: "3 John", abbr: "요삼", chapters: 1, group: "일반서신", testament: "new" },
  { code: "JUD", ko: "유다서", en: "Jude", abbr: "유", chapters: 1, group: "일반서신", testament: "new" },
  { code: "REV", ko: "요한계시록", en: "Revelation", abbr: "계", chapters: 22, group: "예언서", testament: "new" },
];

// 목차에서 그룹 라벨을 보여줄 순서
export const GROUP_ORDER: BookGroup[] = [
  "율법서", "역사서", "시가서", "대선지서", "소선지서",
  "복음서", "사도행전", "바울서신", "일반서신", "예언서",
];

export const BOOK_BY_CODE: Record<string, BookMeta> = Object.fromEntries(BOOKS.map(b => [b.code, b]));

// 그룹 순서를 유지한 채 (그룹라벨, 권목록) 으로 묶어 반환
export function groupedBooks(): { group: BookGroup; books: BookMeta[] }[] {
  return GROUP_ORDER.map(group => ({ group, books: BOOKS.filter(b => b.group === group) }))
    .filter(g => g.books.length > 0);
}

// 검색: 한글명 / 영문명 / 약어 / 코드에 질의 포함
export function searchBooks(q: string): BookMeta[] {
  const s = q.trim().toLowerCase();
  if (!s) return BOOKS;
  return BOOKS.filter(b =>
    b.ko.toLowerCase().includes(s) ||
    b.en.toLowerCase().includes(s) ||
    b.abbr.toLowerCase().includes(s) ||
    b.code.toLowerCase().includes(s)
  );
}

// 이전/다음 권 코드 (권 경계 넘나들기용)
export function adjacentBook(code: string, dir: 1 | -1): BookMeta | null {
  const i = BOOKS.findIndex(b => b.code === code);
  if (i < 0) return null;
  return BOOKS[i + dir] ?? null;
}
