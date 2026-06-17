"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { LeaderboardRow } from "@/lib/types";
import { PageHeader, ACCENT, softShadow } from "@/lib/ui";
import { SkeletonList } from "@/components/Skeleton";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState<"weekly" | "all">("all");
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myRow, setMyRow] = useState<LeaderboardRow | null>(null);

  const view = tab === "weekly" ? "leaderboard_weekly" : "leaderboard";

  function loadBoard() {
    setRows(null); setError(false); setMyRank(null); setMyRow(null);
    supabase
      .from(view)
      .select("*")
      .order("total_points", { ascending: false })
      .order("total_score", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) { setError(true); return; }
        setRows((data ?? []) as LeaderboardRow[]);
      });
  }

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mine } = await supabase.from(view).select("*").eq("user_id", user.id).maybeSingle();
      if (!mine) { setMyRow(null); setMyRank(null); return; }
      setMyRow(mine as LeaderboardRow);
      const { count } = await supabase
        .from(view).select("user_id", { count: "exact", head: true })
        .gt("total_points", (mine as LeaderboardRow).total_points);
      setMyRank((count ?? 0) + 1);
    })();
  }, [user, view]);

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <PageHeader title={t("rk.title")} homeLabel={t("r.home")} onHome={() => router.push("/")} />

      {/* 주간 / 전체 토글 */}
      <div style={{ display: "flex", gap: 8, marginBottom: "0.9rem" }}>
        {([["all", t("rk.all")], ["weekly", t("rk.weekly")]] as const).map(([key, label]) => {
          const on = tab === key;
          return (
            <button key={key} onClick={() => setTab(key as "weekly" | "all")} style={{ flex: 1, padding: "12px", borderRadius: 14, fontSize: 14.5, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text, boxShadow: on ? "0 6px 16px rgba(31,155,239,0.22)" : softShadow }}>{label}</button>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 1.1rem 2px", lineHeight: 1.5 }}>
        {tab === "weekly" ? t("rk.descWeekly") : t("rk.descAll")}
      </p>

      {user && myRow && (
        <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 13, background: ACCENT.blue.bg, border: `1px solid ${ACCENT.blue.border}`, borderRadius: 18, padding: "14px 16px", marginBottom: "1.1rem", boxShadow: softShadow }}>
          <span style={{ flexShrink: 0, minWidth: 46, height: 46, padding: "0 6px", borderRadius: 13, background: ACCENT.blue.chip, display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800, color: ACCENT.blue.fg }}>{myRank ? t("rk.rankUnit", { n: myRank }) : "-"}</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{myRow.nickname} <span style={{ color: theme.textMuted, fontWeight: 400 }}>{t("c.me")}</span></span>
          <span style={{ flexShrink: 0, fontSize: 14.5, fontWeight: 800, color: theme.gold }}>⭐ {myRow.total_points}</span>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ color: theme.wrong, fontSize: 14, margin: "0 0 12px" }}>{t("rk.fail")}</p>
          <button onClick={loadBoard} style={{ fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 11, padding: "10px 22px", cursor: "pointer" }}>🔄 {t("common.retry")}</button>
        </div>
      )}
      {!error && rows === null && <SkeletonList count={5} />}
      {!error && rows && rows.length === 0 && (
        <div className="fade-in-2" style={{ textAlign: "center", padding: "2.5rem 1.5rem", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: ACCENT.blue.bg, boxShadow: softShadow }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
          <p style={{ fontSize: 14.5, color: theme.text, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.6 }}>{t("rk.empty")}</p>
          <button onClick={() => router.push("/play")} style={{ padding: "12px 26px", fontSize: 14.5, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#1f9bef 0%,#1577c2 100%)", border: "none", borderRadius: 13, cursor: "pointer", boxShadow: "0 8px 20px rgba(31,155,239,0.25)" }}>{t("menu.quiz.t")} →</button>
        </div>
      )}

      {!error && rows && rows.length > 0 && (
        <div className="fade-in-2" style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${theme.cardBorder}`, background: theme.card, boxShadow: softShadow }}>
          {rows.map((r, i) => {
            const mine = user && r.user_id === user.id;
            const top = i < 3;
            return (
              <div key={r.user_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < rows.length - 1 ? `1px solid ${theme.cardBorder}` : "none", background: mine ? theme.primaryBg : "transparent" }}>
                <span style={{ fontSize: top ? 22 : 15, fontWeight: 800, color: top ? theme.gold : theme.textMuted, minWidth: 34, textAlign: "center", lineHeight: 1 }}>{MEDALS[i] ?? i + 1}</span>
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: mine ? 800 : 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nickname}{mine ? " " + t("c.me") : ""}</span>
                <span style={{ fontSize: 12, color: theme.textMuted, minWidth: 48, textAlign: "right" }}>{t("rk.plays", { n: r.plays })}</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.gold, minWidth: 64, textAlign: "right" }}>⭐ {r.total_points}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
