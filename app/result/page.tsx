"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { downloadResultImage } from "@/lib/resultImage";
import { isKakaoConfigured, shareResultToKakao } from "@/lib/kakao";

interface ResultMeta { testament?: string; level?: string; bookCount?: number; }
interface Result {
  score: number; total: number;
  answers: { selected: number; correct: boolean }[];
  questions: Question[];
  meta?: ResultMeta;
}

const GRADES = [
  { min: 90, msg: "🏆 말씀의 달인!", color: theme.correct,  bg: "#e1f5ee" },
  { min: 70, msg: "😊 훌륭해요!",    color: "#854f0b",      bg: "#faeeda" },
  { min: 50, msg: "📖 조금 더!",     color: theme.primary,  bg: theme.primaryBg },
  { min: 0,  msg: "🌱 다시 도전!",   color: theme.wrong,    bg: theme.wrongBg },
];

export default function ResultPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedOnce = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) return;
    try { setResult(JSON.parse(raw)); } catch { sessionStorage.removeItem("quizResult"); }
  }, []);

  // 로그인한 사용자라면 점수를 한 번만 DB 에 기록한다.
  useEffect(() => {
    if (!result || authLoading || !user) return;
    if (savedOnce.current || sessionStorage.getItem("quizResultSaved")) { setSaveState("saved"); return; }
    savedOnce.current = true;
    setSaveState("saving");
    const pct = Math.round((result.score / result.total) * 100);
    supabase.from("scores").insert({
      user_id: user.id,
      score: result.score,
      total: result.total,
      percentage: pct,
      testament: result.meta?.testament ?? null,
      level: result.meta?.level ?? null,
      book_count: result.meta?.bookCount ?? null,
    }).then(({ error }) => {
      if (error) { setSaveState("error"); return; }
      sessionStorage.setItem("quizResultSaved", "1");
      setSaveState("saved");
    });
  }, [result, user, authLoading]);

  if (!result) return <div style={{ textAlign: "center", padding: "4rem", color: "#aaa" }}>로딩 중...</div>;

  const pct = Math.round((result.score / result.total) * 100);
  const grade = GRADES.find(g => pct >= g.min)!;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: theme.primary, letterSpacing: 3, margin: "0 0 1.5rem" }}>DABAR</p>
      <div style={{ background: grade.bg, borderRadius: 16, padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
        <p style={{ fontSize: 56, fontWeight: 800, color: grade.color, margin: "0 0 4px" }}>{result.score}<span style={{ fontSize: 22, fontWeight: 400 }}> / {result.total}</span></p>
        <p style={{ fontSize: 16, color: grade.color, margin: "0 0 4px" }}>{grade.msg}</p>
        <p style={{ fontSize: 13, color: grade.color, opacity: 0.7, margin: 0 }}>정답률 {pct}%</p>
      </div>

      {/* 점수 저장 상태 / 로그인 유도 */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem", minHeight: 22 }}>
        {!authLoading && !user && (
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            <button onClick={() => router.push("/login")} style={{ color: theme.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>로그인</button>
            {" "}하면 점수가 저장되고 랭킹에 올라가요
          </span>
        )}
        {user && saveState === "saving" && <span style={{ fontSize: 13, color: theme.textMuted }}>점수 저장 중...</span>}
        {user && saveState === "saved" && <span style={{ fontSize: 13, color: theme.correct }}>✅ 점수가 저장되었어요</span>}
        {user && saveState === "error" && <span style={{ fontSize: 13, color: theme.wrong }}>점수 저장에 실패했어요</span>}
      </div>

      {/* 공유 / 이미지 저장 */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
        <button
          onClick={() => downloadResultImage({ score: result.score, total: result.total, percentage: pct, message: grade.msg, color: grade.color })}
          style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: "#fff", color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: 12, cursor: "pointer" }}
        >🖼️ 이미지 저장</button>
        <button
          onClick={async () => {
            if (!isKakaoConfigured()) { alert("카카오 공유가 아직 설정되지 않았어요."); return; }
            try { await shareResultToKakao({ score: result.score, total: result.total, percentage: pct, message: grade.msg }); }
            catch { alert("공유에 실패했어요. 잠시 후 다시 시도해 주세요."); }
          }}
          style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: "#FEE500", color: "#191600", border: "none", borderRadius: 12, cursor: "pointer" }}
        >💬 카카오 공유</button>
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

      <button onClick={() => router.push("/ranking")} style={{ width: "100%", padding: 13, fontSize: 14, fontWeight: 700, background: theme.primaryBg, color: theme.primary, border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 12 }}>🏆 랭킹 보기</button>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: "#fff", color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: 12, cursor: "pointer" }}>홈으로</button>
        <button onClick={() => { sessionStorage.removeItem("quizResult"); sessionStorage.removeItem("quizResultSaved"); router.back(); }} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>다시 도전 →</button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
