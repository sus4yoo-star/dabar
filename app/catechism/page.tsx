"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { CATECHISM } from "@/lib/catechism";

const MEM_KEY = "dabar_catechism_memorized";
const CATS = ["전체", "하나님", "구원", "십계명", "기도"] as const;

// 문 번호로 분류 (웨스트민스터 구조 기준)
function catOf(n: number): string {
  if (n <= 20) return "하나님";       // 성경·하나님·창조·섭리·죄
  if (n <= 38) return "구원";         // 그리스도·구속·칭의·성화
  if (n <= 84) return "십계명";       // 본분·율법·십계명·죄
  if (n <= 97) return "구원";         // 믿음·회개·말씀·성례(은혜의 방편)
  return "기도";                       // 기도·주기도문
}

export default function CatechismPage() {
  const router = useRouter();
  const [memorize, setMemorize] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [memorized, setMemorized] = useState<Set<number>>(new Set());
  const [cat, setCat] = useState<string>("전체");

  useEffect(() => {
    try { const a = JSON.parse(localStorage.getItem(MEM_KEY) || "[]"); setMemorized(new Set(a)); } catch { /* ignore */ }
  }, []);

  function toggleReveal(n: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  }
  function toggleMemorized(n: number) {
    setMemorized(prev => {
      const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n);
      try { localStorage.setItem(MEM_KEY, JSON.stringify([...s])); } catch { /* ignore */ }
      return s;
    });
  }

  const list = CATECHISM.filter(c => cat === "전체" || catOf(c.n) === cat);
  const memCount = memorized.size;

  return (
    <main className="fade-in" style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 홈</button>
        <button onClick={() => router.push("/catechism/quiz")} style={{ fontSize: 13, fontWeight: 800, color: "#241246", background: theme.gold, border: "none", borderRadius: 16, padding: "7px 16px", cursor: "pointer" }}>🎯 퀴즈</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>📜</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>웨스트민스터 소교리문답</h1>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>전체 107문답 · 예장 합동 표준</p>
      </div>

      {/* 외우기 진도 */}
      <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "12px 16px", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>외운 문답</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: theme.gold }}>{memCount} / 107</span>
        </div>
        <div style={{ height: 8, background: "rgba(0,0,0,0.20)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(memCount / 107) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .4s", borderRadius: 4 }} />
        </div>
      </div>

      {/* 분류 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {CATS.map(c => {
          const on = cat === c;
          return <button key={c} onClick={() => setCat(c)} style={{ padding: "7px 14px", borderRadius: 18, fontSize: 13, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{c}</button>;
        })}
      </div>

      {/* 모드 */}
      <div style={{ display: "flex", gap: 7, marginBottom: "1.1rem" }}>
        {([[false, "📖 전체 보기"], [true, "🧠 외우기(답 가림)"]] as const).map(([val, label]) => {
          const on = memorize === val;
          return <button key={label} onClick={() => { setMemorize(val); setRevealed(new Set()); }} style={{ flex: 1, padding: "10px", borderRadius: 12, fontSize: 14, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{label}</button>;
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map(c => {
          const show = !memorize || revealed.has(c.n);
          const mem = memorized.has(c.n);
          return (
            <div key={c.n} style={{ background: theme.card, border: `1px solid ${mem ? theme.correct : theme.cardBorder}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: theme.gold }}>제{c.n}문 · {catOf(c.n)}</span>
                <button onClick={() => toggleMemorized(c.n)} style={{ fontSize: 11.5, fontWeight: 700, color: mem ? theme.correct : theme.textMuted, background: mem ? theme.correctBg : "transparent", border: `1px solid ${mem ? theme.correct : theme.border}`, borderRadius: 12, padding: "3px 10px", cursor: "pointer" }}>{mem ? "✓ 외움" : "외움 표시"}</button>
              </div>
              <p onClick={() => memorize && toggleReveal(c.n)} style={{ fontSize: 15, fontWeight: 700, color: theme.text, margin: "0 0 8px", lineHeight: 1.55, cursor: memorize ? "pointer" : "default" }}>{c.q}</p>
              {show ? (
                <p style={{ fontSize: 14.5, color: theme.textMuted, margin: 0, lineHeight: 1.7 }}>{c.a}</p>
              ) : (
                <p onClick={() => toggleReveal(c.n)} style={{ fontSize: 13, color: theme.primarySoft, margin: 0, fontWeight: 700, cursor: "pointer" }}>👆 눌러서 답 보기</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
