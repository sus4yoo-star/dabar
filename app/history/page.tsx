"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import MenuIcon from "@/components/MenuIcon";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { bookLabel, categoryLabel } from "@/lib/bookNames";
import { WrongAnswer } from "@/lib/types";
import { PageHeader, ACCENT, softShadow, softCard } from "@/lib/ui";
import { useToast } from "@/components/Toast";

export default function HistoryPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user, loading } = useAuth();
  const { show, view: toastView } = useToast();
  const [rows, setRows] = useState<WrongAnswer[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    if (!user) return;
    setError(false); setRows(null);
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
  }

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

  // 권별 오답 수 Top
  const byBook: Record<string, number> = {};
  (rows ?? []).forEach(r => { if (r.book) byBook[r.book] = (byBook[r.book] || 0) + 1; });
  const topBooks = Object.entries(byBook).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // 틀린 문제만 모아 다시 풀기 (최근 20문제)
  async function retryWrong() {
    const ids = Array.from(new Set((rows ?? []).map(r => r.question_id).filter(Boolean))).slice(0, 20) as string[];
    if (!ids.length) { show(t("h.retryNone")); return; }
    const { data, error } = await supabase.from("questions").select("*").in("id", ids);
    if (error || !data || !data.length) { show(t("h.retryFail")); return; }
    sessionStorage.setItem("retryQuiz", JSON.stringify(data));
    sessionStorage.removeItem("quizResult");
    router.push("/quiz");
  }

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <PageHeader title={t("h.title")} homeLabel={t("r.home")} onHome={() => router.push("/")} />

      {rows && rows.length > 0 && (
        <>
          <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 13, background: ACCENT.red.bg, border: `1px solid ${ACCENT.red.border}`, borderRadius: 18, padding: "15px 16px", marginBottom: "0.9rem", boxShadow: softShadow }}>
            <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: ACCENT.red.chip, display: "grid", placeItems: "center" }}><MenuIcon name="list" color={ACCENT.red.fg} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, color: ACCENT.red.fg, fontWeight: 800 }}>{t("h.total", { n: rows.length })}</span>
              {topBooks.length > 0 && (
                <span style={{ display: "block", fontSize: 13, color: theme.textMuted, marginTop: 3, lineHeight: 1.4 }}>
                  {t("h.topBooks", { b: topBooks.map(([b, n]) => `${bookLabel(b, lang)}(${n})`).join(" · ") })}
                </span>
              )}
            </span>
          </div>
          <button onClick={retryWrong} style={{ width: "100%", padding: 15, fontSize: 15.5, fontWeight: 800, background: "linear-gradient(135deg,#a6e02f 0%,#86c40a 100%)", color: "#08263a", border: "none", borderRadius: 16, cursor: "pointer", marginBottom: "1.25rem", boxShadow: "0 8px 24px rgba(88,167,0,0.20)" }}>{t("h.retry")}</button>
        </>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ color: theme.wrong, fontSize: 14, margin: "0 0 12px" }}>{t("h.fail")}</p>
          <button onClick={load} style={{ fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 11, padding: "10px 22px", cursor: "pointer" }}>🔄 {t("common.retry")}</button>
        </div>
      )}
      {!error && rows === null && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>{t("c.loading")}</p>}
      {!error && rows && rows.length === 0 && (
        <div className="fade-in" style={{ textAlign: "center", padding: "2.5rem 1.25rem", marginTop: "1rem", borderRadius: 18, border: `1px solid ${ACCENT.green.border}`, background: ACCENT.green.bg, boxShadow: softShadow }}>
          <span style={{ display: "grid", placeItems: "center", width: 60, height: 60, margin: "0 auto 12px", borderRadius: 18, background: ACCENT.green.chip, fontSize: 32 }}>🎉</span>
          <p style={{ fontSize: 16, color: ACCENT.green.fg, fontWeight: 800, margin: "0 0 5px" }}>{t("h.emptyT")}</p>
          <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>{t("h.emptyS")}</p>
        </div>
      )}

      {!error && rows && rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <div key={r.id} className="fade-in-2" style={softCard({ borderLeft: `4px solid ${theme.wrong}`, padding: "14px 16px" })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: theme.gold, fontWeight: 800 }}>{r.book ? bookLabel(r.book, lang) : ""}{r.category ? ` · ${categoryLabel(r.category, lang)}` : ""}</span>
                <span style={{ fontSize: 11.5, color: theme.textFaint }}>{new Date(r.created_at).toLocaleDateString(lang, { month: "short", day: "numeric" })}</span>
              </div>
              <p style={{ fontSize: 14.5, color: theme.text, margin: "0 0 8px", lineHeight: 1.55 }}>{r.question}</p>
              <p style={{ fontSize: 13.5, color: theme.correct, fontWeight: 700, margin: 0, padding: "7px 11px", borderRadius: 11, background: theme.correctBg }}>{t("r.answerLine", { a: r.correct_answer })}</p>
            </div>
          ))}
        </div>
      )}
      {toastView}
    </main>
  );
}
