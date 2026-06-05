"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { BIBLE_BOOKS } from "@/lib/bible";
import { useAuth } from "@/lib/auth";

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

export default function Home() {
  const router = useRouter();
  const { user, nickname, loading, signOut } = useAuth();
  const [testament, setTestament] = useState("전체");
  const [level, setLevel]         = useState("전체");
  const [count, setCount]         = useState(10);
  const [books, setBooks]         = useState<string[]>([]);

  // 성경 구분을 바꾸면, 그 구분에 없는 권 선택은 초기화
  function changeTestament(v: string) {
    setTestament(v);
    setBooks([]);
  }

  function toggleBook(book: string) {
    setBooks(prev =>
      prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]
    );
  }

  function start() {
    const q = new URLSearchParams({ level, testament, count: String(count) });
    if (books.length) q.set("books", books.join(","));
    router.push(`/quiz?${q.toString()}`);
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <button onClick={() => router.push("/ranking")} style={{ fontSize: 13, fontWeight: 700, color: theme.primary, background: theme.primaryBg, border: "none", borderRadius: 20, padding: "7px 14px", cursor: "pointer" }}>🏆 랭킹</button>
        {!loading && (user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nickname}</span>
            <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "none", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "5px 12px", cursor: "pointer" }}>로그아웃</button>
          </div>
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 20, padding: "7px 16px", cursor: "pointer" }}>로그인</button>
        ))}
      </div>

      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: theme.primary, letterSpacing: 4, margin: "0 0 4px" }}>DABAR</h1>
        <p style={{ fontSize: 13, color: theme.gold, fontWeight: 600, letterSpacing: 1, margin: "0 0 4px" }}>다바르 · 말씀</p>
        <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>성경 퀴즈 — 남녀노소 누구나!</p>
      </div>

      <Section title="성경 구분"><ChipGroup items={TESTAMENTS} value={testament} onChange={changeTestament} /></Section>

      <BookPicker testament={testament} selected={books} onToggle={toggleBook} onClear={() => setBooks([])} />

      <Section title="난이도"><ChipGroup items={LEVELS} value={level} onChange={setLevel} /></Section>
      <Section title="문제 수">
        <ChipGroup items={COUNTS.map(n => ({ value: String(n), label: `${n}문제` }))} value={String(count)} onChange={v => setCount(Number(v))} />
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "1.5rem 0 2rem" }}>
        {[["📖","3,000+","문제"],["⏱","30초","문제당"],["🏆","66권","성경 전체"]].map(([icon,val,label]) => (
          <div key={label} style={{ background: theme.primaryBg, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.primary }}>{val}</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={start} style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", letterSpacing: 1 }}>퀴즈 시작 →</button>
      <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>{title}</p>
      {children}
    </div>
  );
}

function ChipGroup({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map(item => (
        <button key={item.value} onClick={() => onChange(item.value)} style={{ padding: "8px 18px", borderRadius: 24, fontSize: 14, cursor: "pointer", border: "none", background: value === item.value ? theme.primary : "#fff", color: value === item.value ? "#fff" : theme.text, fontWeight: value === item.value ? 700 : 400, boxShadow: value === item.value ? "none" : `0 0 0 1px ${theme.border}` }}>{item.label}</button>
      ))}
    </div>
  );
}

// 성경 권(책) 다중 선택
function BookPicker({ testament, selected, onToggle, onClear }: {
  testament: string;
  selected: string[];
  onToggle: (book: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  // 전체일 때는 구약/신약 묶어서 보여주고, 특정 구분이면 그 권만
  const groups: { label: string | null; books: string[] }[] =
    testament === "old" ? [{ label: null, books: BIBLE_BOOKS.old }]
    : testament === "new" ? [{ label: null, books: BIBLE_BOOKS.new }]
    : [{ label: "구약", books: BIBLE_BOOKS.old }, { label: "신약", books: BIBLE_BOOKS.new }];

  const summary = selected.length === 0 ? "전체 권" : `${selected.length}권 선택됨`;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>성경 권 (선택)</p>
        <button onClick={() => setOpen(o => !o)} style={{ fontSize: 12, color: theme.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          {summary} {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px", maxHeight: 220, overflowY: "auto", background: "#fff" }}>
          {selected.length > 0 && (
            <button onClick={onClear} style={{ fontSize: 12, color: theme.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 10, textDecoration: "underline" }}>
              선택 해제 (전체로)
            </button>
          )}
          {groups.map(group => (
            <div key={group.label ?? "single"} style={{ marginBottom: 4 }}>
              {group.label && (
                <p style={{ fontSize: 11, fontWeight: 700, color: theme.gold, margin: "6px 0 6px", letterSpacing: 0.5 }}>{group.label}</p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {group.books.map(book => {
                  const on = selected.includes(book);
                  return (
                    <button key={book} onClick={() => onToggle(book)} style={{ padding: "6px 12px", borderRadius: 18, fontSize: 13, cursor: "pointer", border: "none", background: on ? theme.primary : "#fff", color: on ? "#fff" : theme.text, fontWeight: on ? 700 : 400, boxShadow: on ? "none" : `0 0 0 1px ${theme.border}` }}>{book}</button>
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
