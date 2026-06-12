"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { useI18n, LangSelector } from "@/lib/i18n";
import { fetchUnreadTotal } from "@/lib/besora/companions";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, nickname, loading, signOut, updateNickname, isAdmin } = useAuth();
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    fetchUnreadTotal().then(setUnread).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("scores").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(400)
      .then(({ data }) => {
        if (!data) return;
        const days = new Set(data.map(r => new Date(r.created_at).toLocaleDateString("en-CA")));
        const today = new Date().toLocaleDateString("en-CA");
        setPlayedToday(days.has(today));
        const cur = new Date();
        if (!days.has(today)) cur.setDate(cur.getDate() - 1);
        let s = 0;
        while (days.has(cur.toLocaleDateString("en-CA"))) { s++; cur.setDate(cur.getDate() - 1); }
        setStreak(s);
      });
  }, [user]);

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "1.5rem 1.1rem 2rem", minHeight: "100dvh" }}>
      {/* 상단 바 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: "1.6rem" }}>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <button onClick={() => router.push("/share/me")} style={{ position: "relative", fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {t("common.companions")}
            {unread > 0 && <span style={{ position: "absolute", top: -5, right: -5, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 0 0 2px #fff" }}>{unread > 99 ? "99+" : unread}</span>}
          </button>
          <button onClick={() => router.push("/ranking")} style={{ fontSize: 12.5, fontWeight: 700, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 18, padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.ranking")}</button>
          {user && <button onClick={() => router.push("/history")} style={{ fontSize: 12.5, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.wrongnote")}</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <LangSelector />
          {!loading && (user ? (
            <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "5px 10px", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>{t("common.logout")}</button>
          ) : (
            <button onClick={() => router.push("/login")} style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 18, padding: "6px 12px", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>{t("common.login")}</button>
          ))}
        </div>
      </div>

      {/* 히어로 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "2rem" }}>
        {user && (
          editingNick ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "0 0 8px" }}>
              <input value={nickDraft} onChange={e => setNickDraft(e.target.value)} maxLength={20} autoFocus
                style={{ width: 150, fontSize: 14, padding: "6px 10px", borderRadius: 14, border: `1px solid ${theme.gold}`, background: theme.card, color: theme.text, outline: "none" }} />
              <button onClick={async () => { const ok = await updateNickname(nickDraft); if (ok) setEditingNick(false); else alert("닉네임을 바꾸지 못했어요."); }}
                style={{ fontSize: 12, fontWeight: 700, color: "#08263a", background: theme.gold, border: "none", borderRadius: 14, padding: "6px 12px", cursor: "pointer" }}>{t("common.save")}</button>
              <button onClick={() => setEditingNick(false)} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: theme.primarySoft, fontWeight: 600, margin: "0 0 18px" }}>
              {t("home.greeting", { name: nickname })}
              <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }} title="닉네임 바꾸기"
                style={{ marginLeft: 6, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>✏️</button>
            </p>
          )
        )}
        {user && streak > 0 && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 800, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "5px 14px" }}>
              {t(playedToday ? "home.streakToday" : "home.streakGo", { n: streak })}
            </span>
          </div>
        )}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
          <div aria-hidden style={{ position: "absolute", inset: -14, borderRadius: "50%", background: "radial-gradient(circle, rgba(146,215,0,0.30) 0%, rgba(146,215,0,0) 70%)" }} />
          <img src="/icons/icon-192.png" alt="DABAR" width={52} height={52} style={{ position: "relative", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} />
        </div>
        <h1 style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 30, fontWeight: 700, color: theme.gold, letterSpacing: 5, margin: "4px 0 5px" }}>DABAR</h1>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{t("home.tagline")}</p>
      </div>

      {/* 복음 전하기 (/share) — 메인 카드(맨 위, 강조) */}
      <button onClick={() => router.push("/share")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", padding: "18px 18px", borderRadius: 18, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, cursor: "pointer", color: theme.text, marginBottom: "1.1rem" }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>🕊️</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: theme.gold }}>{t("home.shareTitle")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>{t("home.shareSub")}</span>
        </span>
        <span style={{ fontSize: 18, color: theme.gold }}>→</span>
      </button>

      {/* 양육 · 교육 과정 — 긴 바(누르면 과정 목록으로) */}
      <button onClick={() => router.push("/learn")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", padding: "16px 18px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, marginBottom: "0.7rem" }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>📚</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: theme.text }}>{t("home.growSection")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>{t("home.growSub")}</span>
        </span>
        <span style={{ fontSize: 18, color: theme.textMuted }}>→</span>
      </button>

      {/* 성경퀴즈 — 맨 마지막 긴 바 */}
      <button onClick={() => router.push("/play")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", padding: "16px 18px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, marginBottom: "1.25rem" }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>📖</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: theme.text }}>{t("menu.quiz.t")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>{t("menu.quiz.s")}</span>
        </span>
        <span style={{ fontSize: 18, color: theme.textMuted }}>→</span>
      </button>

      {isAdmin && <button onClick={() => router.push("/admin")} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: theme.goldLight, color: theme.gold, border: `1px solid ${theme.goldBorder}`, borderRadius: 12, cursor: "pointer", marginBottom: 10 }}>{t("home.admin")}</button>}
      <button onClick={() => router.push("/guide")} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: "transparent", color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer", marginBottom: 10 }}>{t("home.guide")}</button>
      {user && (
        <button onClick={shareInvite} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer" }}>{t("home.invite")}</button>
      )}
      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "1.25rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
