"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { shareInvite } from "@/lib/share";
import { supabase } from "@/lib/supabase";
import { useI18n, LangSelector } from "@/lib/i18n";
import HomeReachCard from "@/components/HomeReachCard";
import DailyVerse from "@/components/DailyVerse";
import SosButton from "@/components/SosButton";
import { useToast } from "@/components/Toast";
import DisplayQuickToggle from "@/components/DisplayQuickToggle";
import { serif } from "@/lib/ui";
import MenuIcon from "@/components/MenuIcon";
import BrandMark from "@/components/BrandMark";

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
  // 관리자: 대기 중인 교회 연결 요청 수 (놓치지 않게 홈에서 바로 알림)
  const [pendingConn, setPendingConn] = useState(0);
  // 성경 완주 이어풀기 (퀴즈가 저장해 둔 진행 정보)
  const [resume, setResume] = useState<{ qs: string; done: number; total: number } | null>(null);

  useEffect(() => {
    if (!isAdmin) { setPendingConn(0); return; }
    supabase.from("church_connect_requests").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count, error }) => { if (!error && count) setPendingConn(count); });
  }, [isAdmin]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dabar_resume_quiz");
      if (!raw) return;
      const r = JSON.parse(raw);
      if (r && typeof r.qs === "string" && r.total > 0 && r.done < r.total) setResume(r);
    } catch { /* */ }
  }, []);

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
      {/* 상단 바 — 언어 · [화면 토글 + 긴급 SOS] · 로그인/아웃 한 줄 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <LangSelector />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <DisplayQuickToggle />
          <SosButton variant="mini" />
        </div>
        {!loading && (user ? (
          <button onClick={signOut} style={{ fontSize: 12, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.logout")}</button>
        ) : (
          <button onClick={() => router.push("/login")} style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: theme.primary, border: "none", borderRadius: 16, padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t("common.login")}</button>
        ))}
      </div>

      {/* 히어로 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: 7 }}>
        <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto" }}>
          <div aria-hidden style={{ position: "absolute", inset: -11, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,154,43,0.22) 0%, rgba(199,154,43,0) 70%)", filter: "blur(5px)" }} />
          <div style={{ position: "relative", width: 48, height: 48, borderRadius: 16, background: "transparent", display: "grid", placeItems: "center" }}>
            <BrandMark size={40} />
          </div>
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: 5, paddingLeft: 5, margin: "7px 0 3px" }}>DABAR</h1>
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

      {/* 📖 오늘의 말씀 — 매일 여는 이유 */}
      <DailyVerse />

      {/* ⛪ 관리자: 대기 중 교회 연결 요청 알림 */}
      {isAdmin && pendingConn > 0 && (
        <button onClick={() => router.push("/admin")} className="fade-in"
          style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "11px 14px", borderRadius: 13, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, cursor: "pointer", textAlign: "left", marginBottom: 10 }}>
          <MenuIcon name="church" color={theme.gold} size={19} />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: theme.gold }}>{t("home.adminPending", { n: pendingConn })}</span>
          <span style={{ fontSize: 14, color: theme.gold }}>›</span>
        </button>
      )}

      {/* ── ① 전하기 · 만남 ─────────────── */}
      <Section>{t("home.secShare")}</Section>

      {/* 복음 전하기 — 전도 도구(글없는책·다리·사영리) */}
      <button onClick={() => router.push("/share")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", padding: "12px 15px", borderRadius: 16, border: `1px solid var(--t-sacredBorder)`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 8px 24px rgba(199,154,43,0.15)" }}>
        <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 14, background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", display: "grid", placeItems: "center" }}><MenuIcon name="megaphone" color="var(--t-sacred)" size={23} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: serif, display: "block", fontSize: 18, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: -0.2 }}>{t("home.shareTitle")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{t("home.shareSub")}</span>
        </span>
        <span style={{ fontSize: 16, color: "var(--t-sacred)" }}>›</span>
      </button>

      {/* 선교 도구 — 현장 도구·통역·전도 기록 (/reach) */}
      <HomeReachCard />

      {/* ── ② 양육 · 자라기 ─────────────── */}
      <Section>{t("home.secGrow")}</Section>

      <NavCard icon={<MenuIcon name="grad" color="var(--a-green-fg)" />} title={t("home.growSection")} sub={t("home.growSub")} onClick={() => router.push("/learn")} accent={ACCENT.green} />
      <NavCard icon={<MenuIcon name="book" color="var(--a-blue-fg)" />} title={t("menu.quiz.t")} sub={t("home.quizSub")} onClick={() => router.push("/play")} accent={ACCENT.blue} />

      {/* 📖 성경 완주 이어풀기 — 진행 중일 때만 (홈에서 한 번에 복귀) */}
      {resume && (
        <button onClick={() => router.push(`/quiz${resume.qs}`)} className="fade-in-2"
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 6, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--a-blue-border)", background: "var(--a-blue-bg)", cursor: "pointer", textAlign: "left" }}>
          <span style={{ fontSize: 15 }}>▶</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: "var(--a-blue-fg)" }}>{t("home.resumeQuiz", { d: resume.done, t: resume.total })}</span>
          <span style={{ height: 5, width: 90, borderRadius: 3, background: "var(--t-border)", overflow: "hidden", flexShrink: 0 }}>
            <span style={{ display: "block", height: "100%", width: `${Math.min(100, Math.round((resume.done / resume.total) * 100))}%`, background: "var(--a-blue-fg)" }} />
          </span>
        </button>
      )}
      <NavCard icon={<MenuIcon name="heart" color="var(--a-amber-fg)" />} title={t("home.comfortTitle")} sub={t("home.comfortSub")} onClick={() => router.push("/comfort")} accent={ACCENT.amber} />

      {/* ── ③ 정착 · 교회로 ─────────────── */}
      <Section>{t("home.secSettle")}</Section>

      {/* 교회와 연결 — 지역교회 소개 (골드 외곽선) */}
      <button onClick={() => router.push("/connect")} className="fade-in-2"
        style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", padding: "12px 15px", borderRadius: 16, border: `1px solid var(--t-sacredBorder)`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 8px 24px rgba(199,154,43,0.15)" }}>
        <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 14, background: "var(--t-sacredLight)", border: "1px solid var(--t-sacredBorder)", display: "grid", placeItems: "center" }}><MenuIcon name="church" color="var(--t-sacred)" size={23} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: serif, display: "block", fontSize: 18, fontWeight: 700, color: "var(--t-sacred)", letterSpacing: -0.2 }}>{t("home.connectTitle")}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{t("home.connectSub")}</span>
        </span>
        <span style={{ fontSize: 16, color: "var(--t-sacred)" }}>›</span>
      </button>

      {/* 빠른 이동 — 동행 / 랭킹 / 오답 */}
      <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
        <QuickChip icon="userPlus" label={t("common.companions")} onClick={() => router.push("/share/me")} badge={unread} />
        <QuickChip icon="trophy" label={t("common.ranking")} onClick={() => router.push("/ranking")} />
        {user && <QuickChip icon="list" label={t("common.wrongnote")} onClick={() => router.push("/history")} />}
        {user && <QuickChip icon="chart" label={t("common.progress")} onClick={() => router.push("/progress")} />}
      </div>

      {/* 하단 보조 링크 (긴급 SOS는 상단 바로 이동) */}
      <div style={{ marginTop: "auto", paddingTop: 9, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7 }}>
        {isAdmin && <SmallLink icon="dashboard" onClick={() => router.push("/admin")}>{t("home.adminShort")}</SmallLink>}
        <SmallLink icon="clipboard" onClick={() => router.push("/guide")}>{t("home.guideShort")}</SmallLink>
        {user && <SmallLink icon="share" onClick={shareInvite}>{t("home.inviteShort")}</SmallLink>}
        <SmallLink icon={user ? "account" : "lock"} onClick={() => router.push(user ? "/account" : "/privacy")}>{user ? t("home.accountShort") : t("privacy.title")}</SmallLink>
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

