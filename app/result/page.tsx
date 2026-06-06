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
  { min: 90, msg: "🏆 말씀의 달인!", color: theme.correct,     bg: "rgba(74,214,166,0.16)" },
  { min: 70, msg: "😊 훌륭해요!",    color: theme.gold,        bg: theme.goldLight },
  { min: 50, msg: "📖 조금 더!",     color: theme.primarySoft, bg: theme.primaryBg },
  { min: 0,  msg: "🌱 다시 도전!",   color: theme.wrong,       bg: theme.wrongBg },
];

const MAX_WRONG = 5; // 오답노트에 최대 몇 개까지 보여줄지

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

  useEffect(() => {
    if (!result || authLoading || !user) return;
    if (savedOnce.current || sessionStorage.getItem("quizResultSaved")) { setSaveState("saved"); return; }
    savedOnce.current = true;
    setSaveState("saving");
    const pct = Math.round((result.score / result.total) * 100);
    supabase.from("scores").insert({
      user_id: user.id, score: result.score, total: result.total, percentage: pct,
      testament: result.meta?.testament ?? null, level: result.meta?.level ?? null, book_count: result.meta?.bookCount ?? null,
    }).then(({ error }) => {
      if (error) { setSaveState("error"); return; }
      sessionStorage.setItem("quizResultSaved", "1");
      setSaveState("saved");
    });
  }, [result, user, authLoading]);

  if (!result) return <div style={{ textAlign: "center", padding: "4rem", color: theme.textMuted }}>로딩 중...</div>;

  const pct = Math.round((result.score / result.total) * 100);
  const grade = GRADES.find(g => pct >= g.min)!;

  // 오답만 추려서 오답노트로 (최대 MAX_WRONG개)
  const wrongs = result.questions.map((q, i) => ({ q, i })).filter(({ i }) => !result.answers[i]?.correct);
  const shownWrongs = wrongs.slice(0, MAX_WRONG);

  // 공유 이미지에 넣을 오답노트 (문제 + 정답)
  const imageWrongs = wrongs.map(({ q }) => ({ q: q.question, a: q.options[q.answer] }));

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <p style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 18, fontWeight: 700, color: theme.gold, letterSpacing: 3, margin: "0 0 1.5rem" }}>DABAR</p>

      <div style={{ background: grade.bg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
        <p style={{ fontSize: 58, fontWeight: 800, color: grade.color, margin: "0 0 4px" }}>{result.score}<span style={{ fontSize: 22, fontWeight: 400, color: theme.textMuted }}> / {result.total}</span></p>
        <p style={{ fontSize: 16, color: grade.color, margin: "0 0 4px", fontWeight: 700 }}>{grade.msg}</p>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>정답률 {pct}%</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.25rem", minHeight: 22 }}>
        {!authLoading && !user && (
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            <button onClick={() => router.push("/login")} style={{ color: theme.gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>로그인</button>
            {" "}하면 점수가 저장되고 랭킹에 올라가요
          </span>
        )}
        {user && saveState === "saving" && <span style={{ fontSize: 13, color: theme.textMuted }}>점수 저장 중...</span>}
        {user && saveState === "saved" && <span style={{ fontSize: 13, color: theme.correct }}>✅ 점수가 저장되었어요</span>}
        {user && saveState === "error" && <span style={{ fontSize: 13, color: theme.wrong }}>점수 저장에 실패했어요</span>}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
        <button
          onClick={() => downloadResultImage({ score: result.score, total: result.total, percentage: pct, message: grade.msg, color: grade.color, wrongList: imageWrongs })}
          style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: "transparent", color: theme.gold, border: `1.5px solid ${theme.goldBorder}`, borderRadius: 12, cursor: "pointer" }}
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

      {/* 오답노트 */}
      <p style={{ fontSize: 12, fontWeight: 700, color: theme.gold, letterSpacing: 0.5, marginBottom: 10 }}>📝 오답노트</p>
      {wrongs.length === 0 ? (
        <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 15, color: theme.correct, fontWeight: 700, margin: 0 }}>🎉 만점! 틀린 문제가 없어요</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {shownWrongs.map(({ q }) => (
            <div key={q.id} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderLeft: `3px solid ${theme.wrong}`, borderRadius: 12, padding: "13px 15px" }}>
              <p style={{ fontSize: 12, color: theme.gold, fontWeight: 700, margin: "0 0 5px" }}>{q.book} · {q.category}</p>
              <p style={{ fontSize: 14, color: theme.text, margin: "0 0 8px", lineHeight: 1.55 }}>{q.question}</p>
              <p style={{ fontSize: 13, color: theme.correct, fontWeight: 700, margin: "0 0 4px" }}>정답: {q.options[q.answer]}</p>
              {q.explanation && <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>}
            </div>
          ))}
          {wrongs.length > MAX_WRONG && (
            <p style={{ fontSize: 12.5, color: theme.textMuted, textAlign: "center", margin: "2px 0 0" }}>외 {wrongs.length - MAX_WRONG}개 더 틀렸어요 — 다시 풀며 복습해 보세요!</p>
          )}
        </div>
      )}

      <button onClick={() => router.push("/ranking")} style={{ width: "100%", padding: 13, fontSize: 14, fontWeight: 700, background: theme.goldLight, color: theme.gold, border: `1px solid ${theme.goldBorder}`, borderRadius: 12, cursor: "pointer", marginBottom: 12 }}>🏆 랭킹 보기</button>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: "transparent", color: theme.text, border: `1.5px solid ${theme.border}`, borderRadius: 12, cursor: "pointer" }}>홈으로</button>
        <button onClick={() => { sessionStorage.removeItem("quizResult"); sessionStorage.removeItem("quizResultSaved"); router.back(); }} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>다시 도전 →</button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
