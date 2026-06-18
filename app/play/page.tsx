"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { BIBLE_BOOKS, booksForTestament } from "@/lib/bible";
import { useI18n } from "@/lib/i18n";
import { PageHeader, SectionLabel, ACCENT } from "@/lib/ui";
import MenuIcon from "@/components/MenuIcon";

const COUNTS = [5, 10, 20, 30];

export default function PlaySetup() {
  const router = useRouter();
  const { t } = useI18n();
  const [testament, setTestament] = useState("전체");
  const [level, setLevel]         = useState("전체");
  const [count, setCount]         = useState(10);
  const [books, setBooks]         = useState<string[]>([]);
  const [complete, setComplete]   = useState(false);
  const [order, setOrder]         = useState<"bible" | "random">("bible");

  const TESTAMENTS = [
    { value: "전체", label: t("pl.all") },
    { value: "old",  label: t("pl.old") },
    { value: "new",  label: t("pl.new") },
  ];
  const LEVELS = [
    { value: "전체",   label: t("pl.all") },
    { value: "easy",   label: t("q.easy") },
    { value: "medium", label: t("q.medium") },
    { value: "hard",   label: t("q.hard") },
  ];

  function changeTestament(v: string) { setTestament(v); setBooks([]); }
  function toggleBook(book: string) {
    setBooks(prev => prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]);
  }
  function start() {
    const q = new URLSearchParams({ level, testament });
    if (complete) { q.set("complete", "1"); q.set("order", order); }
    else q.set("count", String(count));
    if (books.length) q.set("books", books.join(","));
    router.push(`/quiz?${q.toString()}`);
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "0.7rem 1.1rem 1.4rem", minHeight: "100dvh" }}>
      <PageHeader
        title={t("pl.title")}
        subtitle={t("pl.subtitle")}
        onHome={() => router.push("/")}
        homeLabel={t("common.home")}
        accentColor={ACCENT.blue.fg}
        right={
          <button onClick={() => router.push("/progress")} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: ACCENT.blue.fg, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}><MenuIcon name="chart" size={15} color={ACCENT.blue.fg} />{t("prog.link")}</button>
        }
      />

      <SectionLabel icon="book" accentColor={ACCENT.blue.fg}>{t("pl.testament")}</SectionLabel>
      <ChipGroup items={TESTAMENTS} value={testament} onChange={changeTestament} />
      <SectionLabel icon="grad" accentColor={ACCENT.blue.fg}>{t("pl.level")}</SectionLabel>
      <ChipGroup items={LEVELS} value={level} onChange={setLevel} />
      {!complete && (
        <>
          <SectionLabel icon="list" accentColor={ACCENT.blue.fg}>{t("pl.count")}</SectionLabel>
          <ChipGroup items={COUNTS.map(n => ({ value: String(n), label: t("pl.countN", { n }) }))} value={String(count)} onChange={v => setCount(Number(v))} />
        </>
      )}
      <BookPicker testament={testament} selected={books} onToggle={toggleBook} onClear={() => setBooks([])} onSelectAll={() => setBooks(booksForTestament(testament))} />

      {/* 🏃 마라톤 퀴즈 — 성경 전권 완주 */}
      <div style={{ margin: "0.7rem 0" }}>
        <button onClick={() => setComplete(c => !c)} style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${complete ? "transparent" : theme.cardBorder}`, background: complete ? "linear-gradient(135deg,#2a93e6 0%,#1573c4 100%)" : theme.card, color: complete ? "#fff" : theme.text, boxShadow: complete ? "0 8px 22px rgba(31,143,230,0.28)" : "0 2px 10px rgba(26,37,48,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 11, background: complete ? "rgba(255,255,255,0.18)" : "var(--a-blue-chip)" }}>
              <MenuIcon name="trophy" size={20} color={complete ? "#fff" : "var(--a-blue-fg)"} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="serif" style={{ display: "block", fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>{t("pl.complete")}</span>
              <span style={{ display: "block", margin: "3px 0 0", fontSize: 12, lineHeight: 1.5, color: complete ? "rgba(255,255,255,0.92)" : theme.textMuted }}>{t("pl.completeHint")}</span>
            </span>
            <span style={{ flexShrink: 0, fontSize: 15, fontWeight: 800, width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: complete ? "rgba(255,255,255,0.22)" : "var(--a-blue-chip)", color: complete ? "#fff" : "var(--a-blue-fg)" }}>{complete ? "✓" : "›"}</span>
          </div>
        </button>
        {complete && (
          <div style={{ marginTop: 8 }}>
            <ChipGroup
              items={[{ value: "bible", label: t("pl.orderBible") }, { value: "random", label: t("pl.orderRandom") }]}
              value={order}
              onChange={v => setOrder(v as "bible" | "random")}
            />
          </div>
        )}
      </div>

      <button onClick={start} style={{ width: "100%", marginTop: 4, padding: "16px", fontSize: 16.5, fontWeight: 800, background: "linear-gradient(135deg,#2a93e6 0%,#1573c4 100%)", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer", letterSpacing: 1, boxShadow: "0 10px 26px rgba(31,143,230,0.30)" }}>{t("pl.start")}</button>
    </main>
  );
}

function ChipGroup({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {items.map(item => {
        const on = value === item.value;
        return (
          <button key={item.value} onClick={() => onChange(item.value)} style={{ flex: 1, minWidth: 0, padding: "11px 6px", borderRadius: 13, fontSize: 15, lineHeight: 1.25, whiteSpace: "normal", wordBreak: "keep-all", cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text, fontWeight: on ? 800 : 600, boxShadow: on ? "0 4px 14px rgba(31,143,230,0.26)" : "0 1px 3px rgba(26,37,48,0.04)", transition: "background .12s" }}>{item.label}</button>
        );
      })}
    </div>
  );
}

function BookPicker({ testament, selected, onToggle, onClear, onSelectAll }: {
  testament: string; selected: string[]; onToggle: (book: string) => void; onClear: () => void; onSelectAll: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const groups: { label: string | null; books: string[] }[] =
    testament === "old" ? [{ label: null, books: BIBLE_BOOKS.old }]
    : testament === "new" ? [{ label: null, books: BIBLE_BOOKS.new }]
    : [{ label: t("pl.old"), books: BIBLE_BOOKS.old }, { label: t("pl.new"), books: BIBLE_BOOKS.new }];

  return (
    <div style={{ marginBottom: "0.7rem" }}>
      <SectionLabel icon="book" accentColor={ACCENT.blue.fg}>{t("pl.books")}</SectionLabel>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 3px rgba(26,37,48,0.04)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><MenuIcon name="book" size={17} color="var(--a-blue-fg)" />{selected.length === 0 ? t("pl.allBooks") : t("pl.booksSel", { n: selected.length })}</span>
        <span style={{ color: theme.primarySoft, fontWeight: 700 }}>{open ? t("pl.close") : t("pl.openPick")}</span>
      </button>
      {open && (
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: 13, padding: "12px", marginTop: 8, maxHeight: 260, overflowY: "auto", background: theme.card }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            <button onClick={onSelectAll} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${theme.cardBorder}`, background: theme.primaryBg, color: theme.primarySoft, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t("pl.selectAll")}</button>
            <button onClick={onClear} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "transparent", color: theme.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t("pl.clear")}</button>
          </div>
          {groups.map(group => (
            <div key={group.label ?? "single"} style={{ marginBottom: 4 }}>
              {group.label && <p className="serif" style={{ fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, margin: "4px 0 7px", letterSpacing: 0.2 }}>{group.label}</p>}
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
