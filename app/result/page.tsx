"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";

interface Result { score: number; total: number; answers: { selected: number; correct: boolean }[]; questions: Question[]; }

const GRADES = [
  { min: 90, msg: "🏆 말씀의 달인!", color: theme.correct,  bg: "#e1f5ee" },
  { min: 70, msg: "😊 훌륭해요!",    color: "#854f0b",      bg: "#faeeda" },
  { min: 50, msg: "📖 조금 더!",     color: theme.primary,  bg: theme.primaryBg },
  { min: 0,  msg: "🌱 다시 도전!",   color: theme.wrong,    bg: theme.wrongBg },
];

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) { router.replace("/"); return; }
    try { setResult(JSON.parse(raw)); } catch { router.replace("/"); }
  }, [router]);
  if (!result) return null;

  const pct = Math.round((result.score / result.total) * 100);
  const grade = GRADES.find(g => pct >= g.min)!;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: theme.primary, letterSpacing: 3, margin: "0 0 1.5rem" }}>DABAR</p>
      <div style={{ background: grade.bg, borderRadius: 16, padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 56, fontWeight: 800, color: grade.color, margin: "0 0 4px" }}>{result.score}<span style={{ fontSize: 22, fontWeight: 400 }}> / {result.total}</span></p>
        <p style={{ fontSize: 16, color: grade.color, margin: "0 0 4px" }}>{grade.msg}</p>
        <p style={{ fontSize: 13, color: grade.color, opacity: 0.7, margin: 0 }}>정답률 {pct}%</p>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>문제별 결과</p>
      <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${theme.border}`, marginBottom: "1.5rem" }}>
        {result.questions.map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < result.questions.length - 1 ? `1px solid #f0f0f0` : "none", background: "#fff" }}>
            <span style={{ fontSize: 16, minWidth: 20 }}>{result.answers[i]?.correct ? "✅" : "❌"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: theme.text, margin: "0 0 2px" }}>{q.question}</p>
              {!result.answers[i]?.correct && (<p style={{ fontSize: 12, color: theme.primary, margin: 0, fontWeight: 600 }}>정답: {q.options[q.answer]}</p>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: "#fff", color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: 12, cursor: "pointer" }}>홈으로</button>
        <button onClick={() => { sessionStorage.removeItem("quizResult"); router.back(); }} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>다시 도전 →</button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
