"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { COURSES } from "@/lib/courses";

interface Row {
  id: string;
  nickname: string;
  prog: Record<string, number>;
  plays: number;
  points: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!isAdmin) return;
    (async () => {
      const [{ data: profiles }, { data: prog }, { data: scores }] = await Promise.all([
        supabase.from("profiles").select("id, nickname"),
        supabase.from("lesson_progress").select("user_id, course, lesson"),
        supabase.from("scores").select("user_id, points"),
      ]);
      const progMap: Record<string, Record<string, number>> = {};
      (prog ?? []).forEach((r: any) => { (progMap[r.user_id] ||= {})[r.course] = (progMap[r.user_id]?.[r.course] || 0) + 1; });
      const scoreMap: Record<string, { plays: number; points: number }> = {};
      (scores ?? []).forEach((s: any) => { const m = (scoreMap[s.user_id] ||= { plays: 0, points: 0 }); m.plays++; m.points += s.points || 0; });
      const list: Row[] = (profiles ?? []).map((p: any) => ({
        id: p.id, nickname: p.nickname || "익명",
        prog: progMap[p.id] || {},
        plays: scoreMap[p.id]?.plays || 0,
        points: scoreMap[p.id]?.points || 0,
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
        <p style={{ fontSize: 15, color: theme.text, fontWeight: 700, margin: "0 0 6px" }}>관리자 전용 페이지예요</p>
        <p style={{ fontSize: 13, margin: "0 0 1.5rem" }}>목사님(관리자)만 볼 수 있습니다.</p>
        <button onClick={() => router.push("/")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: theme.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>홈으로</button>
      </main>
    );
  }

  return (
    <main className="fade-in" style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>🔧 현황판</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>홈으로</button>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 1.25rem" }}>성도별 양육 과정 수료 진도와 퀴즈 참여 현황이에요.</p>

      {rows === null && <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem 0" }}>불러오는 중...</p>}
      {rows && rows.length === 0 && <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem 0" }}>아직 등록된 성도가 없어요.</p>}

      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: theme.gold, fontWeight: 700, margin: "0 0 10px" }}>총 {rows.length}명</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map(r => (
              <div key={r.id} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{r.nickname}</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>퀴즈 {r.plays}판 · ⭐{r.points}</span>
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
