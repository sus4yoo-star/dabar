"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types";
import { theme } from "@/lib/theme";
import { renderResultCard } from "@/lib/resultCard";
import { downloadImage, shareViaSheet, shareToKakao, buildShareText } from "@/lib/share";

interface Result { score: number; total: number; answers: { selected: number; correct: boolean }[]; questions: Question[]; }

const GRADES = [
  { min: 90, msg: "🏆 말씀의 달인!", color: theme.correct,  bg: "#e1f5ee" },
  { min: 70, msg: "😊 훌륭해요!",    color: "#854f0b",      bg: "#faeeda" },
  { min: 50, msg: "📖 조금 더!",     color: theme.primary,  bg: theme.primaryBg },
  { min: 0,  msg: "🌱 다시 도전!",   color: theme.wrong,    bg: theme.wrongBg },
];

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) { router.replace("/"); return; }
    try { setResult(JSON.parse(raw)); } catch { router.replace("/"); }
  }, [router]);
  if (!result) return null;

  const pct = Math.round((result.score / result.total) * 100);
  const grade = GRADES.find(g => pct >= g.min)!;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function makeCard(): Promise<Blob | null> {
    try {
      return await renderResultCard({ score: result!.score, total: result!.total, pct, gradeMsg: grade.msg });
    } catch {
      flash("이미지를 만들 수 없는 환경이에요.");
      return null;
    }
  }

  async function onSaveImage() {
    setBusy("save");
    const blob = await makeCard();
    if (blob) { downloadImage(blob); flash("이미지를 저장했어요! 인스타그램 등에 올려보세요."); }
    setBusy(null);
  }

  async function onShareSheet() {
    setBusy("share");
    const blob = await makeCard();
    const url = window.location.origin;
    const text = buildShareText(result!.score, result!.total, pct);
    let ok = false;
    if (blob) ok = await shareViaSheet(blob, text, url);
    if (!ok && blob) { downloadImage(blob); flash("공유가 지원되지 않아 이미지를 저장했어요."); }
    setBusy(null);
  }

  async function onShareKakao() {
    setBusy("kakao");
    const url = window.location.origin;
    const text = buildShareText(result!.score, result!.total, pct);
    const ok = await shareToKakao(text, url);
    if (!ok) {
      // 카카오 키 미설정/실패 → 기기 공유 시트로 폴백
      const blob = await makeCard();
      const shared = blob ? await shareViaSheet(blob, text, url) : false;
      if (!shared) flash("카카오톡 공유 설정이 아직 준비되지 않았어요.");
    }
    setBusy(null);
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: theme.primary, letterSpacing: 3, margin: "0 0 1.5rem" }}>DABAR</p>
      <div style={{ background: grade.bg, borderRadius: 16, padding: "2rem", textAlign: "center", marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 56, fontWeight: 800, color: grade.color, margin: "0 0 4px" }}>{result.score}<span style={{ fontSize: 22, fontWeight: 400 }}> / {result.total}</span></p>
        <p style={{ fontSize: 16, color: grade.color, margin: "0 0 4px" }}>{grade.msg}</p>
        <p style={{ fontSize: 13, color: grade.color, opacity: 0.7, margin: 0 }}>정답률 {pct}%</p>
      </div>

      {/* 공유 / 이미지 저장 */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>결과 공유</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: "1.5rem" }}>
        <ShareBtn onClick={onShareKakao} disabled={!!busy} bg="#FEE500" color="#3c1e1e" loading={busy === "kakao"}>💬 카카오톡</ShareBtn>
        <ShareBtn onClick={onShareSheet} disabled={!!busy} bg={theme.primary} color="#fff" loading={busy === "share"}>📤 공유</ShareBtn>
        <ShareBtn onClick={onSaveImage} disabled={!!busy} bg="#fff" color={theme.primary} border loading={busy === "save"}>📷 이미지</ShareBtn>
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
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: "#fff", color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: 12, cursor: "pointer" }}>홈으로</button>
        <button onClick={() => { sessionStorage.removeItem("quizResult"); router.back(); }} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, background: theme.primary, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer" }}>다시 도전 →</button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: "2rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", background: "rgba(26,26,26,0.92)", color: "#fff", fontSize: 13, padding: "10px 18px", borderRadius: 22, maxWidth: "90%", textAlign: "center", zIndex: 50 }}>{toast}</div>
      )}
    </main>
  );
}

function ShareBtn({ children, onClick, disabled, bg, color, border, loading }: {
  children: React.ReactNode; onClick: () => void; disabled: boolean;
  bg: string; color: string; border?: boolean; loading?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "12px 4px", fontSize: 13, fontWeight: 700, background: bg, color,
      border: border ? `2px solid ${theme.primary}` : "none", borderRadius: 12,
      cursor: disabled ? "default" : "pointer", opacity: disabled && !loading ? 0.6 : 1,
    }}>{loading ? "…" : children}</button>
  );
}
