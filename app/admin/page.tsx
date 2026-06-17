"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { COURSES } from "@/lib/courses";

interface Row {
  id: string;
  nickname: string;
  prog: Record<string, number>;
  plays: number;
  points: number;
  quiz_answered: number;
  quiz_correct: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [totalQ, setTotalQ] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!isAdmin) return;
    (async () => {
      // 개인 진도는 비공개 — 관리자만 호출 가능한 보안 RPC 로 집계 데이터를 받는다.
      const [{ data, error }, { count }] = await Promise.all([
        supabase.rpc("admin_dashboard"),
        supabase.from("questions").select("*", { count: "exact", head: true }),
      ]);
      setTotalQ(count ?? 0);
      if (error || !data) { setRows([]); return; }
      const list: Row[] = ((data as any[]) ?? []).map((p) => ({
        id: p.id,
        nickname: p.nickname || "익명",
        prog: (p.prog as Record<string, number>) || {},
        plays: p.plays || 0,
        points: p.points || 0,
        quiz_answered: p.quiz_answered || 0,
        quiz_correct: p.quiz_correct || 0,
      }));
      // 진도 합계 → 점수 순 정렬
      list.sort((a, b) => {
        const sa = Object.values(a.prog).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.prog).reduce((x, y) => x + y, 0);
        return sb - sa || b.points - a.points;
      });
      setRows(list);
    })();
  }, [user, isAdmin, loading, router]);

  if (!loading && user && !isAdmin) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center", color: theme.textMuted, minHeight: "60dvh" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🔒</p>
        <p style={{ fontSize: 15, color: theme.text, fontWeight: 700, margin: "0 0 6px" }}>{t("ad.denied")}</p>
        <p style={{ fontSize: 13, margin: "0 0 1.5rem" }}>{t("ad.deniedSub")}</p>
        <button onClick={() => router.push("/")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: theme.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t("r.home")}</button>
      </main>
    );
  }

  return (
    <main className="fade-in" style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("ad.title")}</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("r.home")}</button>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 1.25rem" }}>{t("ad.desc")}</p>

      {rows === null && <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem 0" }}>{t("c.loading")}</p>}
      {rows && rows.length === 0 && <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem 0" }}>{t("ad.empty")}</p>}

      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: theme.gold, fontWeight: 700, margin: "0 0 10px" }}>{t("ad.total", { n: rows.length })}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map(r => (
              <div key={r.id} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{r.nickname}</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{t("ad.quizStat", { p: r.plays, pt: r.points })}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COURSES.map(c => {
                    const done = r.prog[c.slug] || 0;
                    const full = done >= c.lessons.length;
                    return (
                      <span key={c.slug} style={{ fontSize: 11.5, fontWeight: 700, color: full ? theme.correct : done > 0 ? theme.text : theme.textFaint, background: full ? theme.correctBg : theme.goldLight, border: `1px solid ${full ? theme.correct : theme.cardBorder}`, borderRadius: 10, padding: "4px 9px" }}>
                        {c.emoji} {c.title} {done}/{c.lessons.length}{full ? " ✅" : ""}
                      </span>
                    );
                  })}
                </div>
                {/* 성경퀴즈 완주 진도 (푼 문제 수 / 전체 · 정답 수) */}
                <div style={{ marginTop: 8 }}>
                  {(() => {
                    const pct = totalQ > 0 ? Math.round((r.quiz_answered / totalQ) * 100) : 0;
                    return (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: r.quiz_answered > 0 ? theme.primarySoft : theme.textFaint, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "4px 9px" }}>
                        {t("ad.quizProg", { a: r.quiz_answered, t: totalQ || "·", c: r.quiz_correct })}{totalQ > 0 ? ` (${pct}%)` : ""}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem", lineHeight: 1.6 }}>
        ※ 관리자 지정: Supabase profiles 테이블에서 해당 사용자의 is_admin 을 true 로 설정하세요.
      </p>
    </main>
  );
}
