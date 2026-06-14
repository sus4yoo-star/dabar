"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { BOOK_BY_CODE, BookMeta, adjacentBook, groupedBooks, searchBooks } from "@/lib/bibleData";
import { BIBLE_VERSION_LABEL, BookText, loadBook } from "@/lib/bibleText";

export default function ReadPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [code, setCode] = useState("GEN");
  const [chapter, setChapter] = useState(1);
  const [targetVerse, setTargetVerse] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true); // 처음 들어오면 목차부터
  const [book, setBook] = useState<BookText | null>(null);
  const [loading, setLoading] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  const meta = BOOK_BY_CODE[code];

  // 현재 권 본문 로드
  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadBook(code).then(b => { if (alive) { setBook(b); setLoading(false); } });
    return () => { alive = false; };
  }, [code]);

  // 장 바뀌면 위로, 특정 절 타깃이면 스크롤
  useEffect(() => {
    if (pickerOpen) return;
    if (targetVerse) {
      const el = document.getElementById(`v-${targetVerse}`);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTargetVerse(null); return; }
    }
    scroller.current?.scrollTo({ top: 0 });
  }, [chapter, code, pickerOpen, targetVerse, book]);

  function goChapter(next: number) {
    if (!meta) return;
    if (next >= 1 && next <= meta.chapters) { setChapter(next); return; }
    // 권 경계 넘기
    const dir = next < 1 ? -1 : 1;
    const nb = adjacentBook(code, dir);
    if (!nb) return;
    setCode(nb.code);
    setChapter(dir === 1 ? 1 : nb.chapters);
  }

  function openAt(c: string, ch: number, v: number | null) {
    setCode(c); setChapter(ch); setTargetVerse(v); setPickerOpen(false);
  }

  const verses = book?.chapters?.[chapter - 1] ?? null;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: theme.bg ?? "#fff", borderBottom: `1px solid ${theme.cardBorder}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => router.push("/")} style={iconBtn}>← {t("common.home")}</button>
        <button onClick={() => setPickerOpen(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "9px 12px", cursor: "pointer" }}>
          <span style={{ fontSize: 15.5, fontWeight: 800, color: theme.text }}>📖 {meta?.ko} {chapter}{t("read.chapter")}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.gold }}>▾</span>
        </button>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: theme.textFaint, whiteSpace: "nowrap" }}>{BIBLE_VERSION_LABEL}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: theme.gold, whiteSpace: "nowrap" }}>· {t("read.licensing")}</span>
        </span>
      </div>

      {/* 본문 */}
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "16px 18px 90px" }}>
        {/* 컨셉: 혼자 읽기 + 상대 언어와 나란히 함께 읽기 */}
        <div style={{ background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "10px 12px", margin: "0 0 14px" }}>
          <p style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.55, textAlign: "center", margin: 0 }}>🙏 {t("read.concept")}</p>
          <button onClick={() => router.push("/share/verses")}
            style={{ width: "100%", marginTop: 9, padding: "9px", fontSize: 13, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, cursor: "pointer" }}>
            {t("read.toParallel")}
          </button>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: "2px 0 14px" }}>{meta?.ko} {chapter}{t("read.chapter")}</h2>
        {loading ? (
          <p style={{ color: theme.textMuted, textAlign: "center", padding: "3rem 0" }}>…</p>
        ) : verses && verses.length ? (
          <div style={{ fontSize: 17, lineHeight: 1.95, color: theme.text }}>
            {verses.map((vt, i) => {
              const n = i + 1;
              const heading = book?.headings?.[`${chapter}:${n}`];
              return (
                <span key={n}>
                  {heading && <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: theme.primarySoft, margin: "16px 0 6px" }}>{heading}</span>}
                  <span id={`v-${n}`} style={{ scrollMarginTop: 70 }}>
                    <sup style={{ fontSize: 11, fontWeight: 800, color: theme.gold, marginRight: 4 }}>{n}</sup>
                    {vt}{" "}
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: theme.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📖</div>
            <p style={{ fontWeight: 800, color: theme.text, margin: "0 0 6px" }}>{t("read.noText")}</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{t("read.noTextSub")}</p>
          </div>
        )}
      </div>

      {/* 이전/다음 장 */}
      <div style={{ position: "sticky", bottom: 0, background: theme.bg ?? "#fff", borderTop: `1px solid ${theme.cardBorder}`, padding: "10px 14px", display: "flex", gap: 10 }}>
        <button onClick={() => goChapter(chapter - 1)} style={navBtn}>{t("read.prevCh")}</button>
        <button onClick={() => goChapter(chapter + 1)} style={navBtn}>{t("read.nextCh")}</button>
      </div>

      {pickerOpen && (
        <Picker
          initialCode={code}
          initialChapter={chapter}
          onClose={() => setPickerOpen(false)}
          onPick={openAt}
        />
      )}
    </main>
  );
}

// ───────────────────────── 목차 피커 (권 → 장 → 절) ─────────────────────────
function Picker({ initialCode, initialChapter, onClose, onPick }: {
  initialCode: string; initialChapter: number;
  onClose: () => void;
  onPick: (code: string, chapter: number, verse: number | null) => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [pCode, setPCode] = useState(initialCode);
  const [pChap, setPChap] = useState<number | null>(initialChapter);
  const [pBook, setPBook] = useState<BookText | null>(null);

  const pMeta = BOOK_BY_CODE[pCode];
  const filtered = useMemo(() => (q ? searchBooks(q) : null), [q]);
  const groups = useMemo(() => groupedBooks(), []);

  // 선택한 권 본문 로드(절 수 산출용)
  useEffect(() => {
    let alive = true;
    setPBook(null);
    loadBook(pCode).then(b => { if (alive) setPBook(b); });
    return () => { alive = false; };
  }, [pCode]);

  const chapVerseCount = pChap && pBook ? (pBook.chapters[pChap - 1]?.length ?? 0) : 0;

  function pickBook(b: BookMeta) { setPCode(b.code); setPChap(1); }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: theme.bg ?? "#fff", display: "flex", flexDirection: "column", maxWidth: 560, margin: "0 auto" }}>
      {/* 상단: 검색 + 닫기 */}
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${theme.cardBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: theme.text, whiteSpace: "nowrap" }}>📑 {t("read.toc")}</span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("read.search")}
          style={{ flex: 1, fontSize: 13.5, padding: "8px 11px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, outline: "none" }} />
        <button onClick={onClose} style={{ ...iconBtn, fontSize: 18, padding: "4px 8px" }}>✕</button>
      </div>

      {/* 현재 선택 + 읽기 */}
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${theme.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: theme.gold }}>{pMeta?.ko} {pChap ?? 1}{t("read.chapter")}</span>
        <button onClick={() => onPick(pCode, pChap ?? 1, null)}
          style={{ fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}>{t("read.open")}</button>
      </div>

      {/* 3단: 권 | 장 | 절 */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", minHeight: 0 }}>
        {/* 권 목록 */}
        <div style={{ overflowY: "auto", borderRight: `1px solid ${theme.cardBorder}`, padding: "6px 0" }}>
          {filtered ? (
            filtered.length
              ? filtered.map(b => <BookRow key={b.code} b={b} on={b.code === pCode} onClick={() => pickBook(b)} />)
              : <p style={{ fontSize: 12, color: theme.textFaint, textAlign: "center", padding: "1rem" }}>—</p>
          ) : (
            groups.map(({ group, books }) => (
              <div key={group}>
                <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, padding: "10px 12px 4px", position: "sticky", top: 0, background: theme.bg ?? "#fff" }}>{group}</p>
                {books.map(b => <BookRow key={b.code} b={b} on={b.code === pCode} onClick={() => pickBook(b)} />)}
              </div>
            ))
          )}
        </div>

        {/* 장 */}
        <div style={{ overflowY: "auto", borderRight: `1px solid ${theme.cardBorder}`, padding: "6px 0" }}>
          {Array.from({ length: pMeta?.chapters ?? 0 }, (_, i) => i + 1).map(c => {
            const on = c === pChap;
            return (
              <button key={c} onClick={() => setPChap(c)}
                style={{ width: "100%", textAlign: "center", padding: "11px 6px", fontSize: 15, fontWeight: on ? 800 : 600, background: on ? theme.goldLight : "transparent", color: on ? theme.gold : theme.text, border: "none", borderBottom: `1px solid ${theme.cardBorder}`, cursor: "pointer" }}>
                {c} {t("read.chapter")}
              </button>
            );
          })}
        </div>

        {/* 절 */}
        <div style={{ overflowY: "auto", padding: "6px 0" }}>
          {chapVerseCount > 0 ? (
            Array.from({ length: chapVerseCount }, (_, i) => i + 1).map(v => (
              <button key={v} onClick={() => onPick(pCode, pChap ?? 1, v)}
                style={{ width: "100%", textAlign: "center", padding: "11px 6px", fontSize: 15, fontWeight: 600, background: "transparent", color: theme.text, border: "none", borderBottom: `1px solid ${theme.cardBorder}`, cursor: "pointer" }}>
                {v} {t("read.verse")}
              </button>
            ))
          ) : (
            <p style={{ fontSize: 11.5, color: theme.textFaint, textAlign: "center", padding: "1rem 0.5rem", lineHeight: 1.6 }}>{t("read.pickVerseHint")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BookRow({ b, on, onClick }: { b: BookMeta; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, textAlign: "left", padding: "9px 12px", background: on ? theme.goldLight : "transparent", border: "none", borderBottom: `1px solid ${theme.cardBorder}`, cursor: "pointer" }}>
      <span style={{ flexShrink: 0, minWidth: 26, textAlign: "center", fontSize: 11.5, fontWeight: 800, color: on ? theme.gold : theme.primarySoft, background: on ? "transparent" : theme.primaryBg, borderRadius: 7, padding: "3px 4px" }}>{b.abbr}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: on ? 800 : 600, color: theme.text }}>{b.ko}</span>
        <span style={{ display: "block", fontSize: 10.5, color: theme.textFaint }}>{b.en}</span>
      </span>
    </button>
  );
}

const iconBtn: React.CSSProperties = { fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "7px 10px", cursor: "pointer", whiteSpace: "nowrap" };
const navBtn: React.CSSProperties = { flex: 1, fontSize: 14, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "11px", cursor: "pointer" };
