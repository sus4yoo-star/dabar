"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { getCatechism, Catechism } from "@/lib/catechism";
import { useAutoTranslate } from "@/lib/autoTranslate";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { ACCENT } from "@/lib/ui";

const N = 10; // 한 회 문항 수

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

interface QItem { item: Catechism; options: string[]; answer: number; }

function buildQuiz(list: Catechism[]): QItem[] {
  const picks = shuffle(list).slice(0, N);
  return picks.map(item => {
    const distractors = shuffle(list.filter(c => c.n !== item.n)).slice(0, 3).map(c => c.a);
    const options = shuffle([item.a, ...distractors]);
    return { item, options, answer: options.indexOf(item.a) };
  });
}

export default function CatechismQuiz() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  // ko/en/th 외(예: 라오스어)는 한국어 원문을 런타임 자동번역(요리문답 페이지와 캐시 공유)
  const STATIC = ["ko", "en", "th"];
  const isAuto = !!lang && !STATIC.includes(lang);
  const base = getCatechism(isAuto ? "ko" : lang);
  const { out: tq, auto, loading: lq } = useAutoTranslate(base.map(c => c.q), lang, "cat_q");
  const { out: ta, loading: la } = useAutoTranslate(base.map(c => c.a), lang, "cat_a");
  const items = useMemo(
    () => base.map((c, i) => (auto ? { ...c, q: tq[i] ?? c.q, a: ta[i] ?? c.a } : c)),
    [base, auto, tq, ta]
  );
  const ready = !auto || (!lq && !la);

  const [round, setRound] = useState(0);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // 번역 준비가 끝나면 그 시점의 items 로 퀴즈 생성 (retry 는 round 증가)
  const quiz = useMemo(() => (ready ? buildQuiz(items) : []), [ready, round, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = quiz[idx];
  const pct = quiz.length ? Math.round((score / quiz.length) * 100) : 0;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === cur.answer) {
      setScore(s => s + 1);
    } else if (user) {
      // 틀린 문제를 오답노트에 기록 (소요리문답은 question_id 없음)
      supabase.from("wrong_answers").insert({
        user_id: user.id,
        question_id: null,
        book: "소요리문답",
        category: t("cat.qno", { n: cur.item.n }),
        question: cur.item.q,
        correct_answer: cur.item.a,
      }).then(() => {});
    }
  }
  function next() {
    if (idx + 1 >= quiz.length) { setDone(true); return; }
    setIdx(i => i + 1); setSelected(null);
  }
  function restart() {
    setRound(r => r + 1); setIdx(0); setSelected(null); setScore(0); setDone(false);
  }

  // 자동번역 준비 중
  if (auto && !ready) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "4rem 1.25rem", minHeight: "60dvh", textAlign: "center", color: theme.textMuted }}>
        {t("c.loading")}
      </main>
    );
  }

  if (done) {
    return (
      <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", minHeight: "100dvh", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, margin: "0 auto 10px", borderRadius: 21, background: ACCENT.green.chip, display: "grid", placeItems: "center", fontSize: 40 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "😊" : "🌱"}</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>{score} / {quiz.length}</h1>
        <p style={{ fontSize: 15, color: theme.textMuted, margin: "0 0 2rem" }}>{t("cat.quizDone", { n: pct })}</p>
        <button onClick={restart} style={{ width: "100%", padding: 16, fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#2bb069 0%,#178a50 100%)", color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: 10, boxShadow: "0 8px 20px rgba(88,167,0,0.20)" }}>{t("c.retry")}</button>
        <button onClick={() => router.push("/catechism")} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, background: theme.card, color: theme.text, border: `1.5px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer" }}>{t("cat.toCat")}</button>
      </main>
    );
  }

  return (
    <main className="fade-in" style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ height: 8, background: "rgba(13,52,84,0.12)", borderRadius: 4, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((idx + 1) / quiz.length) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .3s", borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 700 }}>{idx + 1} / {quiz.length}</span>
        <button onClick={() => router.push("/catechism")} style={{ fontSize: 12.5, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>{t("cat.exit")}</button>
      </div>

      <div className="fade-in-2" style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: ACCENT.blue.bg, boxShadow: "0 3px 12px rgba(23,50,73,0.05)", padding: "16px 17px", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: theme.gold, margin: "0 0 6px" }}>{t("cat.qno", { n: cur.item.n })}</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: theme.text, lineHeight: 1.6, margin: 0 }}>{cur.item.q}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cur.options.map((opt, i) => {
          let bg = theme.card, border = `1px solid ${theme.border}`, color = theme.text;
          if (selected !== null) {
            if (i === cur.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
            else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
          }
          const anim = selected === null ? "" : i === cur.answer ? "anim-pop" : i === selected ? "anim-shake" : "";
          return (
            <button key={i} className={anim} onClick={() => choose(i)} style={{ padding: "14px 16px", minHeight: 44, textAlign: "left", fontSize: 14, lineHeight: 1.6, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", boxShadow: selected === null ? "0 3px 12px rgba(23,50,73,0.05)" : "none" }}>{opt}</button>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={next} className="fade-in" style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 800, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", marginTop: 14, boxShadow: "0 8px 20px rgba(31,155,239,0.22)" }}>{idx + 1 >= quiz.length ? t("q.result") : t("q.next")}</button>
      )}
    </main>
  );
}
