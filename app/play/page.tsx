"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { BIBLE_BOOKS, booksForTestament } from "@/lib/bible";

const TESTAMENTS = [
  { value: "전체", label: "전체" },
  { value: "old",  label: "구약" },
  { value: "new",  label: "신약" },
];
const LEVELS = [
  { value: "전체",  label: "전체" },
  { value: "easy",   label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard",   label: "어려움" },
];
const COUNTS = [5, 10, 20, 30];

export default function PlaySetup() {
  const router = useRouter();
  const [testament, setTestament] = useState("전체");
  const [level, setLevel]         = useState("전체");
  const [count, setCount]         = useState(10);
  const [books, setBooks]         = useState<string[]>([]);

  function changeTestament(v: string) { setTestament(v); setBooks([]); }
  function toggleBook(book: string) {
    setBooks(prev => prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]);
  }
  function start() {
    const q = new URLSearchParams({ level, testament, count: String(count) });
    if (books.length) q.set("books", books.join(","));
    router.push(`/quiz?${q.toString()}`);
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "1rem 1.1rem 1.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 홈</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: theme.gold, margin: 0 }}>📖 성경 퀴즈</h1>
        <span style={{ width: 56 }} />
      </div>

      <Section title="성경 구분"><ChipGroup items={TESTAMENTS} value={testament} onChange={changeTestament} /></Section>
      <BookPicker testament={testament} selected={books} onToggle={toggleBook} onClear={() => setBooks([])} onSelectAll={() => setBooks(booksForTestament(testament))} />
      <Section title="난이도"><ChipGroup items={LEVELS} value={level} onChange={setLevel} /></Section>
      <Section title="문제 수">
        <ChipGroup items={COUNTS.map(n => ({ value: String(n), label: `${n}문제` }))} value={String(count)} onChange={v => setCount(Number(v))} />
      </Section>

      <div style={{ height: "1.2rem" }} />
      <button onClick={start} style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#e6cf86 0%,#c9a84c 100%)", color: "#241246", border: "none", borderRadius: 14, cursor: "pointer", letterSpacing: 1, boxShadow: "0 8px 24px rgba(216,190,110,0.25)" }}>퀴즈 시작 →</button>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>{title}</p>
      {children}
    </div>
  );
}

function ChipGroup({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {items.map(item => {
        const on = value === item.value;
        return (
          <button key={item.value} onClick={() => onChange(item.value)} style={{ flex: 1, padding: "15px 4px", borderRadius: 13, fontSize: 16, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text, fontWeight: on ? 800 : 600 }}>{item.label}</button>
        );
      })}
    </div>
  );
}

function BookPicker({ testament, selected, onToggle, onClear, onSelectAll }: {
  testament: string; selected: string[]; onToggle: (book: string) => void; onClear: () => void; onSelectAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const groups: { label: string | null; books: string[] }[] =
    testament === "old" ? [{ label: null, books: BIBLE_BOOKS.old }]
    : testament === "new" ? [{ label: null, books: BIBLE_BOOKS.new }]
    : [{ label: "구약", books: BIBLE_BOOKS.old }, { label: "신약", books: BIBLE_BOOKS.new }];

  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>성경 권 (선택)</p>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <span>📖 {selected.length === 0 ? "전체 권에서 출제" : `${selected.length}권 선택됨`}</span>
        <span style={{ color: theme.gold }}>{open ? "▲ 닫기" : "▼ 골라보기"}</span>
      </button>
      {open && (
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "12px", marginTop: 8, maxHeight: 260, overflowY: "auto", background: theme.card }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            <button onClick={onSelectAll} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, color: theme.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>전체 선택</button>
            <button onClick={onClear} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "transparent", color: theme.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>선택 해제</button>
          </div>
          {groups.map(group => (
            <div key={group.label ?? "single"} style={{ marginBottom: 4 }}>
              {group.label && <p style={{ fontSize: 11, fontWeight: 700, color: theme.gold, margin: "4px 0 7px", letterSpacing: 0.5 }}>{group.label}</p>}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                {group.books.map(book => {
                  const on = selected.includes(book);
                  return (
                    <button key={book} onClick={() => onToggle(book)} style={{ padding: "8px 13px", borderRadius: 18, fontSize: 13.5, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : "transparent", color: on ? "#fff" : theme.text, fontWeight: on ? 700 : 500 }}>{book}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
