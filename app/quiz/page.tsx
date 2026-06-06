"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";

const LEVEL_KO: Record<string, string> = { easy: "쉬움", medium: "보통", hard: "어려움" };
const LEVEL_COLOR: Record<string, string> = { easy: theme.correct, medium: theme.gold, hard: theme.wrong };

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem", color: theme.textMuted, minHeight: "60dvh" }}>{children}</div>;
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
  const [streak, setStreak] = useState(0); // 연속 정답(콤보)

  useEffect(() => {
    const level = params.get("level") || "전체";
    const testament = params.get("testament") || "전체";
    const count = params.get("count") || "10";
    const books = params.get("books") || "";
    const qs = new URLSearchParams({ level, testament, count });
    if (books) qs.set("books", books);
    fetch(`/api/questions?${qs.toString()}`)
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setQuestions([]); setLoading(false); });
  }, []);

  const goNext = useCallback((currentScore: number, currentAnswers: typeof answers) => {
    if (idx + 1 >= questions.length) {
      const meta = {
        testament: params.get("testament") || "전체",
        level: params.get("level") || "전체",
        bookCount: (params.get("books") || "").split(",").filter(Boolean).length,
      };
      sessionStorage.setItem("quizResult", JSON.stringify({ score: currentScore, total: questions.length, answers: currentAnswers, questions, meta }));
      sessionStorage.removeItem("quizResultSaved");
      router.push("/result");
    } else {
      setIdx(i => i + 1); setSelected(null); setShowHint(false); setTimeLeft(30);
    }
  }, [idx, questions, router, params]);

  useEffect(() => {
    if (selected !== null || loading || !questions.length) return;
    setTimeLeft(30);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setStreak(0); setAnswers(a => { const next = [...a, { selected: -1, correct: false }]; goNext(score, next); return next; }); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, selected, loading]);

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === questions[idx].answer;
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); } else { setStreak(0); }
    setAnswers(prev => [...prev, { selected: i, correct }]);
  }

  if (loading) return <Center>문제를 불러오는 중...</Center>;
  if (!questions.length) return <Center>문제가 없습니다.</Center>;
  const q = questions[idx];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem", minHeight: "100dvh" }}>
      {/* 전체 진행바 */}
      <div style={{ height: 6, background: "rgba(0,0,0,0.20)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${((idx + 1) / questions.length) * 100}%`, transition: "width .35s ease", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{idx + 1} / {questions.length}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: LEVEL_COLOR[q.level], fontWeight: 700 }}>{LEVEL_KO[q.level]}</span>
          {streak >= 2 && <span key={streak} className="anim-pop" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, color: theme.gold, fontWeight: 800 }}>🔥 {streak}연속</span>}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: timeLeft <= 10 ? theme.wrong : theme.textMuted }}>⏱ {timeLeft}초</span>
      </div>
      <div style={{ height: 5, background: "rgba(0,0,0,0.20)", borderRadius: 3, marginBottom: 20 }}>
        <div style={{ height: "100%", background: timeLeft <= 10 ? theme.wrong : `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${(timeLeft / 30) * 100}%`, transition: "width 1s linear", borderRadius: 3 }} />
      </div>
      <div key={idx} className="fade-in">
        <p style={{ fontSize: 12, color: theme.gold, fontWeight: 700, margin: "0 0 8px", letterSpacing: 0.5 }}>{q.book} · {q.category}</p>
        <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.65, color: theme.text, marginBottom: "1.5rem" }}>{q.question}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
        {q.options.map((opt, i) => {
          let bg = theme.card, border = `1px solid ${theme.border}`, color = theme.text;
          if (selected !== null) {
            if (i === q.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
            else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
          }
          const anim = selected === null ? "" : i === q.answer ? "anim-pop" : i === selected ? "anim-shake" : "";
          return (
            <button key={i} className={anim} onClick={() => handleSelect(i)} style={{ padding: "14px 16px", textAlign: "left", fontSize: 15, borderRadius: 12, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", transition: "background .15s, border-color .15s, color .15s" }}>
              <span style={{ fontWeight: 700, marginRight: 10, color: i === q.answer && selected !== null ? theme.correct : theme.gold }}>{"①②③④"[i]}</span>{opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="fade-in" style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 12, background: selected === q.answer ? theme.correctBg : theme.wrongBg, border: `1px solid ${selected === q.answer ? theme.correct : theme.wrong}` }}>
          <p style={{ fontWeight: 700, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? `🎉 정답!${streak >= 2 ? `  🔥 ${streak}연속!` : ""}` : `💡 정답: ${q.options[q.answer]}`}</p>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
        </div>
      )}
      {selected === null && (
        <button onClick={() => setShowHint(v => !v)} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", marginBottom: 12 }}>💡 힌트 {showHint ? "숨기기" : "보기"}</button>
      )}
      {showHint && selected === null && (
        <p style={{ fontSize: 13, color: theme.text, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, padding: "10px 14px", borderRadius: 8, marginBottom: 12, lineHeight: 1.6 }}>{q.hint}</p>
      )}
      {selected !== null && (
        <button onClick={() => goNext(score, answers)} style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>{idx + 1 >= questions.length ? "결과 보기 →" : "다음 문제 →"}</button>
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
