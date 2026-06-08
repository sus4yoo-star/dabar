"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { LeaderboardRow } from "@/lib/types";

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

  useEffect(() => {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("rk.title")}</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("r.home")}</button>
      </div>

      {/* 주간 / 전체 토글 */}
      <div style={{ display: "flex", gap: 7, marginBottom: "1rem" }}>
        {([["all", t("rk.all")], ["weekly", t("rk.weekly")]] as const).map(([key, label]) => {
          const on = tab === key;
          return (
            <button key={key} onClick={() => setTab(key as "weekly" | "all")} style={{ flex: 1, padding: "10px", borderRadius: 12, fontSize: 14, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.border}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{label}</button>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: theme.textMuted, margin: "0 0 1.1rem" }}>
        {tab === "weekly" ? t("rk.descWeekly") : t("rk.descAll")}
      </p>

      {user && myRow && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: "1.1rem" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: theme.gold, minWidth: 36 }}>{myRank ? t("rk.rankUnit", { n: myRank }) : "-"}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: theme.text }}>{myRow.nickname} <span style={{ color: theme.textMuted, fontWeight: 400 }}>{t("c.me")}</span></span>
          <span style={{ fontSize: 14, fontWeight: 800, color: theme.gold }}>⭐ {myRow.total_points}</span>
        </div>
      )}

      {error && <p style={{ textAlign: "center", color: theme.wrong, fontSize: 14, padding: "2rem 0" }}>{t("rk.fail")}</p>}
      {!error && rows === null && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>{t("c.loading")}</p>}
      {!error && rows && rows.length === 0 && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>{t("rk.empty")}</p>}

      {!error && rows && rows.length > 0 && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
          {rows.map((r, i) => {
            const mine = user && r.user_id === user.id;
            return (
              <div key={r.user_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < rows.length - 1 ? `1px solid ${theme.cardBorder}` : "none", background: mine ? theme.primaryBg : "transparent" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: i < 3 ? theme.gold : theme.textMuted, minWidth: 32, textAlign: "center" }}>{MEDALS[i] ?? i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: mine ? 700 : 500, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nickname}{mine ? " " + t("c.me") : ""}</span>
                <span style={{ fontSize: 12, color: theme.textMuted, minWidth: 48, textAlign: "right" }}>{t("rk.plays", { n: r.plays })}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: theme.gold, minWidth: 64, textAlign: "right" }}>⭐ {r.total_points}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
