"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { COURSES } from "@/lib/courses";
import { SkeletonList } from "@/components/Skeleton";

interface Row {
  id: string;
  nickname: string;
  prog: Record<string, number>;
  plays: number;
  points: number;
  quiz_answered: number;
  quiz_correct: number;
}

// 교회 연결 요청 (사람이 확인 후 직접 소개 — 앱은 접수·상태 관리만)
interface ConnReq {
  id: string;
  name: string;
  contact: string;
  region: string;
  lang: string | null;
  note: string | null;
  status: string; // pending | contacted | connected | closed
  created_at: string;
}
const CONN_STATUSES = ["pending", "contacted", "connected", "closed"] as const;

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [connReqs, setConnReqs] = useState<ConnReq[] | null>(null);
  const [connErr, setConnErr] = useState(false);
  const [connReload, setConnReload] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!isAdmin) return;
    // 교회 연결 요청 목록 (RLS: 관리자만 조회 가능)
    // 조회 실패를 빈 목록과 구분 — 실패를 '요청 없음'으로 착각해 실제 요청을 놓치지 않도록.
    supabase.from("church_connect_requests").select("id, name, contact, region, lang, note, status, created_at")
      .order("created_at", { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (error) { setConnErr(true); setConnReqs([]); return; }
        setConnErr(false); setConnReqs((data as ConnReq[]) ?? []);
      });
    (async () => {
      // 개인 진도는 비공개 — 관리자만 호출 가능한 보안 RPC 로 집계 데이터를 받는다.
      const { data, error } = await supabase.rpc("admin_dashboard");
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
  }, [user, isAdmin, loading, router, connReload]);

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
        <h1 className="serif" style={{ fontSize: 23, fontWeight: 700, color: theme.gold, margin: 0, letterSpacing: -0.2 }}>{t("ad.title")}</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("r.home")}</button>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 1.25rem" }}>{t("ad.desc")}</p>

      {/* ⛪ 교회 연결 요청 — 사람이 확인하고 직접 소개. 여기서는 접수 확인·상태 관리만 한다. */}
      <section style={{ marginBottom: "1.75rem" }}>
        <h2 className="serif" style={{ fontSize: 17, fontWeight: 800, color: theme.gold, margin: "0 0 10px" }}>
          {t("conn.adTitle")}{connReqs && connReqs.length > 0 ? ` (${connReqs.filter(r => r.status === "pending").length}/${connReqs.length})` : ""}
        </h2>
        {connReqs === null && <SkeletonList count={2} />}
        {connErr && (
          <p style={{ fontSize: 13, color: theme.wrong, margin: 0 }}>
            {t("q.loadFail")}{" "}
            <button onClick={() => setConnReload(k => k + 1)} style={{ color: theme.primarySoft, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>{t("common.retry")}</button>
          </p>
        )}
        {!connErr && connReqs && connReqs.length === 0 && <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>{t("conn.adEmpty")}</p>}
        {connReqs && connReqs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {connReqs.map(r => {
              const stColor = r.status === "pending" ? theme.wrong : r.status === "connected" ? theme.correct : theme.textMuted;
              return (
                <div key={r.id} style={{ background: theme.card, border: `1px solid ${r.status === "pending" ? theme.goldBorder : theme.cardBorder}`, borderRadius: 14, padding: "13px 15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{r.name} <span style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted }}>· {r.region}{r.lang ? ` · ${r.lang.toUpperCase()}` : ""}</span></span>
                    <span style={{ fontSize: 11, color: theme.textFaint, whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: theme.text, margin: "0 0 4px", wordBreak: "break-all" }}>📞 {r.contact}</p>
                  {r.note && <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 8px", lineHeight: 1.5 }}>💬 {r.note}</p>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    {CONN_STATUSES.map(s => (
                      <button key={s}
                        onClick={async () => {
                          const { error } = await supabase.from("church_connect_requests").update({ status: s, updated_at: new Date().toISOString() }).eq("id", r.id);
                          if (!error) setConnReqs(prev => prev?.map(x => x.id === r.id ? { ...x, status: s } : x) ?? null);
                        }}
                        style={{ fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 10, cursor: "pointer",
                          color: r.status === s ? "#fff" : stColor === theme.wrong && s === "pending" ? theme.wrong : theme.textMuted,
                          background: r.status === s ? theme.primary : "transparent",
                          border: `1px solid ${r.status === s ? theme.primary : theme.border}` }}>
                        {t(s === "pending" ? "conn.stPending" : s === "contacted" ? "conn.stContacted" : s === "connected" ? "conn.stConnected" : "conn.stClosed")}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {rows === null && <SkeletonList count={6} />}
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
                {/* 성경퀴즈: 푼 문제 수 · 정답률(정답/푼 문제) */}
                <div style={{ marginTop: 8 }}>
                  {(() => {
                    const rate = r.quiz_answered > 0 ? Math.round((r.quiz_correct / r.quiz_answered) * 100) : 0;
                    return (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: r.quiz_answered > 0 ? theme.primarySoft : theme.textFaint, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "4px 9px" }}>
                        {t("ad.quizProg", { a: r.quiz_answered, r: rate })}
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
