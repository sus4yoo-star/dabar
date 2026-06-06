"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { LeaderboardRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myRow, setMyRow] = useState<LeaderboardRow | null>(null);

  useEffect(() => {
    supabase
      .from("leaderboard")
      .select("*")
      .order("total_score", { ascending: false })
      .order("best_percentage", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) { setError(true); return; }
        setRows((data ?? []) as LeaderboardRow[]);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mine } = await supabase.from("leaderboard").select("*").eq("user_id", user.id).maybeSingle();
      if (!mine) return;
      setMyRow(mine as LeaderboardRow);
      const { count } = await supabase
        .from("leaderboard").select("user_id", { count: "exact", head: true })
        .gt("total_score", (mine as LeaderboardRow).total_score);
      setMyRank((count ?? 0) + 1);
    })();
  }, [user]);

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: 0 }}>🏆 랭킹</h1>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>홈으로</button>
      </div>
      <p style={{ fontSize: 12, color: theme.textMuted, margin: "0 0 1.25rem" }}>누적 정답 수가 많은 순서예요. 많이 풀수록 순위가 올라갑니다!</p>

      {user && myRow && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: theme.gold, minWidth: 36 }}>{myRank ? `${myRank}위` : "-"}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: theme.text }}>{myRow.nickname} <span style={{ color: theme.textMuted, fontWeight: 400 }}>(나)</span></span>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.gold }}>{myRow.total_score}점</span>
        </div>
      )}
      {!user && (
        <div style={{ textAlign: "center", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "16px", marginBottom: "1.25rem", fontSize: 13, color: theme.textMuted }}>
          <button onClick={() => router.push("/login")} style={{ color: theme.gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>로그인</button>
          {" "}하면 내 순위가 표시돼요
        </div>
      )}

      {error && <p style={{ textAlign: "center", color: theme.wrong, fontSize: 14, padding: "2rem 0" }}>랭킹을 불러오지 못했어요.</p>}
      {!error && rows === null && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>불러오는 중...</p>}
      {!error && rows && rows.length === 0 && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "2rem 0" }}>아직 기록이 없어요. 첫 주인공이 되어보세요!</p>}

      {!error && rows && rows.length > 0 && (
        <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
          {rows.map((r, i) => {
            const mine = user && r.user_id === user.id;
            return (
              <div key={r.user_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < rows.length - 1 ? `1px solid ${theme.cardBorder}` : "none", background: mine ? theme.primaryBg : "transparent" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: i < 3 ? theme.gold : theme.textMuted, minWidth: 32, textAlign: "center" }}>{MEDALS[i] ?? i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: mine ? 700 : 500, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nickname}{mine ? " (나)" : ""}</span>
                <span style={{ fontSize: 12, color: theme.textMuted, minWidth: 56, textAlign: "right" }}>{r.plays}판</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.gold, minWidth: 56, textAlign: "right" }}>{r.total_score}점</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
