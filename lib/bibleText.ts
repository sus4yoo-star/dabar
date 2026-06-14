// 개역개정 본문 적재 — /public/bible/krv/{CODE}.json 을 권 단위로 로드(캐시)
// JSON 형식: { "code": "GEN", "ko": "창세기", "chapters": [ ["1절 본문", "2절 본문", ...], [ ... ] ] }
// 라이선스 본문이 아직 없으면 파일이 없으므로 null 을 돌려주고, 화면은 "본문 준비 중"으로 처리한다.
// (개역개정판 ⓒ 대한성서공회 — 사용 허락 본문만 넣을 것)

export interface BookText {
  code: string;
  ko?: string;
  chapters: string[][]; // chapters[chapterIndex0][verseIndex0] = 절 본문
  headings?: Record<string, string>; // "chap:verse" → 소제목 (선택)
}

const cache = new Map<string, BookText | null>();
const inflight = new Map<string, Promise<BookText | null>>();

export const BIBLE_VERSION_LABEL = "개역개정";

export function cachedBook(code: string): BookText | null | undefined {
  return cache.get(code);
}

export async function loadBook(code: string): Promise<BookText | null> {
  if (cache.has(code)) return cache.get(code)!;
  if (inflight.has(code)) return inflight.get(code)!;
  const p = (async () => {
    try {
      const r = await fetch(`/bible/krv/${code}.json`, { cache: "force-cache" });
      if (!r.ok) { cache.set(code, null); return null; }
      const d = await r.json();
      const chapters = Array.isArray(d?.chapters) ? (d.chapters as string[][]) : [];
      const book: BookText = { code, ko: d?.ko, chapters, headings: d?.headings };
      cache.set(code, book);
      return book;
    } catch {
      cache.set(code, null);
      return null;
    } finally {
      inflight.delete(code);
    }
  })();
  inflight.set(code, p);
  return p;
}

// 해당 장의 절 수 (본문 적재된 경우만; 없으면 0)
export function verseCount(book: BookText | null | undefined, chapter1: number): number {
  return book?.chapters?.[chapter1 - 1]?.length ?? 0;
}
