"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { CATECHISM, Catechism } from "@/lib/catechism";

const N = 10; // 한 회 문항 수

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

interface QItem { item: Catechism; options: string[]; answer: number; }

function buildQuiz(): QItem[] {
  const picks = shuffle(CATECHISM).slice(0, N);
  return picks.map(item => {
    const distractors = shuffle(CATECHISM.filter(c => c.n !== item.n)).slice(0, 3).map(c => c.a);
    const options = shuffle([item.a, ...distractors]);
    return { item, options, answer: options.indexOf(item.a) };
  });
}

export default function CatechismQuiz() {
  const router = useRouter();
  const { t } = useI18n();
  const [quiz, setQuiz] = useState<QItem[]>(() => buildQuiz());
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = quiz[idx];
  const pct = useMemo(() => Math.round((score / quiz.length) * 100), [score, quiz.length]);

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === cur.answer) setScore(s => s + 1);
  }
  function next() {
    if (idx + 1 >= quiz.length) { setDone(true); return; }
    setIdx(i => i + 1); setSelected(null);
  }
  function restart() {
    setQuiz(buildQuiz()); setIdx(0); setSelected(null); setScore(0); setDone(false);
  }

  if (done) {
    return (
      <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", minHeight: "100dvh", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "😊" : "🌱"}</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>{score} / {quiz.length}</h1>
        <p style={{ fontSize: 15, color: theme.textMuted, margin: "0 0 2rem" }}>{t("cat.quizDone", { n: pct })}</p>
        <button onClick={restart} style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#e6cf86 0%,#c9a84c 100%)", color: "#241246", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: 10 }}>{t("c.retry")}</button>
        <button onClick={() => router.push("/catechism")} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, background: "transparent", color: theme.text, border: `1.5px solid ${theme.border}`, borderRadius: 12, cursor: "pointer" }}>{t("cat.toCat")}</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ height: 6, background: "rgba(0,0,0,0.20)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((idx + 1) / quiz.length) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .3s", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>{idx + 1} / {quiz.length}</span>
        <button onClick={() => router.push("/catechism")} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>{t("cat.exit")}</button>
      </div>

      <p style={{ fontSize: 12, fontWeight: 800, color: theme.gold, margin: "0 0 6px" }}>{t("cat.qno", { n: cur.item.n })}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color: theme.text, lineHeight: 1.55, marginBottom: "1.25rem" }}>{cur.item.q}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cur.options.map((opt, i) => {
          let bg = theme.card, border = `1px solid ${theme.border}`, color = theme.text;
          if (selected !== null) {
            if (i === cur.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
            else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
          }
          const anim = selected === null ? "" : i === cur.answer ? "anim-pop" : i === selected ? "anim-shake" : "";
          return (
            <button key={i} className={anim} onClick={() => choose(i)} style={{ padding: "13px 15px", textAlign: "left", fontSize: 13.5, lineHeight: 1.6, borderRadius: 12, background: bg, border, color, cursor: selected !== null ? "default" : "pointer" }}>{opt}</button>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={next} className="fade-in" style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", marginTop: 14 }}>{idx + 1 >= quiz.length ? t("q.result") : t("q.next")}</button>
      )}
    </main>
  );
}
