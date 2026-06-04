"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "@/lib/theme";

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
  const [testament, setTestament] = useState("전체");
  const [level, setLevel]         = useState("전체");
  const [count, setCount]         = useState(10);

  function start() {
    router.push(`/quiz?level=${level}&testament=${testament}&count=${count}`);
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem 2rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: theme.primary, letterSpacing: 4, margin: "0 0 4px" }}>DABAR</h1>
        <p style={{ fontSize: 13, color: theme.gold, fontWeight: 600, letterSpacing: 1, margin: "0 0 4px" }}>다바르 · 말씀</p>
        <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>성경 퀴즈 — 남녀노소 누구나!</p>
      </div>

      <Section title="성경 구분"><ChipGroup items={TESTAMENTS} value={testament} onChange={setTestament} /></Section>
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
