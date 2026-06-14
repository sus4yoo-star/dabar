// 성경 본문 적재 — /public/bible/{VERSION}/{CODE}.json 을 권 단위로 로드(캐시)
// JSON 형식: { "code": "GEN", "ko": "창세기", "chapters": [ ["1절 본문", "2절 본문", ...], [ ... ] ] }
// 버전(폴더명):
//   · krv = 개역개정(한국어, ⓒ 대한성서공회 — 사용 허락 본문만)
//   · 그 외 언어 = 언어 코드(en, th, sw, ar …) — 해당 언어 공개/허락 역본
// 데이터가 없으면(파일 없음) null 을 돌려주고, 화면은 "본문 준비 중"으로 처리한다.
import { LANG_META } from "@/lib/besora/i18n";

export interface BookText {
  code: string;
  ko?: string;
  chapters: string[][]; // chapters[chapterIndex0][verseIndex0] = 절 본문
  headings?: Record<string, string>; // "chap:verse" → 소제목 (선택)
}

export interface BibleVersion { id: string; label: string; lang: string; rtl: boolean; }

// 1열(기본) = 개역개정
export const PRIMARY_VERSION: BibleVersion = { id: "krv", label: "개역개정", lang: "ko", rtl: false };
export const BIBLE_VERSION_LABEL = PRIMARY_VERSION.label;

// 2열(상대 언어) 후보 — 폴더명 = 언어 코드. 해당 폴더에 JSON 을 넣으면 자동 활성화.
export const SECONDARY_VERSIONS: BibleVersion[] = Object.values(LANG_META)
  .filter(l => l.code !== "ko")
  .sort((a, b) => a.sort - b.sort)
  .map(l => ({ id: l.code, label: l.name_native, lang: l.code, rtl: l.rtl }));

const cache = new Map<string, BookText | null>();
const inflight = new Map<string, Promise<BookText | null>>();
const keyOf = (version: string, code: string) => `${version}/${code}`;

export function cachedBook(code: string, version = PRIMARY_VERSION.id): BookText | null | undefined {
  return cache.get(keyOf(version, code));
}

export async function loadBook(code: string, version = PRIMARY_VERSION.id): Promise<BookText | null> {
  const key = keyOf(version, code);
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    try {
      const r = await fetch(`/bible/${version}/${code}.json`, { cache: "force-cache" });
      if (!r.ok) { cache.set(key, null); return null; }
      const d = await r.json();
      const chapters = Array.isArray(d?.chapters) ? (d.chapters as string[][]) : [];
      const book: BookText = { code, ko: d?.ko, chapters, headings: d?.headings };
      cache.set(key, book);
      return book;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

// 해당 장의 절 수 (본문 적재된 경우만; 없으면 0)
export function verseCount(book: BookText | null | undefined, chapter1: number): number {
  return book?.chapters?.[chapter1 - 1]?.length ?? 0;
}
