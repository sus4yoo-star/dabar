"use client";

// 🌱 전도 여정 — 홈 카드. 내가 전하는 사람들 요약(총원·영접) + /reach 진입.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { seekerCounts } from "@/lib/besora/seekers";

export default function HomeReachCard() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const [total, setTotal] = useState<number | null>(null);
  const [decided, setDecided] = useState(0);
  const [due, setDue] = useState(0);

  useEffect(() => {
    if (!user) { setTotal(null); return; }
    seekerCounts().then((c) => { setTotal(c.total); setDecided(c.byStage.decided + c.byStage.settled); setDue(c.due); }).catch(() => {});
  }, [user]);

  return (
    <button onClick={() => router.push("/reach")} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 12, padding: "15px 16px", borderRadius: 16, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, cursor: "pointer", color: theme.text }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>🌱</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: theme.gold }}>{t("home.reachTitle")}</span>
        <span style={{ display: "block", fontSize: 12, color: due > 0 ? theme.primarySoft : theme.textMuted, fontWeight: due > 0 ? 700 : 400, marginTop: 2 }}>
          {due > 0
            ? `🔔 ${t("home.reachToday", { n: due })}`
            : total && total > 0
              ? `${t("reach.count", { n: total })} · ${t("reach.s.decided")} ${decided}`
              : t("home.reachSub")}
        </span>
      </span>
      <span style={{ fontSize: 18, color: theme.gold }}>→</span>
    </button>
  );
}
