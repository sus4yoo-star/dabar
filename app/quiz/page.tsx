"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { translateMany } from "@/lib/autoTranslate";

const LEVEL_COLOR: Record<string, string> = { easy: theme.correct, medium: theme.gold, hard: theme.wrong };

// 보기 순서를 매번 섞고 정답 인덱스를 다시 계산 (정답이 한 위치에 몰리지 않게)
function shuffleOptions(q: Question): Question {
  const correctText = q.options[q.answer];
  const opts = [...q.options];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  const ans = opts.indexOf(correctText);
  return { ...q, options: opts, answer: ans < 0 ? q.answer : ans };
}
const prepare = (qs: Question[]) => qs.map(shuffleOptions);

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem", color: theme.textMuted, minHeight: "60dvh" }}>{children}</div>;
}

function QuizInner() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const params = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0); // 연속 정답(콤보)
  const [points, setPoints] = useState(0); // 콤보 보너스 포함 점수
  const [lastGain, setLastGain] = useState(0);
  const [reported, setReported] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const pointsRef = useRef(0);
  const { user } = useAuth();

  useEffect(() => {
    // 오답 다시풀기: /history 에서 넘겨준 문제들이 있으면 그걸로 진행
    const retry = sessionStorage.getItem("retryQuiz");
    if (retry) {
      sessionStorage.removeItem("retryQuiz");
      try {
        const qs = JSON.parse(retry) as Question[];
        if (Array.isArray(qs) && qs.length) { setRetryMode(true); setQuestions(prepare(qs)); setLoading(false); return; }
      } catch { /* 무시하고 일반 출제 */ }
    }
    const level = params.get("level") || "전체";
    const testament = params.get("testament") || "전체";
    const count = params.get("count") || "10";
    const books = params.get("books") || "";
    const qs = new URLSearchParams({ level, testament, count, lang });
    if (books) qs.set("books", books);
    fetch(`/api/questions?${qs.toString()}`)
      .then(r => r.json())
      .then(async data => {
        let arr: Question[] = Array.isArray(data) ? data : [];
        // ko/en/th 외(예: 라오스어)는 DB에 없으면 한국어로 폴백되므로 런타임 자동번역
        if (arr.length && lang && !["ko", "en", "th"].includes(lang)) {
          const strings: string[] = [];
          arr.forEach(q => { strings.push(q.question, ...q.options); if (q.explanation) strings.push(q.explanation); if (q.hint) strings.push(q.hint); });
          const m = await translateMany(strings, lang, "quiz");
          const tr = (s?: string) => (s && m[s]) ? m[s] : (s ?? "");
          arr = arr.map(q => ({ ...q, question: tr(q.question), options: q.options.map(o => tr(o)), explanation: tr(q.explanation), hint: q.hint ? tr(q.hint) : q.hint }));
        }
        setQuestions(prepare(arr)); setLoading(false);
      })
      .catch(() => { setQuestions([]); setLoading(false); });
  }, [lang]);

  async function reportQuestion() {
    if (!user || reported) return;
    setReported(true);
    await supabase.from("question_reports").insert({ question_id: questions[idx]?.id, user_id: user.id, question: questions[idx]?.question, reason: "사용자 신고" });
    alert(t("q.reportAlert"));
  }

  const goNext = useCallback((currentScore: number, currentAnswers: typeof answers) => {
    if (idx + 1 >= questions.length) {
      const meta = {
        testament: params.get("testament") || "전체",
        level: params.get("level") || "전체",
        bookCount: (params.get("books") || "").split(",").filter(Boolean).length,
      };
      sessionStorage.setItem("quizResult", JSON.stringify({ score: currentScore, total: questions.length, points: pointsRef.current, answers: currentAnswers, questions, meta }));
      sessionStorage.removeItem("quizResultSaved");
      sessionStorage.removeItem("wrongsSaved");
      router.push("/result");
    } else {
      setIdx(i => i + 1); setSelected(null); setShowHint(false); setTimeLeft(15); setReported(false);
    }
  }, [idx, questions, router, params]);

  useEffect(() => {
    if (selected !== null || loading || !questions.length) return;
    setTimeLeft(15);
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
    if (correct) {
      const newStreak = streak + 1;
      const combo = Math.min((newStreak - 1) * 5, 25); // 연속 정답 보너스
      const gained = 10 + combo + timeLeft;             // 기본10 + 콤보 + 남은시간(빠를수록 ↑)
      pointsRef.current += gained;
      setScore(s => s + 1);
      setStreak(newStreak);
      setPoints(pointsRef.current);
      setLastGain(gained);
    } else {
      setStreak(0);
      setLastGain(0);
    }
    setAnswers(prev => [...prev, { selected: i, correct }]);
  }

  if (loading) return <Center>{t("q.loading")}</Center>;
  if (!questions.length) return <Center>{t("q.none")}</Center>;
  const q = questions[idx];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem", minHeight: "100dvh" }}>
      {/* 나가기 — 진행 중에도 홈으로 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>{t("cat.exit")}</button>
      </div>
      {!!lang && !["ko", "en", "th"].includes(lang) && (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "5px 9px", textAlign: "center" }}>⚠ 자동 번역 (현지 검수 권장)</p>
      )}
      {/* 전체 진행바 */}
      <div style={{ height: 6, background: "rgba(13,52,84,0.12)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${((idx + 1) / questions.length) * 100}%`, transition: "width .35s ease", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{retryMode && <span style={{ color: theme.primarySoft }}>🔁 </span>}{idx + 1}/{questions.length} · <span style={{ color: theme.gold }}>⭐{points}</span></span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: LEVEL_COLOR[q.level], fontWeight: 700 }}>{t("q." + q.level)}</span>
          {streak >= 2 && <span key={streak} className="anim-pop" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, color: theme.gold, fontWeight: 800 }}>{t("q.combo", { n: streak })}</span>}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: timeLeft <= 5 ? theme.wrong : theme.textMuted }}>⏱ {timeLeft}{t("q.sec")}</span>
      </div>
      <div style={{ height: 5, background: "rgba(13,52,84,0.12)", borderRadius: 3, marginBottom: 20 }}>
        <div style={{ height: "100%", background: timeLeft <= 5 ? theme.wrong : `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${(timeLeft / 15) * 100}%`, transition: "width 1s linear", borderRadius: 3 }} />
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
          <p style={{ fontWeight: 700, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? `${t("q.correct")} ${t("q.pts", { n: lastGain })}${streak >= 2 ? "  " + t("q.combo", { n: streak }) : ""}` : t("q.answerIs", { a: q.options[q.answer] })}</p>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
          <button onClick={reportQuestion} disabled={reported} style={{ marginTop: 9, fontSize: 12, color: theme.textFaint, background: "none", border: "none", cursor: reported ? "default" : "pointer", textDecoration: "underline", padding: 0 }}>{reported ? t("q.reported") : t("q.report")}</button>
        </div>
      )}
      {selected === null && (
        <button onClick={() => setShowHint(v => !v)} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", marginBottom: 12 }}>{showHint ? t("q.hintHide") : t("q.hintShow")}</button>
      )}
      {showHint && selected === null && (
        <p style={{ fontSize: 13, color: theme.text, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, padding: "10px 14px", borderRadius: 8, marginBottom: 12, lineHeight: 1.6 }}>{q.hint}</p>
      )}
      {selected !== null && (
        <button onClick={() => goNext(score, answers)} style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>{idx + 1 >= questions.length ? t("q.result") : t("q.next")}</button>
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
