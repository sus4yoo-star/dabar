"use client";

import { useEffect, useState } from "react";
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
      if (!data.user) {
        setLoggedIn(false);
        return;
      }
      setLoggedIn(true);
      const { count: t } = await sb
        .from("sessions")
        .select("*", { count: "exact", head: true });
      const { count: d } = await sb
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("decided", true);
      setTotal(t ?? 0);
      setDecided(d ?? 0);
    });
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-gospel-parch">
        {ui(myLang, "myRecords")}
      </h1>

      {!loggedIn ? (
        <p className="rounded-2xl border border-white/10 bg-ink-2 p-5 text-sm text-muted">
          로그인하면 전도 기록과 통계가 이 기기를 넘어 저장돼요. (게스트로도 전도는
          자유롭게 가능합니다.)
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-ink-2 p-5">
            <p className="text-xs text-muted">전한 횟수</p>
            <p className="mt-1 font-serif text-4xl text-gospel-gold">{total ?? "…"}</p>
          </div>
          <div className="rounded-2xl bg-ink-2 p-5">
            <p className="text-xs text-muted">함께 결단</p>
            <p className="mt-1 font-serif text-4xl text-gospel-green">
              {decided ?? "…"}
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
