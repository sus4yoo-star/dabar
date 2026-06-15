"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { useI18n, LangSelector } from "@/lib/i18n";
import { fetchUnreadTotal } from "@/lib/besora/companions";
import HomeComfort from "@/components/HomeComfort";

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
    <main style={{ maxWidth: 460, margin: "0 auto", padding: "0.9rem 1rem 1.4rem", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* 상단 바 — 언어 + 로그인/아웃만 (깔끔) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <LangSelector />
        {!loading && (user ? (
          <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{t("common.logout")}</button>
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 16, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>{t("common.login")}</button>
        ))}
      </div>

      {/* 히어로 (compact) */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: 14 }}>
        <img src="/icons/icon-192.png" alt="DABAR" width={44} height={44} style={{ borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }} />
        <h1 style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 26, fontWeight: 700, color: theme.gold, letterSpacing: 4, margin: "6px 0 2px" }}>DABAR</h1>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>{t("home.tagline")}</p>
        {user && (
          <div style={{ marginTop: 8, fontSize: 12.5, color: theme.primarySoft, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
            {editingNick ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input value={nickDraft} onChange={e => setNickDraft(e.target.value)} maxLength={20} autoFocus
                  style={{ width: 130, fontSize: 13, padding: "5px 9px", borderRadius: 12, border: `1px solid ${theme.gold}`, background: theme.card, color: theme.text, outline: "none" }} />
                <button onClick={async () => { const ok = await updateNickname(nickDraft); if (ok) setEditingNick(false); else alert(t("common.nickFail")); }}
                  style={{ fontSize: 12, fontWeight: 700, color: "#08263a", background: theme.gold, border: "none", borderRadius: 12, padding: "5px 10px", cursor: "pointer" }}>{t("common.save")}</button>
                <button onClick={() => setEditingNick(false)} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
              </span>
            ) : (
              <>
                <span>{t("home.greeting", { name: nickname })}
                  <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }} title="닉네임 바꾸기" style={{ marginLeft: 5, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>✏️</button>
                </span>
                {streak > 0 && <span style={{ fontSize: 11.5, fontWeight: 800, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "3px 10px" }}>{t(playedToday ? "home.streakToday" : "home.streakGo", { n: streak })}</span>}
              </>
            )}
          </div>
        )}
      </div>

      {/* 복음 전하기 — 메인 CTA (강조) */}
      <button onClick={() => router.push("/share")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", padding: "15px 16px", borderRadius: 18, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, cursor: "pointer", color: theme.text }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>🕊️</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16.5, fontWeight: 800, color: theme.gold }}>{t("home.shareTitle")}</span>
          <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{t("home.shareSub")}</span>
        </span>
        <span style={{ fontSize: 18, color: theme.gold }}>→</span>
      </button>

      {/* 4개 기능 — 2×2 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 11 }}>
        <Tile icon="🤝" title={t("home.groupsTitle")} accent onClick={() => router.push("/groups")} />
        <Tile icon="📕" title={t("home.readTitle")} tag={t("home.readTag")} onClick={() => router.push("/read")} />
        <Tile icon="📚" title={t("home.growSection")} onClick={() => router.push("/learn")} />
        <Tile icon="📖" title={t("menu.quiz.t")} onClick={() => router.push("/play")} />
      </div>

      {/* 빠른 이동 — 동행 / 랭킹 / 오답 */}
      <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
        <QuickChip label={t("common.companions")} onClick={() => router.push("/share/me")} badge={unread} />
        <QuickChip label={t("common.ranking")} onClick={() => router.push("/ranking")} />
        {user && <QuickChip label={t("common.wrongnote")} onClick={() => router.push("/history")} />}
      </div>

      {/* 💛 마음에 닿는 말씀 — 감정/상황 → 위로의 말씀 (탭하면 다음 말씀) */}
      <HomeComfort />

      {/* 하단 보조 링크 */}
      <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7 }}>
        {isAdmin && <SmallLink onClick={() => router.push("/admin")}>{t("home.adminShort")}</SmallLink>}
        <SmallLink onClick={() => router.push("/guide")}>{t("home.guideShort")}</SmallLink>
        {user && <SmallLink onClick={shareInvite}>{t("home.inviteShort")}</SmallLink>}
        <SmallLink onClick={() => router.push(user ? "/account" : "/privacy")}>{user ? t("home.accountShort") : t("privacy.title")}</SmallLink>
      </div>
      <p style={{ textAlign: "center", fontSize: 10.5, color: theme.textFaint, marginTop: 12, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}

function Tile({ icon, title, tag, accent, onClick }: { icon: string; title: string; tag?: string; accent?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="fade-in-2"
      style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", textAlign: "left", padding: "15px 14px", borderRadius: 16, minHeight: 96, border: `1px solid ${accent ? theme.primary : theme.cardBorder}`, background: accent ? theme.primaryBg : theme.card, color: theme.text, cursor: "pointer" }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: accent ? theme.primarySoft : theme.text }}>{title}</span>
        {tag && <span style={{ fontSize: 9.5, fontWeight: 800, color: theme.primarySoft, background: "rgba(31,155,239,0.10)", border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "1px 6px" }}>{tag}</span>}
      </span>
    </button>
  );
}

function QuickChip({ label, onClick, badge }: { label: string; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 6px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
      {badge ? <span style={{ position: "absolute", top: -5, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 0 0 2px #fff" }}>{badge > 99 ? "99+" : badge}</span> : null}
    </button>
  );
}

function SmallLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ fontSize: 12.5, fontWeight: 600, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}