// 홈 섹션 구분 라벨 — 얇은 라인 + 작은 대문자풍 라벨(카드 색과 경쟁하지 않게 중립톤)
function Section({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "18px 3px 4px" }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 1.3, whiteSpace: "nowrap" }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: theme.border }} />
    </div>
  );
}

function NavCard({ icon, title, sub, onClick, accent }: { icon: ReactNode; title: string; sub: string; onClick: () => void; accent: Accent }) {
  return (
    <button onClick={onClick} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", marginTop: 8, padding: "11px 14px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: "pointer", color: theme.text, boxShadow: "0 2px 10px rgba(26,37,48,0.06), 0 1px 3px rgba(26,37,48,0.04)" }}>
      <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, background: accent.chip, display: "grid", placeItems: "center" }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: serif, display: "block", fontSize: 16.5, fontWeight: 700, color: theme.text, letterSpacing: -0.2 }}>{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>{sub}</span>
      </span>
      <span style={{ fontSize: 16, color: theme.textFaint }}>›</span>
    </button>
  );
}

function QuickChip({ icon, label, onClick, badge }: { icon: string; label: string; onClick: () => void; badge?: number }) {
  const text = label.replace(/^\p{Extended_Pictographic}️?\s*/u, ""); // 라벨 앞 이모지만 제거
  return (
    <button onClick={onClick}
      style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 6px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 13.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
      <MenuIcon name={icon} size={18} color={theme.textMuted} />
      {text}
      {badge ? <span style={{ position: "absolute", top: -5, right: 8, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 9.5, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 0 0 2px #fff" }}>{badge > 99 ? "99+" : badge}</span> : null}
    </button>
  );
}

function SmallLink({ children, onClick, icon }: { children: string; onClick: () => void; icon?: string }) {
  const text = children.replace(/^\p{Extended_Pictographic}️?\s*/u, ""); // 앞 '이모지'일 때만 제거
  return (
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 600, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {icon && <MenuIcon name={icon} size={16} color={theme.textFaint} />}
      {text}
    </button>
  );
}
