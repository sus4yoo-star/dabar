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
import { useToast } from "@/components/Toast";
import DisplayQuickToggle from "@/components/DisplayQuickToggle";
import InstallHint from "@/components/InstallHint";
import { serif } from "@/lib/ui";

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const { show, view: toastView } = useToast();
  const { user, nickname, loading, signOut, updateNickname, isAdmin } = useAuth();
  const [editingNick, setEditingNick] = useState(false);
  const [savingNick, setSavingNick] = useState(false);
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
    <main style={{ maxWidth: 460, margin: "0 auto", padding: "0.55rem 1rem 0.8rem", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* 상단 바 — 언어 · 화면 토글(큰 글씨/야간) · 로그인/아웃 한 줄 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <LangSelector />
        <DisplayQuickToggle />
        {!loading && (user ? (
          <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.logout")}</button>
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 16, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.login")}</button>
        ))}
      </div>

      {/* iOS 사파리 사용자에게 '홈 화면에 추가' 1회 안내 */}
      <InstallHint />

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
      <div className="fade-in" style={{ textAlign: "center", marginBottom: 14, paddingTop: 2 }}>
        <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto" }}>
          <div aria-hidden style={{ position: "absolute", inset: -13, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,154,43,0.22) 0%, rgba(199,154,43,0) 70%)", filter: "blur(5px)" }} />
          <div style={{ position: "relative", width: 60, height: 60, borderRadius: 19, background: "linear-gradient(135deg,#e7f7ee 0%,#e9f4fd 100%)", display: "grid", placeItems: "center", boxShadow: "0 10px 26px rgba(31,143,230,0.18)" }}>
            <img src="/icons/icon-192.png" alt="DABAR" width={40} height={40} style={{ borderRadius: 12 }} />
          </div>
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: 5, margin: "11px 0 4px" }}>DABAR</h1>
        {/* 거룩한 금빛 장식선 */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 4 }}>
          <span style={{ width: 28, height: 1, background: "linear-gradient(90deg, transparent, var(--t-sacred))" }} />
          <span style={{ color: "var(--t-sacred)", fontSize: 9, lineHeight: 1 }}>✦</span>
          <span style={{ width: 28, height: 1, background: "linear-gradient(90deg, var(--t-sacred), transparent)" }} />
        </div>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, letterSpacing: 0.3 }}>{t("home.tagline")}</p>
        {user && (
          <div style={{ marginTop: 5, fontSize: 13, color: theme.primarySoft, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
            {editingNick ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input value={nickDraft} onChange={e => setNickDraft(e.target.value)} maxLength={20} autoFocus
                  style={{ width: 130, fontSize: 13, padding: "5px 9px", borderRadius: 12, border: `1px solid ${theme.gold}`, background: theme.card, color: theme.text, outline: "none" }} />
                <button disabled={savingNick} onClick={async () => { if (savingNick) return; setSavingNick(true); try { const ok = await updateNickname(nickDraft); if (ok) setEditingNick(false); else show(t("common.nickFail")); } finally { setSavingNick(false); } }}
                  style={{ fontSize: 12, fontWeight: 700, color: "#08263a", background: theme.gold, border: "none", borderRadius: 12, padding: "5px 10px", cursor: savingNick ? "default" : "pointer", opacity: savingNick ? 0.6 : 1 }}>{t("common.save")}</button>
                <button onClick={() => setEditingNick(false)} aria-label={t("common.cancel")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px" }}>✕</button>
              </span>
            ) : (
              <>
                <span>{t("home.greeting", { name: nickname })}
                  <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }} aria-label={t("common.edit")} title={t("common.edit")} style={{ marginLeft: 4, fontSize: 14, background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}>✏️</button>
                </span>
                {streak > 0 && <span style={{ fontSize: 11.5, fontWeight: 800, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 20, padding: "3px 10px" }}>{t(playedToday ? "home.streakToday" : "home.streakGo", { n: streak })}</span>}
              </>
            )}
          </div>
        )}
      </div>

      {/* 복음 전하기 — 메인 CTA (유일한 골드 포인트 · 위계 최상단) */}
      <button onClick={() => router.push("/share")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", padding: "16px 18px", borderRadius: 18, border: `1px solid var(--t-sacredBorder)`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 8px 24px rgba(199,154,43,0.15)" }}>
        <span style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 15, background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", display: "grid", placeItems: "center", fontSize: 26 }}>🕊️</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: serif, display: "block", fontSize: 18, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: -0.2 }}>{t("home.shareTitle")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{t("home.shareSub")}</span>
        </span>
        <span style={{ fontSize: 16, color: "var(--t-sacred)" }}>›</span>
      </button>

      {/* 📚 양육·교육 과정 — 2번째 */}
      <NavCard icon="📚" title={t("home.growSection")} sub={t("home.growSub")} onClick={() => router.push("/learn")} accent={ACCENT.green} />

      {/* 🌱 선교 여정 — 3번째 (내가 전하는 사람들) */}
      <HomeReachCard />

      {/* 📖 성경퀴즈 */}
      <NavCard icon="📖" title={t("menu.quiz.t")} sub={t("home.quizSub")} onClick={() => router.push("/play")} accent={ACCENT.blue} />

      {/* 🤝 소그룹 모임 */}
      <NavCard icon="🤝" title={t("home.groupsTitle")} sub={t("home.groupsSub")} onClick={() => router.push("/groups")} accent={ACCENT.blue} />

      {/* 💛 마음에 닿는 말씀 */}
      <NavCard icon="💛" title={t("home.comfortTitle")} sub={t("home.comfortSub")} onClick={() => router.push("/comfort")} accent={ACCENT.amber} />

      {/* 빠른 이동 — 동행 / 랭킹 / 오답 */}
      <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
        <QuickChip label={t("common.companions")} onClick={() => router.push("/share/me")} badge={unread} />
        <QuickChip label={t("common.ranking")} onClick={() => router.push("/ranking")} />
        {user && <QuickChip label={t("common.wrongnote")} onClick={() => router.push("/history")} />}
        {user && <QuickChip label={t("common.progress")} onClick={() => router.push("/progress")} />}
      </div>

      {/* 🆘 긴급 SOS — 한 줄 */}
      <SosButton compact />

      {/* 하단 보조 링크 */}
      <div style={{ marginTop: "auto", paddingTop: 9, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7 }}>
        {isAdmin && <SmallLink onClick={() => router.push("/admin")}>{t("home.adminShort")}</SmallLink>}
        <SmallLink onClick={() => router.push("/guide")}>{t("home.guideShort")}</SmallLink>
        {user && <SmallLink onClick={shareInvite}>{t("home.inviteShort")}</SmallLink>}
        <SmallLink onClick={() => router.push(user ? "/account" : "/privacy")}>{user ? t("home.accountShort") : t("privacy.title")}</SmallLink>
      </div>
      <p style={{ textAlign: "center", fontSize: 10.5, color: theme.textFaint, marginTop: 8, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
      {toastView}
    </main>
  );
}

