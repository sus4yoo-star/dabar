"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { CATECHISM } from "@/lib/catechism";

export default function CatechismPage() {
  const router = useRouter();
  const [memorize, setMemorize] = useState(false);     // 외우기 모드(답 가림)
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(n: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  }

  return (
    <main className="fade-in" style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 홈</button>
        <button onClick={() => router.push("/catechism/quiz")} style={{ fontSize: 13, fontWeight: 800, color: "#241246", background: theme.gold, border: "none", borderRadius: 16, padding: "7px 16px", cursor: "pointer" }}>🎯 퀴즈</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 38, marginBottom: 4 }}>📜</div>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>웨스트민스터 소교리문답</h1>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>전체 107문답 · 예장 합동 표준</p>
      </div>

      {/* 모드 토글 */}
      <div style={{ display: "flex", gap: 7, marginBottom: "1.25rem" }}>
        {([[false, "📖 전체 보기"], [true, "🧠 외우기(답 가림)"]] as const).map(([val, label]) => {
          const on = memorize === val;
          return (
            <button key={label} onClick={() => { setMemorize(val); setRevealed(new Set()); }}
              style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 14, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{label}</button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATECHISM.map(c => {
          const show = !memorize || revealed.has(c.n);
          return (
            <div key={c.n} onClick={() => memorize && toggle(c.n)}
              style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "14px 16px", cursor: memorize ? "pointer" : "default" }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>제{c.n}문</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: theme.text, margin: "0 0 8px", lineHeight: 1.55 }}>{c.q}</p>
              {show ? (
                <p style={{ fontSize: 14.5, color: theme.textMuted, margin: 0, lineHeight: 1.7 }}>{c.a}</p>
              ) : (
                <p style={{ fontSize: 13, color: theme.primarySoft, margin: 0, fontWeight: 700 }}>👆 눌러서 답 보기</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
