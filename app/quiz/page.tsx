"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { translateMany } from "@/lib/autoTranslate";
import { fetchQuizProgress, upsertQuizProgress, clearQuizProgress } from "@/lib/quizProgress";

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

// 권별 완주 진도율 (예: 창세기 80/100)
function BookProgressList({ allQ, result }: { allQ: Question[]; result: Record<string, "o" | "x"> }) {
  const byBook = new Map<string, { a: number; t: number }>();
  allQ.forEach(q => { const b = byBook.get(q.book) ?? { a: 0, t: 0 }; b.t++; if (result[q.id]) b.a++; byBook.set(q.book, b); });
  return (
    <div style={{ textAlign: "left", maxWidth: 360, margin: "0 auto", maxHeight: 240, overflowY: "auto", border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "8px 12px", background: theme.card }}>
      {[...byBook.entries()].map(([book, s]) => {
        const pct = s.t ? Math.round((s.a / s.t) * 100) : 0;
        return (
          <div key={book} style={{ margin: "7px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.text, marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>{book}</span>
              <span style={{ color: pct === 100 ? theme.correct : theme.textMuted, fontWeight: 700 }}>{s.a}/{s.t}{pct === 100 ? " ✓" : ""}</span>
            </div>
            <div style={{ height: 5, background: "rgba(13,52,84,0.12)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? theme.correct : `linear-gradient(90deg,${theme.primarySoft},${theme.gold})`, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuizInner() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const params = useSearchParams();
  // 빠짐없이 풀기(완주) 모드 — 범위 내 전 문제를 순서대로, 타이머 없이, 이어풀기
  const complete = params.get("complete") === "1";
  const progressKey = `dabar_complete|${lang}|${params.get("testament") || "전체"}|${params.get("level") || "전체"}|${params.get("books") || ""}`;
  const [doneAll, setDoneAll] = useState(false);
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
  const [autoTranslated, setAutoTranslated] = useState(false); // 런타임 자동번역이 실제로 적용됐을 때만 배너 표시
  const pointsRef = useRef(0);
  const syncedRef = useRef(false);
  const { user } = useAuth();
  // 완주 모드용: 전체 문제 + 문제별 결과(o/x) + 현재 하위모드(all/wrong) + 진도 패널
  const [allQ, setAllQ] = useState<Question[]>([]);
  const [result, setResult] = useState<Record<string, "o" | "x">>({});
  const [mode, setMode] = useState<"all" | "wrong">("all");
  const [showProgress, setShowProgress] = useState(false);
  const saveResult = (r: Record<string, "o" | "x">) => { setResult(r); try { localStorage.setItem(progressKey, JSON.stringify(r)); } catch { /* */ } };

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
    const qs = new URLSearchParams({ level, testament, lang });
    if (complete) qs.set("complete", "1"); else qs.set("count", count);
    if (books) qs.set("books", books);
    fetch(`/api/questions?${qs.toString()}`)
      .then(r => r.json())
      .then(async data => {
        let arr: Question[] = Array.isArray(data) ? data : [];
        // ko/en/th 외(예: 라오스어)는 DB에 없으면 한국어로 폴백 → 런타임 자동번역.
        // 단, DB에 이미 해당 언어(lo) 문제가 있으면(검수본) 재번역하지 않음.
        if (arr.length && lang && !["ko", "en", "th"].includes(lang) && arr[0]?.lang !== lang) {
          const strings: string[] = [];
          arr.forEach(q => { strings.push(q.question, ...q.options); if (q.explanation) strings.push(q.explanation); if (q.hint) strings.push(q.hint); });
          const m = await translateMany(strings, lang, "quiz");
          const tr = (s?: string) => (s && m[s]) ? m[s] : (s ?? "");
          arr = arr.map(q => ({ ...q, question: tr(q.question), options: q.options.map(o => tr(o)), explanation: tr(q.explanation), hint: q.hint ? tr(q.hint) : q.hint }));
          setAutoTranslated(true); // 실제 자동번역된 경우에만 배너 표시 (생성된 정식 문제는 표시 안 함)
        }
        const prepared = prepare(arr);
        if (complete) {
          setAllQ(prepared);
          let r: Record<string, "o" | "x"> = {};
          try { const p = JSON.parse(localStorage.getItem(progressKey) || "{}"); if (p && typeof p === "object" && !Array.isArray(p)) r = p; } catch { /* */ }
          setResult(r);
          const active = prepared.filter(q => !r[q.id]); // 이어풀기: 아직 안 푼 문제만
          setQuestions(active);
          setIdx(0);
          if (!active.length) setDoneAll(true); // 이미 다 풀었으면 완주 화면
        } else {
          setQuestions(prepared);
        }
        setLoading(false);
      })
      .catch(() => { setQuestions([]); setLoading(false); });
  }, [lang]);

  // 로그인 진도 동기화: 들어올 때 1회 DB 진도를 합쳐 이어풀기(기기 간)
  useEffect(() => {
    if (!complete || !user || !allQ.length || syncedRef.current || mode !== "all") return;
    syncedRef.current = true;
    fetchQuizProgress(user.id).then(db => {
      if (!Object.keys(db).length) return;
      const merged = { ...result, ...db };
      saveResult(merged);
      const active = allQ.filter(qq => !merged[qq.id]);
      setQuestions(active);
      setIdx(0);
      if (!active.length) setDoneAll(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, user, allQ.length]);

  async function reportQuestion() {
    if (!user || reported) return;
    setReported(true);
    await supabase.from("question_reports").insert({ question_id: questions[idx]?.id, user_id: user.id, question: questions[idx]?.question, reason: "사용자 신고" });
    alert(t("q.reportAlert"));
  }

  const goNext = useCallback((currentScore: number, currentAnswers: typeof answers) => {
    if (complete) {
      // 완주 모드: 결과는 답할 때마다 저장됨. 마지막이면 완주 화면, 아니면 다음 문제.
      if (idx + 1 >= questions.length) setDoneAll(true);
      else { setIdx(i => i + 1); setSelected(null); setShowHint(false); setReported(false); }
      return;
    }
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
    if (complete) return; // 완주(학습) 모드는 타이머 없음
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
    if (complete) {
      // 완주 모드: 문제별 정답/오답 기록 (로컬 + 로그인 시 DB 동기화)
      saveResult({ ...result, [questions[idx].id]: correct ? "o" : "x" });
      if (user) upsertQuizProgress(user.id, questions[idx].id, correct);
    }
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

  function restartComplete() {
    try { localStorage.removeItem(progressKey); } catch { /* */ }
    if (user) { syncedRef.current = true; clearQuizProgress(user.id, allQ.map(qq => qq.id)); } // 이 범위 DB 진도도 초기화
    setResult({}); setMode("all"); setQuestions(allQ); setIdx(0);
    setSelected(null); setShowHint(false); setReported(false); setDoneAll(false);
  }
  function startWrong() {
    const wrong = allQ.filter(qq => result[qq.id] === "x");
    if (!wrong.length) return;
    setMode("wrong"); setQuestions(wrong); setIdx(0);
    setSelected(null); setShowHint(false); setReported(false); setDoneAll(false);
  }
  const answeredCount = complete ? allQ.filter(qq => result[qq.id]).length : 0;

  if (loading) return <Center>{t("q.loading")}</Center>;
  if (complete && doneAll) {
    const oCount = allQ.filter(qq => result[qq.id] === "o").length;
    const xCount = allQ.filter(qq => result[qq.id] === "x").length;
    const btn = (bg: string, color: string, border: string) => ({ display: "block", width: "100%", maxWidth: 340, margin: "0 auto 10px", padding: 14, fontSize: 15, fontWeight: 700, background: bg, color, border, borderRadius: 12, cursor: "pointer" } as React.CSSProperties);
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🎓</div>
        <p style={{ fontSize: 17, fontWeight: 800, color: theme.gold, margin: "0 0 6px" }}>{t("q.studyDone")}</p>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 18px" }}>{t("q.studyScore", { o: oCount, x: xCount, t: allQ.length })}</p>
        {xCount > 0 && <button onClick={startWrong} style={btn(theme.wrongBg, theme.wrong, `1px solid ${theme.wrong}`)}>{t("q.retryWrong", { n: xCount })}</button>}
        <p style={{ fontSize: 12, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "16px 0 8px" }}>{t("q.bookProg")}</p>
        <BookProgressList allQ={allQ} result={result} />
        <div style={{ height: 14 }} />
        <button onClick={restartComplete} style={btn(theme.primary, "#fff", "none")}>{t("q.restart")}</button>
        <button onClick={() => router.push("/")} style={btn("transparent", theme.text, `1px solid ${theme.border}`)}>{t("r.home")}</button>
      </main>
    );
  }
  if (!questions.length) return <Center>{t("q.none")}</Center>;
  const q = questions[idx];
  if (!q) return <Center>{t("q.none")}</Center>;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem", minHeight: "100dvh" }}>
      {/* 나가기 — 진행 중에도 홈으로 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>{t("cat.exit")}</button>
      </div>
      {autoTranslated && (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "5px 9px", textAlign: "center" }}>{t("c.autoTrans")}</p>
      )}
      {/* 전체 진행바 */}
      <div style={{ height: 6, background: "rgba(13,52,84,0.12)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${complete ? (allQ.length ? (answeredCount / allQ.length) * 100 : 0) : ((idx + 1) / questions.length) * 100}%`, transition: "width .35s ease", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: complete ? 12 : 10 }}>
        {complete ? (
          <button onClick={() => setShowProgress(s => !s)} style={{ fontSize: 13, fontWeight: 700, color: theme.text, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
            {mode === "wrong" && <span style={{ color: theme.wrong }}>❌ </span>}📚 {answeredCount}/{allQ.length} <span style={{ color: theme.gold }}>{showProgress ? "▴" : "▾"}</span>
          </button>
        ) : (
          <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>
            {retryMode && <span style={{ color: theme.primarySoft }}>🔁 </span>}{idx + 1}/{questions.length} · <span style={{ color: theme.gold }}>⭐{points}</span>
          </span>
        )}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.cardBorder}`, color: LEVEL_COLOR[q.level], fontWeight: 700 }}>{t("q." + q.level)}</span>
          {!complete && streak >= 2 && <span key={streak} className="anim-pop" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, color: theme.gold, fontWeight: 800 }}>{t("q.combo", { n: streak })}</span>}
        </div>
        {complete
          ? <button onClick={restartComplete} style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 12, padding: "4px 10px", cursor: "pointer" }}>{t("q.restart")}</button>
          : <span style={{ fontSize: 14, fontWeight: 700, color: timeLeft <= 5 ? theme.wrong : theme.textMuted }}>⏱ {timeLeft}{t("q.sec")}</span>}
      </div>
      {complete && showProgress && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "0 0 6px 2px" }}>{t("q.bookProg")}</p>
          <BookProgressList allQ={allQ} result={result} />
        </div>
      )}
      {!complete && (
        <div style={{ height: 5, background: "rgba(13,52,84,0.12)", borderRadius: 3, marginBottom: 20 }}>
          <div style={{ height: "100%", background: timeLeft <= 5 ? theme.wrong : `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, width: `${(timeLeft / 15) * 100}%`, transition: "width 1s linear", borderRadius: 3 }} />
        </div>
      )}
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
          <p style={{ fontWeight: 700, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? (complete ? t("q.correct") : `${t("q.correct")} ${t("q.pts", { n: lastGain })}${streak >= 2 ? "  " + t("q.combo", { n: streak }) : ""}`) : t("q.answerIs", { a: q.options[q.answer] })}</p>
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
        <button onClick={() => goNext(score, answers)} style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>{!complete && idx + 1 >= questions.length ? t("q.result") : t("q.next")}</button>
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
