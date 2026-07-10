"use client";
export const dynamic = "force-dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { downloadResultImage } from "@/lib/resultImage";
import { shareResult } from "@/lib/share";
import { useI18n } from "@/lib/i18n";
import { bookLabel, categoryLabel } from "@/lib/bookNames";
import { SectionLabel, ACCENT, softShadow, cardShadow, softCard } from "@/lib/ui";

interface ResultMeta { testament?: string; level?: string; bookCount?: number; }
interface Result {
  score: number; total: number; points?: number;
  answers: { selected: number; correct: boolean }[];
  questions: Question[];
  meta?: ResultMeta;
}

const GRADES = [
  { min: 90, key: "r.grade90", color: theme.correct,     bg: "rgba(74,214,166,0.16)" },
  { min: 70, key: "r.grade70", color: theme.gold,        bg: theme.goldLight },
  { min: 50, key: "r.grade50", color: theme.primarySoft, bg: theme.primaryBg },
  { min: 0,  key: "r.grade0",  color: theme.wrong,       bg: theme.wrongBg },
];

const MAX_WRONG = 5; // 오답노트에 최대 몇 개까지 보여줄지

export default function ResultPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedOnce = useRef(false);

  // 결과 데이터가 없으면(직접 방문·새 탭·세션 만료) 영원한 로딩 대신 홈으로 보낸다.
  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    let parsed: Result | null = null;
    if (raw) { try { parsed = JSON.parse(raw); } catch { sessionStorage.removeItem("quizResult"); } }
    if (parsed) setResult(parsed);
    else router.replace("/");
  }, [router]);

  const saveScore = useCallback(async (r: Result, uid: string) => {
    setSaveState("saving");
    const pct = Math.round((r.score / r.total) * 100);
    const { error } = await supabase.from("scores").insert({
      user_id: uid, score: r.score, total: r.total, points: r.points ?? 0, percentage: pct,
      testament: r.meta?.testament ?? null, level: r.meta?.level ?? null, book_count: r.meta?.bookCount ?? null,
    });
    if (error) {
      console.error("[DABAR] score save error:", error);
      setSaveState("error");
      return;
    }
    sessionStorage.setItem("quizResultSaved", "1");
    setSaveState("saved");

    // 오답 히스토리 저장 (한 번만)
    if (!sessionStorage.getItem("wrongsSaved")) {
      const rows = r.questions
        .filter((q, i) => !r.answers[i]?.correct)
        .map(q => ({ user_id: uid, question_id: q.id, book: q.book, category: q.category, question: q.question, correct_answer: q.options[q.answer] }));
      if (rows.length === 0) { sessionStorage.setItem("wrongsSaved", "1"); return; }
      const { error: we } = await supabase.from("wrong_answers").insert(rows);
      if (!we) sessionStorage.setItem("wrongsSaved", "1");
      else console.error("[DABAR] wrong save error:", we);
    }
  }, []);

  useEffect(() => {
    if (!result || authLoading || !user) return;
    if (sessionStorage.getItem("quizResultSaved")) { setSaveState("saved"); return; }
    if (savedOnce.current) return;
    savedOnce.current = true;
    saveScore(result, user.id);
  }, [result, user, authLoading, saveScore]);

  if (!result) return <div style={{ textAlign: "center", padding: "4rem", color: theme.textMuted }}>{t("c.loading")}</div>;

  const pct = Math.round((result.score / result.total) * 100);
  const grade = GRADES.find(g => pct >= g.min)!;
  const gradeMsg = t(grade.key);

  // 오답만 추려서 오답노트로 (최대 MAX_WRONG개)
  const wrongs = result.questions.map((q, i) => ({ q, i })).filter(({ i }) => !result.answers[i]?.correct);
  const shownWrongs = wrongs.slice(0, MAX_WRONG);

  // 공유 이미지에 넣을 오답노트 (문제 + 정답)
  const imageWrongs = wrongs.map(({ q }) => ({ q: q.question, a: q.options[q.answer] }));

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 1.25rem 1.4rem", minHeight: "100dvh" }}>
      <p style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 18, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: 3, paddingLeft: 3, margin: "0 0 0.9rem", textAlign: "center" }}>DABAR</p>

      {/* 점수 히어로 — 그라데이션 + 아이콘 칩으로 보상감 강조 */}
      <div className="fade-in" style={{ background: `linear-gradient(135deg, ${grade.bg} 0%, ${theme.card} 88%)`, border: `1px solid ${theme.cardBorder}`, borderRadius: 22, padding: "1.9rem 1.5rem", textAlign: "center", marginBottom: "1rem", boxShadow: cardShadow }}>
        <div style={{ width: 60, height: 60, margin: "0 auto 12px", borderRadius: 18, background: grade.bg, display: "grid", placeItems: "center", fontSize: 30, boxShadow: softShadow }}>
          {pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "💪" : "🌱"}
        </div>
        <p style={{ fontSize: 60, fontWeight: 800, color: grade.color, margin: "0 0 2px", lineHeight: 1 }}>{result.score}<span style={{ fontSize: 22, fontWeight: 400, color: theme.textMuted }}> / {result.total}</span></p>
        <p style={{ fontSize: 16.5, color: grade.color, margin: "8px 0 4px", fontWeight: 800 }}>{gradeMsg}</p>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>{t("r.accuracy", { n: pct })}</p>
        {!!result.points && (
          <p style={{ display: "inline-block", fontSize: 14.5, color: theme.primarySoft, fontWeight: 800, margin: "12px 0 0", padding: "5px 14px", borderRadius: 999, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}` }}>{t("r.points", { n: result.points })}</p>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.25rem", minHeight: 22 }}>
        {!authLoading && !user && (
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            <button onClick={() => router.push("/login")} style={{ color: theme.primarySoft, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>{t("common.login")}</button>
            {" "}{t("r.loginSave")}
          </span>
        )}
        {user && saveState === "saving" && <span style={{ fontSize: 13, color: theme.textMuted }}>{t("r.saving")}</span>}
        {user && saveState === "saved" && <span style={{ fontSize: 13, color: theme.correct }}>{t("r.saved")}</span>}
        {user && saveState === "error" && (
          <span style={{ fontSize: 13, color: theme.wrong }}>
            {t("r.saveFail")}{"  "}
            <button onClick={() => user && saveScore(result, user.id)} style={{ color: theme.primarySoft, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>{t("r.saveRetry")}</button>
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
        <button
          onClick={() => downloadResultImage({ score: result.score, total: result.total, percentage: pct, message: gradeMsg, color: grade.color, wrongList: imageWrongs })}
          style={{ flex: 1, padding: 14, fontSize: 14.5, fontWeight: 800, background: theme.primaryBg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", boxShadow: softShadow }}
        >{t("r.imgSave")}</button>
        <button
          onClick={() => shareResult({ score: result.score, total: result.total, percentage: pct, message: gradeMsg })}
          style={{ flex: 1, padding: 14, fontSize: 14.5, fontWeight: 800, background: "#FEE500", color: "#191600", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: softShadow }}
        >{t("r.share")}</button>
      </div>

      {/* 오답노트 */}
      <SectionLabel icon="list" accentColor={ACCENT.blue.fg}>{t("r.wrongNote")}</SectionLabel>
      {wrongs.length === 0 ? (
        <div style={{ ...softCard({ borderRadius: 16, padding: "22px 16px", marginBottom: "1.5rem", background: ACCENT.green.bg, border: `1px solid ${theme.goldBorder}` }), textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>✨</div>
          <p style={{ fontSize: 15.5, color: theme.correct, fontWeight: 800, margin: 0 }}>{t("r.perfect")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {shownWrongs.map(({ q }) => (
            <div key={q.id} style={{ ...softCard({ borderRadius: 14, padding: "14px 16px", background: ACCENT.red.bg, border: `1px solid ${ACCENT.red.border}`, borderLeft: `3px solid ${theme.wrong}` }) }}>
              <p style={{ fontSize: 12, color: theme.primarySoft, fontWeight: 800, margin: "0 0 5px" }}>{bookLabel(q.book, lang)} · {categoryLabel(q.category, lang)}</p>
              <p style={{ fontSize: 14, color: theme.text, margin: "0 0 8px", lineHeight: 1.55 }}>{q.question}</p>
              <p style={{ fontSize: 13, color: theme.correct, fontWeight: 800, margin: "0 0 4px" }}>{t("r.answerLine", { a: q.options[q.answer] })}</p>
              {q.explanation && <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>}
            </div>
          ))}
          {wrongs.length > MAX_WRONG && (
            <p style={{ fontSize: 12.5, color: theme.textMuted, textAlign: "center", margin: "2px 0 0" }}>{t("r.more", { n: wrongs.length - MAX_WRONG })}</p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => router.push("/ranking")} style={{ flex: 1, padding: 14, fontSize: 14.5, fontWeight: 800, background: theme.primaryBg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", boxShadow: softShadow }}>{t("r.ranking")}</button>
        {user && <button onClick={() => router.push("/history")} style={{ flex: 1, padding: 14, fontSize: 14.5, fontWeight: 800, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", boxShadow: softShadow }}>{t("r.myNotes")}</button>}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, padding: 15, fontSize: 15, fontWeight: 800, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", boxShadow: softShadow }}>{t("r.home")}</button>
        <button onClick={() => { sessionStorage.removeItem("quizResult"); sessionStorage.removeItem("quizResultSaved"); router.back(); }} style={{ flex: 1, padding: 15, fontSize: 15, fontWeight: 800, background: theme.primary, color: "#fff", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 22px rgba(31,155,239,0.22)" }}>{t("r.again")}</button>
      </div>
      <button onClick={() => router.push("/play")} style={{ width: "100%", marginTop: 14, padding: "13px 14px", fontSize: 13.5, fontWeight: 800, background: ACCENT.blue.bg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", lineHeight: 1.4, boxShadow: softShadow }}>{t("r.tryComplete")}</button>
      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
