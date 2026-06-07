"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { BIBLE_BOOKS, booksForTestament } from "@/lib/bible";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";

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
  const { user, nickname, loading, signOut, updateNickname } = useAuth();
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [testament, setTestament] = useState("전체");

  // 데일리 출석 스트릭: 점수 기록의 날짜로 연속 일수 계산
  useEffect(() => {
    if (!user) return;
    supabase.from("scores").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(400)
      .then(({ data }) => {
        if (!data) return;
        const days = new Set(data.map(r => new Date(r.created_at).toLocaleDateString("en-CA")));
        const today = new Date().toLocaleDateString("en-CA");
        setPlayedToday(days.has(today));
        const cur = new Date();
        if (!days.has(today)) cur.setDate(cur.getDate() - 1); // 오늘 안 풀었으면 어제부터 카운트
        let s = 0;
        while (days.has(cur.toLocaleDateString("en-CA"))) { s++; cur.setDate(cur.getDate() - 1); }
        setStreak(s);
      });
  }, [user]);
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
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "0.85rem 1.1rem 1.4rem", minHeight: "100dvh" }}>
      {/* 상단 바 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => router.push("/ranking")} style={{ fontSize: 13, fontWeight: 700, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "7px 14px", cursor: "pointer" }}>🏆 랭킹</button>
          {user && <button onClick={() => router.push("/history")} style={{ fontSize: 13, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: "7px 12px", cursor: "pointer" }}>📒 오답</button>}
        </div>
        {!loading && (user ? (
          editingNick ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={nickDraft} onChange={e => setNickDraft(e.target.value)} maxLength={20} autoFocus
                style={{ width: 110, fontSize: 13, padding: "6px 10px", borderRadius: 14, border: `1px solid ${theme.gold}`, background: theme.card, color: theme.text, outline: "none" }} />
              <button onClick={async () => { const ok = await updateNickname(nickDraft); if (ok) setEditingNick(false); else alert("닉네임을 바꾸지 못했어요."); }}
                style={{ fontSize: 12, fontWeight: 700, color: "#241246", background: theme.gold, border: "none", borderRadius: 14, padding: "6px 12px", cursor: "pointer" }}>저장</button>
              <button onClick={() => setEditingNick(false)} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }} title="닉네임 바꾸기"
                style={{ fontSize: 13, color: theme.text, fontWeight: 600, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>{nickname} ✏️</button>
              <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "5px 12px", cursor: "pointer" }}>로그아웃</button>
            </div>
          )
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 20, padding: "7px 16px", cursor: "pointer" }}>로그인</button>
        ))}
      </div>

      {/* 환영 + 브랜드 (히어로) — 컴팩트 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "1.1rem" }}>
        {user && (
          <p style={{ fontSize: 13, color: theme.primarySoft, fontWeight: 600, margin: "0 0 8px" }}>
            {nickname}님, 오늘도 말씀과 함께해요 👋
          </p>
        )}
        {user && streak > 0 && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 800, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "5px 14px" }}>
              🔥 {streak}일 연속 {playedToday ? "출석!" : "— 오늘도 풀면 이어져요!"}
            </span>
          </div>
        )}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
          <div aria-hidden style={{ position: "absolute", inset: -14, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,200,120,0.26) 0%, rgba(230,200,120,0) 70%)" }} />
          <img src="/icons/icon-192.png" alt="DABAR" width={52} height={52} style={{ position: "relative", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} />
        </div>
        <h1 style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 30, fontWeight: 700, color: theme.gold, letterSpacing: 5, margin: "2px 0 2px" }}>DABAR</h1>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>다바르 · 말씀 퀴즈 — 남녀노소 누구나!</p>
      </div>

      <Section title="성경 구분"><ChipGroup items={TESTAMENTS} value={testament} onChange={changeTestament} /></Section>
      <BookPicker testament={testament} selected={books} onToggle={toggleBook} onClear={() => setBooks([])} onSelectAll={() => setBooks(booksForTestament(testament))} />
      <Section title="난이도"><ChipGroup items={LEVELS} value={level} onChange={setLevel} /></Section>
      <Section title="문제 수">
        <ChipGroup items={COUNTS.map(n => ({ value: String(n), label: `${n}문제` }))} value={String(count)} onChange={v => setCount(Number(v))} />
      </Section>

      <div style={{ height: "1.1rem" }} />

      <button onClick={start} style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#e6cf86 0%,#c9a84c 100%)", color: "#241246", border: "none", borderRadius: 14, cursor: "pointer", letterSpacing: 1, boxShadow: "0 8px 24px rgba(216,190,110,0.25)" }}>퀴즈 시작 →</button>
      {user && (
        <button onClick={shareInvite} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer", marginTop: 10 }}>👋 친구 초대하고 같이 경쟁하기</button>
      )}
      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "1.1rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
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

// 가로를 꽉 채우는 세그먼트 버튼 (탭하기 쉬움)
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

// 성경 권(책) 다중 선택 — 접이식 패널, 전체선택/해제 + 큼직한 버튼
function BookPicker({ testament, selected, onToggle, onClear, onSelectAll }: {
  testament: string; selected: string[]; onToggle: (book: string) => void; onClear: () => void; onSelectAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const groups: { label: string | null; books: string[] }[] =
    testament === "old" ? [{ label: null, books: BIBLE_BOOKS.old }]
    : testament === "new" ? [{ label: null, books: BIBLE_BOOKS.new }]
    : [{ label: "구약", books: BIBLE_BOOKS.old }, { label: "신약", books: BIBLE_BOOKS.new }];
  const summary = selected.length === 0 ? "전체 권" : `${selected.length}권`;

  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>성경 권 (선택)</p>
      {/* 펼치기 버튼 */}
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <span>📖 {selected.length === 0 ? "전체 권에서 출제" : `${summary} 선택됨`}</span>
        <span style={{ color: theme.gold }}>{open ? "▲ 닫기" : "▼ 골라보기"}</span>
      </button>

      {open && (
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "12px", marginTop: 8, maxHeight: 260, overflowY: "auto", background: theme.card }}>
          {/* 전체 선택 / 해제 */}
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