type Accent = { fg: string; chip: string; bg: string; border: string };
const ACCENT: Record<"green" | "blue" | "amber", Accent> = {
  green: { fg: "var(--a-green-fg)", chip: "var(--a-green-chip)", bg: "var(--a-green-bg)", border: "var(--a-green-border)" },
  blue:  { fg: "var(--a-blue-fg)",  chip: "var(--a-blue-chip)",  bg: "var(--a-blue-bg)",  border: "var(--a-blue-border)" },
  amber: { fg: "var(--a-amber-fg)", chip: "var(--a-amber-chip)", bg: "var(--a-amber-bg)", border: "var(--a-amber-border)" },
};

function NavCard({ icon, title, sub, onClick, accent }: { icon: string; title: string; sub: string; onClick: () => void; accent: Accent }) {
  return (
    <button onClick={onClick} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", marginTop: 11, padding: "14px 16px", borderRadius: 18, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 2px 10px rgba(26,37,48,0.06), 0 1px 3px rgba(26,37,48,0.04)" }}>
      <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 13, background: accent.chip, display: "grid", placeItems: "center", fontSize: 22 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: serif, display: "block", fontSize: 16.5, fontWeight: 700, color: theme.text, letterSpacing: -0.2 }}>{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{sub}</span>
      </span>
      <span style={{ fontSize: 16, color: theme.textFaint }}>›</span>
    </button>
  );
}

function QuickChip({ label, onClick, badge }: { label: string; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 6px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
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
