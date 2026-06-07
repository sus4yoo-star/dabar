"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { getCourse } from "@/lib/courses";
import { markDone } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LessonPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams<{ slug: string; lessonId: string }>();
  const course = getCourse(params.slug);
  const lesson = course?.lessons.find(l => l.id === params.lessonId);

  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  if (!course || !lesson) {
    return <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center", color: theme.textMuted }}>
      과를 찾을 수 없어요. <button onClick={() => router.push("/")} style={{ color: theme.gold, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>홈으로</button>
    </main>;
  }

  const lessonIdx = course.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = course.lessons[lessonIdx + 1];
  const q = lesson.questions[qIdx];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setCorrectCount(c => c + 1);
  }
  function nextQ() {
    if (qIdx + 1 >= lesson!.questions.length) {
      markDone(course!.slug, lesson!.id);
      if (user) supabase.from("lesson_progress").upsert({ user_id: user.id, course: course!.slug, lesson: lesson!.id }, { onConflict: "user_id,course,lesson" }).then(() => {});
      setPhase("done");
    } else {
      setQIdx(i => i + 1); setSelected(null);
    }
  }

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <button onClick={() => router.push(`/course/${course.slug}`)} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 목록</button>
        <span style={{ fontSize: 13, color: theme.gold, fontWeight: 700 }}>{course.emoji} {course.title} · {lesson.label ?? `${lesson.id}과`}</span>
      </div>

      {/* 배우기 */}
      {phase === "learn" && (
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: theme.text, margin: "0 0 14px", lineHeight: 1.35 }}>{lesson.label ?? `${lesson.id}과`}. {lesson.title}</h1>
          <div style={{ background: theme.card, border: `1px solid ${theme.goldBorder}`, borderLeft: `3px solid ${theme.goldSoft}`, borderRadius: 14, padding: "14px 16px", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#f4f0ff", fontStyle: "italic", margin: "0 0 6px" }}>“{lesson.verse}”</p>
            <p style={{ fontSize: 12.5, color: theme.gold, margin: 0 }}>— {lesson.verseRef}</p>
          </div>
          {lesson.teaching.map((para, i) => (
            <p key={i} style={{ fontSize: 15.5, lineHeight: 1.8, color: theme.text, margin: "0 0 14px" }}>{para}</p>
          ))}
          <button onClick={() => setPhase("quiz")} style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", marginTop: 8 }}>문제 풀기 →</button>
        </div>
      )}

      {/* 문제 */}
      {phase === "quiz" && (
        <div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.20)", borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((qIdx + 1) / lesson.questions.length) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .3s ease", borderRadius: 3 }} />
          </div>
          <p style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, margin: "0 0 8px" }}>{qIdx + 1} / {lesson.questions.length}</p>
          <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.6, color: theme.text, marginBottom: "1.25rem" }}>{q.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {q.options.map((opt, i) => {
              let bg = theme.card, border = `1px solid ${theme.border}`, color = theme.text;
              if (selected !== null) {
                if (i === q.answer) { bg = theme.correctBg; border = `2px solid ${theme.correct}`; color = theme.correct; }
                else if (i === selected) { bg = theme.wrongBg; border = `2px solid ${theme.wrong}`; color = theme.wrong; }
              }
              const anim = selected === null ? "" : i === q.answer ? "anim-pop" : i === selected ? "anim-shake" : "";
              return (
                <button key={i} className={anim} onClick={() => choose(i)} style={{ padding: "14px 16px", textAlign: "left", fontSize: 15, borderRadius: 12, background: bg, border, color, cursor: selected !== null ? "default" : "pointer" }}>
                  <span style={{ fontWeight: 700, marginRight: 10, color: i === q.answer && selected !== null ? theme.correct : theme.gold }}>{"①②③④"[i]}</span>{opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="fade-in" style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 12, background: selected === q.answer ? theme.correctBg : theme.wrongBg, border: `1px solid ${selected === q.answer ? theme.correct : theme.wrong}` }}>
              <p style={{ fontWeight: 700, color: selected === q.answer ? theme.correct : theme.wrong, margin: "0 0 4px" }}>{selected === q.answer ? "🎉 정답!" : `💡 정답: ${q.options[q.answer]}`}</p>
              <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
            </div>
          )}
          {selected !== null && (
            <button onClick={nextQ} style={{ width: "100%", padding: 15, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>{qIdx + 1 >= lesson.questions.length ? "이 과 마치기 →" : "다음 문제 →"}</button>
          )}
        </div>
      )}

      {/* 수료 */}
      {phase === "done" && (
        <div style={{ textAlign: "center", paddingTop: "1.5rem" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.correct, margin: "0 0 6px" }}>{lesson.label ?? `${lesson.id}과`} 수료!</h2>
          <p style={{ fontSize: 15, color: theme.text, margin: "0 0 4px" }}>{lesson.title}</p>
          <p style={{ fontSize: 14, color: theme.textMuted, margin: "0 0 2rem" }}>{lesson.questions.length}문제 중 {correctCount}문제 정답</p>
          {nextLesson ? (
            <button onClick={() => { setPhase("learn"); setQIdx(0); setSelected(null); setCorrectCount(0); router.push(`/course/${course.slug}/${nextLesson.id}`); }}
              style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#e6cf86 0%,#c9a84c 100%)", color: "#241246", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: 10 }}>다음 과로 →</button>
          ) : (
            <div style={{ background: "rgba(74,224,168,0.14)", border: `1px solid ${theme.correct}`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: theme.correct, margin: 0 }}>🏅 {course.title} 과정의 마지막 과예요!</p>
            </div>
          )}
          <button onClick={() => router.push(`/course/${course.slug}`)} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, background: "transparent", color: theme.text, border: `1.5px solid ${theme.border}`, borderRadius: 12, cursor: "pointer" }}>과정 목록으로</button>
        </div>
      )}
    </main>
  );
}
