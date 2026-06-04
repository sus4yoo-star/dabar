"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";

const LEVEL_KO: Record<string, string> = { easy: "쉬움", medium: "보통", hard: "어려움" };
const LEVEL_COLOR: Record<string, string> = { easy: theme.correct, medium: "#ba7517", hard: theme.wrong };

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem", color: "#aaa" }}>{children}</div>;
}

function QuizInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const level = params.get("level") || "전체";
    const testament = params.get("testament") || "전체";
    const count = params.get("count") || "10";
    fetch(`/api/questions?level=${level}&testament=${testament}&count=${count}`)
      .then(r => r.json()).then(data => { setQuestions(data); setLoading(false); });
  }, []);

  const goNext = useCallback((currentScore: number, currentAnswers: typeof answers) => {
    if (idx + 1 >= questions.length) {
      sessionStorage.setItem("quizResult", JSON.stringify({ score: currentScore, total: questions.length, answers: currentAnswers, questions }));
      router.push("/result");
    } else {
      setIdx(i => i + 1); setSelected(null); setShowHint(false); setTimeLeft(30);
    }
  }, [idx, questions, router]);

  useEffect(() => {
    if (selected !== null || loading || !questions.length) return;
    setTimeLeft(30);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setAnswers(a => { const next = [...a, { selected: -1, correct: false }]; goNext(score, next); return next; }); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, selected, loading]);

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === questions[idx].answer;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected: i, correct }]);
  }

  if (loading) return <Center>문제를 불러오는 중...</Center>;
  if (!questions.length) return <Center>문제가 없습니다.</Center>;
  const q = questions[idx];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: theme.textMuted }}>{idx + 1} / {questions.length}</span>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.primaryBg, color: LEVEL_COLOR[q.level], fontWeight: 700 }}>{LEVEL_KO[q.level]}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: timeLeft <= 10 ? theme.wrong : theme.textMuted }}>⏱ {timeLeft}초</span>
      </div>
      <div style={{ height: 4, background: "#e8e4f3", borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: "100%", background: theme.primary, width: `${(timeLeft / 30) * 100}%`, transition: "width 1s linear", borderRadius: 2 }} />
      </div>
      <p style={{ fontSize: 12, color: theme.gold, fontWeight: 700, margin: "0 0 8px", letterSpacing: 0.5 }}>{q.book} · {q.category}</p>
      <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.65, color: theme.text, marginBottom: "1.5rem" }}>{q.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        {q.options.map((opt, i) => {
          let bg = "#fff", border = `1px solid ${theme.border}`, color = theme.text;
          if (selected !== null) {
            if (i === q.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
            else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} style={{ padding: "13px 16px", textAlign: "left", fontSize: 15, borderRadius: 10, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", transition: "all 0.12s" }}>
              <span style={{ fontWeight: 700, marginRight: 10, color: theme.primary }}>{"①②③④"[i]}</span>{opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 12, background: selected === q.answer ? theme.correctBg : theme.wrongBg, border: `1px solid ${selected === q.answer ? "#5dcaa5" : "#f09595"}` }}>
          <p style={{ fontWeight: 700, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? "🎉 정답!" : `💡 정답: ${q.options[q.answer]}`}</p>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{q.explanation}</p>
        </div>
      )}
      {selected === null && (
        <button onClick={() => setShowHint(v => !v)} style={{ fontSize: 13, color: theme.textMuted, background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", marginBottom: 12 }}>💡 힌트 {showHint ? "숨기기" : "보기"}</button>
      )}
      {showHint && selected === null && (
        <p style={{ fontSize: 13, color: "#555", background: theme.goldLight, padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>{q.hint}</p>
      )}
      {selected !== null && (
        <button onClick={() => goNext(score, answers)} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>{idx + 1 >= questions.length ? "결과 보기 →" : "다음 문제 →"}</button>
      )}
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<Center>로딩 중...</Center>}>
      <QuizInner />
    </Suspense>
  );
}
