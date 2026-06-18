"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { getCourse, LessonQuestion } from "@/lib/courses";
import { markDone } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useAutoCourse } from "@/lib/autoTranslate";
import { supabase } from "@/lib/supabase";
import { PageHeader, ACCENT, softCard } from "@/lib/ui";

const STATIC_LANGS = ["ko", "en", "th"];

// 보기 순서를 섞고 정답 인덱스를 다시 계산 (정답이 늘 1번에 오지 않도록)
function shuffleOptions(q: LessonQuestion): LessonQuestion {
  const correct = q.options[q.answer];
  const opts = [...q.options];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  const ans = opts.indexOf(correct);
  return { ...q, options: opts, answer: ans < 0 ? q.answer : ans };
}

export default function LessonPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const params = useParams<{ slug: string; lessonId: string }>();
  const isAuto = !!lang && !STATIC_LANGS.includes(lang);
  const { course } = useAutoCourse(getCourse(params.slug, isAuto ? "ko" : lang), lang);
  const lesson = course?.lessons.find(l => l.id === params.lessonId);

  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  // 이 과의 문제들 — 보기를 한 번 섞어 고정(과가 바뀌면 다시 섞임)
  const quiz = useMemo(() => (lesson ? lesson.questions.map(shuffleOptions) : []), [lesson]);

  if (!course || !lesson) {
    return <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center", color: theme.textMuted }}>
      {t("co.lessonNotFound")} <button onClick={() => router.push("/")} style={{ color: theme.gold, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{t("r.home")}</button>
    </main>;
  }

  const lessonIdx = course.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = course.lessons[lessonIdx + 1];
  const q = quiz[qIdx];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) {
      setCorrectCount(c => c + 1);
    } else if (user) {
      // 틀린 문제를 오답노트에 기록 (성경퀴즈와 동일하게). 과정 문제는 question_id 없음(null)
      supabase.from("wrong_answers").insert({
        user_id: user.id,
        question_id: null,
        book: course!.title,
        category: lesson!.label ?? `${lesson!.id}과`,
        question: q.question,
        correct_answer: q.options[q.answer],
      }).then(() => {});
    }
  }
  function nextQ() {
    if (qIdx + 1 >= quiz.length) {
      markDone(course!.slug, lesson!.id);
      if (user) supabase.from("lesson_progress").upsert({ user_id: user.id, course: course!.slug, lesson: lesson!.id }, { onConflict: "user_id,course,lesson" }).then(() => {});
      setPhase("done");
    } else {
      setQIdx(i => i + 1); setSelected(null);
    }
  }

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <PageHeader
        title={lesson.label ?? `${lesson.id}과`}
        onHome={() => router.push(`/course/${course.slug}`)}
        homeLabel={t("c.back")}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: theme.gold, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.emoji} {course.title}</span>}
      />

      {/* 배우기 */}
      {phase === "learn" && (
        <div className="fade-in-2">
          <h1 style={{ fontSize: 23, fontWeight: 800, color: theme.text, margin: "0 0 14px", lineHeight: 1.35 }}>{lesson.label ?? `${lesson.id}과`}. {lesson.title}</h1>
          <div style={{ ...softCard({ background: ACCENT.green.bg, border: `1px solid ${theme.goldBorder}`, borderLeft: `4px solid ${theme.goldSoft}` }), padding: "15px 17px", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: theme.text, fontStyle: "italic", margin: "0 0 6px", fontFamily: "'Iowan Old Style',Georgia,serif" }}>“{lesson.verse}”</p>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.gold, margin: 0 }}>— {lesson.verseRef}</p>
          </div>
          {lesson.teaching.map((para, i) => (
            <p key={i} style={{ fontSize: 15.5, lineHeight: 1.8, color: theme.text, margin: "0 0 14px" }}>{para}</p>
          ))}
          <button onClick={() => setPhase("quiz")} style={{ width: "100%", padding: 16, fontSize: 16, fontWeight: 800, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", marginTop: 8, boxShadow: "0 8px 20px rgba(31,155,239,0.22)" }}>{t("co.startQuiz")}</button>
        </div>
      )}

      {/* 문제 */}
      {phase === "quiz" && (
        <div className="fade-in-2">
          <div style={{ height: 8, background: "rgba(13,52,84,0.12)", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((qIdx + 1) / quiz.length) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .3s ease", borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 12.5, color: theme.textMuted, fontWeight: 700, margin: "0 0 8px" }}>{qIdx + 1} / {quiz.length}</p>
          <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.6, color: theme.text, marginBottom: "1.25rem" }}>{q.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {q.options.map((opt, i) => {
              let bg = theme.card, border = `1px solid ${theme.border}`, color = theme.text;
              if (selected !== null) {
                if (i === q.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
                else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
              }
              const anim = selected === null ? "" : i === q.answer ? "anim-pop" : i === selected ? "anim-shake" : "";
              return (
                <button key={i} className={anim} onClick={() => choose(i)} style={{ padding: "15px 16px", textAlign: "left", fontSize: 15, lineHeight: 1.5, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", boxShadow: selected === null ? "0 3px 12px rgba(23,50,73,0.05)" : "none" }}>
                  <span style={{ fontWeight: 700, marginRight: 10, color: i === q.answer && selected !== null ? theme.correct : theme.gold }}>{"①②③④"[i]}</span>{opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="fade-in" style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 12, background: selected === q.answer ? theme.correctBg : theme.wrongBg, border: `1px solid ${selected === q.answer ? theme.correct : theme.wrong}` }}>
              <p style={{ fontWeight: 800, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? t("q.correct") : t("q.answerIs", { a: q.options[q.answer] })}</p>
              <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
            </div>
          )}
          {selected !== null && (
            <button onClick={nextQ} className="fade-in" style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 800, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(31,155,239,0.22)" }}>{qIdx + 1 >= quiz.length ? t("co.finishLesson") : t("q.next")}</button>
          )}
        </div>
      )}

      {/* 수료 */}
      {phase === "done" && (
        <div className="fade-in" style={{ textAlign: "center", paddingTop: "1.5rem" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.correct, margin: "0 0 6px" }}>{(lesson.label ?? `${lesson.id}과`)} {t("co.lessonDone")}</h2>
          <p style={{ fontSize: 15, color: theme.text, margin: "0 0 4px" }}>{lesson.title}</p>
          <p style={{ fontSize: 14, color: theme.textMuted, margin: "0 0 2rem" }}>{t("co.scoreLine", { total: quiz.length, n: correctCount })}</p>
          {nextLesson ? (
            <button onClick={() => { setPhase("learn"); setQIdx(0); setSelected(null); setCorrectCount(0); router.push(`/course/${course.slug}/${nextLesson.id}`); }}
              style={{ width: "100%", padding: 16, fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#2bb069 0%,#178a50 100%)", color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: 10, boxShadow: "0 8px 20px rgba(88,167,0,0.20)" }}>{t("co.nextLesson")}</button>
          ) : (
            <div style={{ ...softCard({ background: theme.correctBg, border: `1px solid ${theme.correct}` }), padding: "14px", marginBottom: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: theme.correct, margin: 0 }}>{t("co.lastLesson", { t: course.title })}</p>
            </div>
          )}
          <button onClick={() => router.push(`/course/${course.slug}`)} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, background: theme.card, color: theme.text, border: `1.5px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer" }}>{t("co.toList")}</button>
        </div>
      )}
    </main>
  );
}
