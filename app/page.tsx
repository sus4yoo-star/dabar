"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { useI18n, LangSelector } from "@/lib/i18n";

const MENU = [
  { emoji: "🌱", href: "/course/newcomer", tk: "menu.newcomer" },
  { emoji: "💧", href: "/course/baptism", tk: "menu.baptism" },
  { emoji: "✝️", href: "/course/confirmation", tk: "menu.confirmation" },
  { emoji: "📚", href: "/course/deep", tk: "menu.deep" },
  { emoji: "📜", href: "/catechism", tk: "menu.catechism" },
  { emoji: "📖", href: "/play", tk: "menu.quiz" },
];

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, nickname, loading, signOut, updateNickname, isAdmin } = useAuth();
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);

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
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "0.85rem 1.1rem 1.5rem", minHeight: "100dvh" }}>
      {/* 상단 바 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => router.push("/ranking")} style={{ fontSize: 13, fontWeight: 700, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "7px 14px", cursor: "pointer" }}>{t("common.ranking")}</button>
          {user && <button onClick={() => router.push("/history")} style={{ fontSize: 13, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: "7px 12px", cursor: "pointer" }}>{t("common.wrongnote")}</button>}
        </div>
        {!loading && (user ? (
          editingNick ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input value={nickDraft} onChange={e => setNickDraft(e.target.value)} maxLength={20} autoFocus
                style={{ width: 110, fontSize: 13, padding: "6px 10px", borderRadius: 14, border: `1px solid ${theme.gold}`, background: theme.card, color: theme.text, outline: "none" }} />
              <button onClick={async () => { const ok = await updateNickname(nickDraft); if (ok) setEditingNick(false); else alert("닉네임을 바꾸지 못했어요."); }}
                style={{ fontSize: 12, fontWeight: 700, color: "#241246", background: theme.gold, border: "none", borderRadius: 14, padding: "6px 12px", cursor: "pointer" }}>{t("common.save")}</button>
              <button onClick={() => setEditingNick(false)} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }} title="닉네임 바꾸기"
                style={{ fontSize: 13, color: theme.text, fontWeight: 600, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>{nickname} ✏️</button>
              <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "5px 12px", cursor: "pointer" }}>{t("common.logout")}</button>
            </div>
          )
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 20, padding: "7px 16px", cursor: "pointer" }}>{t("common.login")}</button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><LangSelector /></div>

      {/* 히어로 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        {user && (
          <p style={{ fontSize: 13, color: theme.primarySoft, fontWeight: 600, margin: "0 0 8px" }}>
            {t("home.greeting", { name: nickname })}
          </p>
        )}
        {user && streak > 0 && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 800, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "5px 14px" }}>
              {t(playedToday ? "home.streakToday" : "home.streakGo", { n: streak })}
            </span>
          </div>
        )}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
          <div aria-hidden style={{ position: "absolute", inset: -14, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,200,120,0.26) 0%, rgba(230,200,120,0) 70%)" }} />
          <img src="/icons/icon-192.png" alt="DABAR" width={52} height={52} style={{ position: "relative", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }} />
        </div>
        <h1 style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 30, fontWeight: 700, color: theme.gold, letterSpacing: 5, margin: "2px 0 2px" }}>DABAR</h1>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{t("home.tagline")}</p>
      </div>

      {/* 4개 메뉴 카드 */}
      <div className="fade-in-2" style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: "1.25rem" }}>
        {MENU.map(m => (
          <button key={m.href} onClick={() => router.push(m.href)}
            style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "16px 18px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text }}>
            <span style={{ fontSize: 30, lineHeight: 1 }}>{m.emoji}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: theme.text }}>{t(m.tk + ".t")}</span>
              <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>{t(m.tk + ".s")}</span>
            </span>
            <span style={{ fontSize: 18, color: theme.gold }}>→</span>
          </button>
        ))}
      </div>

      {isAdmin && <button onClick={() => router.push("/admin")} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: theme.goldLight, color: theme.gold, border: `1px solid ${theme.goldBorder}`, borderRadius: 12, cursor: "pointer", marginBottom: 10 }}>{t("home.admin")}</button>}
      <button onClick={() => router.push("/guide")} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: "transparent", color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer", marginBottom: 10 }}>{t("home.guide")}</button>
      {user && (
        <button onClick={shareInvite} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, background: "transparent", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, cursor: "pointer" }}>{t("home.invite")}</button>
      )}
      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "1.25rem", letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
