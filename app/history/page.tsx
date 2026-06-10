"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { WrongAnswer } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<WrongAnswer[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    supabase
      .from("wrong_answers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) { setError(true); return; }
        setRows((data ?? []) as WrongAnswer[]);
      });
  }, [user, loading, router]);

  // 권별 오답 수 Top
  const byBook: Record<string, number> = {};
  (rows ?? []).forEach(r => { if (r.book) byBook[r.book] = (byBook[r.book] || 0) + 1; });
  const topBooks = Object.entries(byBook).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // 틀린 문제만 모아 다시 풀기 (최근 20문제)
  async function retryWrong() {
    const ids = Array.from(new Set((rows ?? []).map(r => r.question_id).filter(Boolean))).slice(0, 20) as string[];
    if (!ids.length) { alert(t("h.retryNone")); return; }
    const { data, error } = await supabase.from("questions").select("*").in("id", ids);
    if (error || !data || !data.length) { alert(t("h.retryFail")); return; }
    sessionStorage.setItem("retryQuiz", JSON.stringify(data));
    sessionStorage.removeItem("quizResult");
    router.push("/quiz");
  }

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("h.title")}</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("r.home")}</button>
      </div>

      {rows && rows.length > 0 && (
        <>
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: "0.9rem" }}>
            <p style={{ fontSize: 13, color: theme.text, margin: "0 0 6px", fontWeight: 700 }}>{t("h.total", { n: rows.length })}</p>
            {topBooks.length > 0 && (
              <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>
                {t("h.topBooks", { b: topBooks.map(([b, n]) => `${b}(${n})`).join(" · ") })}
              </p>
            )}
          </div>
          <button onClick={retryWrong} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg,#a6e02f 0%,#86c40a 100%)", color: "#08263a", border: "none", borderRadius: 14, cursor: "pointer", marginBottom: "1.25rem", boxShadow: "0 8px 24px rgba(216,190,110,0.22)" }}>{t("h.retry")}</button>
        </>
      )}

      {error && <p style={{ textAlign: "center", color: theme.wrong, fontSize: 14, padding: "2rem 0" }}>{t("h.fail")}</p>}
      {!error && rows === null && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>{t("c.loading")}</p>}
      {!error && rows && rows.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: theme.textMuted }}>
          <p style={{ fontSize: 40, margin: "0 0 10px" }}>🎉</p>
          <p style={{ fontSize: 15, color: theme.text, fontWeight: 700, margin: "0 0 4px" }}>{t("h.emptyT")}</p>
          <p style={{ fontSize: 13, margin: 0 }}>{t("h.emptyS")}</p>
        </div>
      )}

      {!error && rows && rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <div key={r.id} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderLeft: `3px solid ${theme.wrong}`, borderRadius: 12, padding: "13px 15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: theme.gold, fontWeight: 700 }}>{r.book ?? ""}{r.category ? ` · ${r.category}` : ""}</span>
                <span style={{ fontSize: 11, color: theme.textFaint }}>{new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
              </div>
              <p style={{ fontSize: 14, color: theme.text, margin: "0 0 7px", lineHeight: 1.55 }}>{r.question}</p>
              <p style={{ fontSize: 13, color: theme.correct, fontWeight: 700, margin: 0 }}>{t("r.answerLine", { a: r.correct_answer })}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
