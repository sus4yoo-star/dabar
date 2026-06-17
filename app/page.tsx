"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { useI18n, LangSelector } from "@/lib/i18n";
import HomeReachCard from "@/components/HomeReachCard";
import SosButton from "@/components/SosButton";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, nickname, loading, signOut, updateNickname, isAdmin } = useAuth();
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showOnboard, setShowOnboard] = useState(false);

  // 첫 방문(비로그인) 1회 온보딩 안내
  useEffect(() => {
    if (loading || user) { setShowOnboard(false); return; }
    try { if (!localStorage.getItem("dabar_onboarded")) setShowOnboard(true); } catch { /* */ }
  }, [user, loading]);
  function dismissOnboard() { setShowOnboard(false); try { localStorage.setItem("dabar_onboarded", "1"); } catch { /* */ } }

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let alive = true;
    // besora 스택(별도 Supabase 클라이언트·i18n·realtime)을 홈 초기 번들에서 제외하고
    // 로그인된 사용자에 한해 필요할 때만 지연 로딩 — 첫 화면 로딩이 빨라진다.
    import("@/lib/besora/companions")
      .then((m) => m.fetchUnreadTotal())
      .then((n) => { if (alive) setUnread(n); })
      .catch(() => {});
    return () => { alive = false; };
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

      {/* 첫 사용자 온보딩 (비로그인 첫 방문 1회) */}
      {showOnboard && (
        <div className="fade-in" style={{ marginBottom: 12, padding: "16px 17px", borderRadius: 18, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: theme.gold, lineHeight: 1.3 }}>{t("onboard.title")}</span>
            <button onClick={dismissOnboard} aria-label="close" style={{ flexShrink: 0, fontSize: 16, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer", padding: 4, lineHeight: 1 }}>✕</button>
          </div>
          <p style={{ fontSize: 13.5, color: theme.textMuted, margin: "4px 0 12px", lineHeight: 1.5 }}>{t("onboard.sub")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["onboard.f1", "onboard.f2", "onboard.f3", "onboard.f4"].map((k) => (
              <span key={k} style={{ fontSize: 14.5, fontWeight: 600, color: theme.text, lineHeight: 1.4 }}>{t(k)}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => router.push("/login")} style={{ flex: 1, padding: "13px", fontSize: 15, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 13, cursor: "pointer" }}>{t("onboard.start")}</button>
            <button onClick={dismissOnboard} style={{ flex: 1, padding: "13px", fontSize: 15, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 13, cursor: "pointer" }}>{t("onboard.browse")}</button>
          </div>
        </div>
      )}

      {/* 히어로 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ width: 62, height: 62, margin: "0 auto", borderRadius: 19, background: "linear-gradient(135deg,#e9ffce 0%,#d4eeff 100%)", display: "grid", placeItems: "center", boxShadow: "0 12px 26px rgba(31,155,239,0.20)" }}>
          <img src="/icons/icon-192.png" alt="DABAR" width={42} height={42} style={{ borderRadius: 12 }} />
        </div>
        <h1 style={{ fontFamily: "'Iowan Old Style',Georgia,serif", fontSize: 29, fontWeight: 700, color: theme.gold, letterSpacing: 5, margin: "9px 0 3px" }}>DABAR</h1>
        <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0 }}>{t("home.tagline")}</p>
        {user && (
          <div style={{ marginTop: 8, fontSize: 13.5, color: theme.primarySoft, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
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

      {/* 복음 전하기 — 메인 CTA (가장 강조) */}
      <button onClick={() => router.push("/share")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", padding: "15px 16px", borderRadius: 18, border: `1px solid ${theme.goldBorder}`, background: "linear-gradient(135deg,#edfcd2 0%,#f8fff1 100%)", cursor: "pointer", color: theme.text, boxShadow: "0 10px 24px rgba(88,167,0,0.16)" }}>
        <span style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 15, background: "rgba(146,215,0,0.22)", display: "grid", placeItems: "center", fontSize: 28 }}>🕊️</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 18.5, fontWeight: 800, color: theme.gold }}>{t("home.shareTitle")}</span>
          <span style={{ display: "block", fontSize: 13.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{t("home.shareSub")}</span>
        </span>
        <span style={{ fontSize: 19, color: theme.gold }}>→</span>
      </button>

      {/* 🌱 전도 여정 — 복음 전하기 바로 아래 (내가 전하는 사람들) */}
      <HomeReachCard />

      {/* 🤝 소그룹 모임 */}
      <NavCard icon="🤝" title={t("home.groupsTitle")} sub={t("home.groupsSub")} onClick={() => router.push("/groups")} accent={ACCENT.blue} />

      {/* 📚 양육·교육 과정 */}
      <NavCard icon="📚" title={t("home.growSection")} sub={t("home.growSub")} onClick={() => router.push("/learn")} accent={ACCENT.green} />

      {/* 📖 성경퀴즈 */}
      <NavCard icon="📖" title={t("menu.quiz.t")} sub={t("home.quizSub")} onClick={() => router.push("/play")} accent={ACCENT.blue} />

      {/* 💛 마음에 닿는 말씀 */}
      <NavCard icon="💛" title={t("home.comfortTitle")} sub={t("home.comfortSub")} onClick={() => router.push("/comfort")} accent={ACCENT.amber} />

      {/* 빠른 이동 — 동행 / 랭킹 / 오답 */}
      <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
        <QuickChip label={t("common.companions")} onClick={() => router.push("/share/me")} badge={unread} />
        <QuickChip label={t("common.ranking")} onClick={() => router.push("/ranking")} />
        {user && <QuickChip label={t("common.wrongnote")} onClick={() => router.push("/history")} />}
        {user && <QuickChip label={t("common.progress")} onClick={() => router.push("/progress")} />}
      </div>

      {/* 🆘 긴급 SOS — 한 줄 */}
      <SosButton compact />

      {/* 하단 보조 링크 */}
      <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7 }}>
        {isAdmin && <SmallLink onClick={() => router.push("/admin")}>{t("home.adminShort")}</SmallLink>}
        <SmallLink onClick={() => router.push("/guide")}>{t("home.guideShort")}</SmallLink>
        {user && <SmallLink onClick={shareInvite}>{t("home.inviteShort")}</SmallLink>}
        <SmallLink onClick={() => router.push(user ? "/account" : "/privacy")}>{user ? t("home.accountShort") : t("privacy.title")}</SmallLink>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: theme.textFaint, marginTop: 12, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}

type Accent = { fg: string; chip: string; bg: string; border: string };
const ACCENT: Record<"green" | "blue" | "amber", Accent> = {
  green: { fg: theme.gold,        chip: "rgba(146,215,0,0.20)",  bg: "linear-gradient(135deg,#f6ffea 0%,#ffffff 70%)", border: theme.goldBorder },
  blue:  { fg: theme.primarySoft, chip: "rgba(31,155,239,0.15)", bg: "linear-gradient(135deg,#eef8ff 0%,#ffffff 70%)", border: theme.cardBorder },
  amber: { fg: "#c9820a",         chip: "rgba(230,160,0,0.18)",  bg: "linear-gradient(135deg,#fff7e6 0%,#ffffff 70%)", border: theme.cardBorder },
};

function NavCard({ icon, title, sub, onClick, accent }: { icon: string; title: string; sub: string; onClick: () => void; accent: Accent }) {
  return (
    <button onClick={onClick} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 9, padding: "12px 15px", borderRadius: 16, border: `1px solid ${accent.border}`, background: accent.bg, cursor: "pointer", color: theme.text, boxShadow: "0 3px 12px rgba(23,50,73,0.05)" }}>
      <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: accent.chip, display: "grid", placeItems: "center", fontSize: 24 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16.5, fontWeight: 800, color: accent.fg }}>{title}</span>
        <span style={{ display: "block", fontSize: 13, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{sub}</span>
      </span>
      <span style={{ fontSize: 18, color: accent.fg, opacity: 0.85 }}>→</span>
    </button>
  );
}

function QuickChip({ label, onClick, badge }: { label: string; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 6px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 14.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
      {badge ? <span style={{ position: "absolute", top: -5, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 0 0 2px #fff" }}>{badge > 99 ? "99+" : badge}</span> : null}
    </button>
  );
}

function SmallLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ fontSize: 13.5, fontWeight: 600, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}
