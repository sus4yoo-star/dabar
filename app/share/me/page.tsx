"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import { getSupabase } from "@/lib/besora/supabase";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function Me() {
  const { myLang } = useLang();
  const [total, setTotal] = useState<number | null>(null);
  const [decided, setDecided] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoggedIn(false); return; }
      setLoggedIn(true);
      const { count: t } = await sb.from("sessions").select("*", { count: "exact", head: true });
      const { count: d } = await sb.from("sessions").select("*", { count: "exact", head: true }).eq("decided", true);
      setTotal(t ?? 0);
      setDecided(d ?? 0);
    });
  }, []);

  return (
    <AppShell>
      <h1 style={{ marginBottom: 24, fontFamily: "'Noto Serif KR',serif", fontSize: 24, fontWeight: 600, color: theme.text }}>{ui(myLang, "myRecords")}</h1>

      {!loggedIn ? (
        <p style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 20, fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
          로그인하면 전도 기록과 통계가 이 기기를 넘어 저장돼요. (게스트로도 전도는 자유롭게 가능합니다.)
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: 20 }}>
            <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>전한 횟수</p>
            <p style={{ marginTop: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 36, color: theme.gold, margin: "4px 0 0" }}>{total ?? "…"}</p>
          </div>
          <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: 20 }}>
            <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>함께 결단</p>
            <p style={{ marginTop: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 36, color: theme.correct, margin: "4px 0 0" }}>{decided ?? "…"}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
