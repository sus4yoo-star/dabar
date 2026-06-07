"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { getCourse } from "@/lib/courses";
import { getCompleted } from "@/lib/progress";

export default function CoursePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const course = getCourse(params.slug);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => { setDone(getCompleted()); }, []);

  if (!course) {
    return <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center", color: theme.textMuted }}>
      과정을 찾을 수 없어요. <button onClick={() => router.push("/")} style={{ color: theme.gold, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>홈으로</button>
    </main>;
  }

  const total = course.lessons.length;
  const completed = course.lessons.filter(l => done[`${course.slug}/${l.id}`]).length;
  const allDone = completed === total;

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 홈</button>
        <span style={{ fontSize: 13, color: theme.gold, fontWeight: 700 }}>{completed} / {total} 수료</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 44, marginBottom: 6 }}>{course.emoji}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>{course.title} 과정</h1>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>{course.subtitle}</p>
      </div>

      {/* 진도바 */}
      <div style={{ height: 8, background: "rgba(0,0,0,0.20)", borderRadius: 4, marginBottom: "1.5rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${total ? (completed / total) * 100 : 0}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .4s ease", borderRadius: 4 }} />
      </div>

      {allDone && (
        <div style={{ background: "rgba(74,224,168,0.14)", border: `1px solid ${theme.correct}`, borderRadius: 14, padding: "16px", textAlign: "center", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: theme.correct, margin: "0 0 2px" }}>🎉 {course.title} 과정 수료!</p>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>모든 과를 마쳤어요. 정말 잘하셨습니다!</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {course.lessons.map(l => {
          const isDoneL = !!done[`${course.slug}/${l.id}`];
          return (
            <button key={l.id} onClick={() => router.push(`/course/${course.slug}/${l.id}`)}
              style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", padding: "15px 16px", borderRadius: 14, border: `1px solid ${isDoneL ? theme.correct : theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text }}>
              <span style={{ fontSize: 18, minWidth: 26, textAlign: "center" }}>{isDoneL ? "✅" : <span style={{ color: theme.gold, fontWeight: 800 }}>{l.id}</span>}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: theme.text }}>{l.id}과. {l.title}</span>
                <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{isDoneL ? "수료 완료" : "배우고 문제 풀기"}</span>
              </span>
              <span style={{ fontSize: 16, color: theme.gold }}>→</span>
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem", lineHeight: 1.6 }}>
        ※ 본 교육 내용은 v1 초안입니다. 교회·교단에 맞게 검토 후 사용하세요.
      </p>
    </main>
  );
}
