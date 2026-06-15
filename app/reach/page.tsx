"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { Seeker, STAGES, Stage, addSeeker, deleteSeeker, fetchSeekers, updateSeeker } from "@/lib/besora/seekers";
import { Group, fetchMyGroups, sendGroupMessage } from "@/lib/besora/groups";
import { MinistryEvent, MinistryNotice, fetchEvents, addEvent, deleteEvent, fetchNotices, addNotice, deleteNotice } from "@/lib/besora/ministry";
import HomeFxCard from "@/components/HomeFxCard";
import VoiceTranslator from "@/components/besora/VoiceTranslator";
import { LanguageProvider } from "@/lib/besora/LanguageContext";

const STAGE_COLOR: Record<Stage, string> = { interest: theme.textMuted, heard: theme.primarySoft, decided: theme.gold, settled: theme.correct };
const TODAY = () => new Date().toLocaleDateString("en-CA");
const SITE = "https://dabar.theamov.com";

function ReachInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const { user, loading: authLoading, isAdmin, isLeader } = useAuth();
  const { show, view } = useToast();
  const canManage = isAdmin || isLeader;

  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(params.get("add") === "1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [eNote, setENote] = useState("");
  const [eAction, setEAction] = useState("");
  const [eDate, setEDate] = useState("");
  const [prayId, setPrayId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  const contactsSupported = typeof navigator !== "undefined" && "contacts" in navigator && typeof window !== "undefined" && "ContactsManager" in window;

  async function load() { setLoading(true); setSeekers(await fetchSeekers()); setLoading(false); }
  useEffect(() => { if (!authLoading) load(); /* eslint-disable-next-line */ }, [user, authLoading]);

  const stageLabel = (s: Stage) => t("reach.s." + s);
  const counts: Record<Stage, number> = { interest: 0, heard: 0, decided: 0, settled: 0 };
  seekers.forEach((s) => { if (counts[s.stage] !== undefined) counts[s.stage]++; });

  async function submitAdd() {
    if (!name.trim()) return;
    try { const s = await addSeeker(name, note, { phone }); if (s) setSeekers((p) => [s, ...p]); setName(""); setPhone(""); setNote(""); setAdding(false); }
    catch { show(t("reach.notReady")); }
  }
  async function setStage(s: Seeker, stage: Stage) {
    setSeekers((p) => p.map((x) => x.id === s.id ? { ...x, stage } : x));
    try { await updateSeeker(s.id, { stage }); } catch { show(t("reach.notReady")); load(); }
  }
  function openEdit(s: Seeker) { setEditId(s.id); setENote(s.note ?? ""); setEAction(s.next_action ?? ""); setEDate(s.next_at ?? ""); }
  async function saveEdit(id: string) {
    const patch = { note: eNote.trim() || null, next_action: eAction.trim() || null, next_at: eDate || null };
    setSeekers((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x));
    setEditId(null);
    try { await updateSeeker(id, patch); } catch { show(t("reach.notReady")); }
  }
  async function remove(s: Seeker) {
    if (!confirm(t("reach.delConfirm"))) return;
    setSeekers((p) => p.filter((x) => x.id !== s.id));
    await deleteSeeker(s.id);
  }
  async function shareSeeker(s: Seeker) {
    const text = `${t("reach.shareText", { name: s.name })} ${SITE}`;
    try {
      if (navigator.share) await navigator.share({ title: "DABAR", text });
      else { await navigator.clipboard.writeText(text); show(t("reach.copied")); }
    } catch { /* canceled */ }
  }
  async function openPray(s: Seeker) {
    const gs = await fetchMyGroups();
    if (!gs.length) { show(t("reach.noGroups")); return; }
    setGroups(gs); setPrayId(s.id);
  }
  async function prayTo(s: Seeker, groupId: string) {
    setPrayId(null);
    const body = `${t("reach.prayMsg")} — ${s.name}${s.note ? ": " + s.note : ""}`;
    try { await sendGroupMessage(groupId, body); show(t("reach.prayPosted")); } catch { show(t("reach.notReady")); }
  }
  async function importContacts() {
    try {
      const sel = await (navigator as unknown as { contacts: { select: (p: string[], o: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> } }).contacts.select(["name", "tel"], { multiple: true });
      const added: Seeker[] = [];
      for (const c of sel) {
        const nm = (c.name && c.name[0]) || (c.tel && c.tel[0]) || "";
        const tel = (c.tel && c.tel[0]) || "";
        if (!nm && !tel) continue;
        const s = await addSeeker(nm || tel, "", { phone: tel });
        if (s) added.push(s);
      }
      if (added.length) setSeekers((p) => [...added, ...p]);
    } catch { /* canceled / unsupported */ }
  }

  const dateBadge = (s: Seeker) => {
    if (!s.next_at) return null;
    const due = s.next_at <= TODAY();
    const isToday = s.next_at === TODAY();
    const label = isToday ? t("reach.today") : new Date(s.next_at + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric" });
    return <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: due ? theme.wrong : theme.primarySoft, borderRadius: 999, padding: "2px 8px" }}>{due && !isToday ? t("reach.overdue") + " · " : ""}{label}</span>;
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer" }}>{t("common.home")}</button>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: theme.gold, margin: 0, textAlign: "center", flex: 1 }}>{t("reach.title")}</h1>
        <span style={{ width: 52 }} />
      </div>

      {/* 1) 사역 일정  2) 사역 공지사항 — 관리자·리더 등록, 전체 열람 */}
      {user && <MinistrySchedule canManage={canManage} notify={show} />}
      {user && <MinistryNoticesSection canManage={canManage} notify={show} />}

      {/* 3) 환율 계산기 (바트 ↔ 원) */}
      <HomeFxCard />

      {/* 4) 번역 도구 */}
      <LanguageProvider><VoiceTranslator inline /></LanguageProvider>

      {/* 5) 전도 여정(내가 전하는 사람들)은 일단 숨김 — 추후 복원 가능 */}
      {view}
    </main>
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 12px", marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" };
const act: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 9, padding: "6px 11px", cursor: "pointer", whiteSpace: "nowrap" };

// ── 사역 허브 공통 스타일 ────────────────────────────────────────────
const secHead: React.CSSProperties = { fontSize: 14.5, fontWeight: 800, color: theme.gold, margin: 0 };
const addBtn: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" };
const formBox: React.CSSProperties = { marginBottom: 10, padding: 12, borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card };
const btnGhost: React.CSSProperties = { flex: 1, padding: 10, fontSize: 13, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 9, cursor: "pointer" };
const btnPrimary: React.CSSProperties = { flex: 2, padding: 10, fontSize: 13, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 9, cursor: "pointer" };
const itemCard: React.CSSProperties = { padding: "11px 13px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card };
const emptyP: React.CSSProperties = { fontSize: 12.5, color: theme.textFaint, textAlign: "center", padding: "10px 0" };
const delX: React.CSSProperties = { flexShrink: 0, fontSize: 12, color: theme.textFaint, background: "transparent", border: "none", cursor: "pointer", padding: "0 2px" };
const fmtWhen = (iso: string) => new Date(iso).toLocaleString([], { month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });

function MinistrySchedule({ canManage, notify }: { canManage: boolean; notify: (m: string) => void }) {
  const { t } = useI18n();
  const [list, setList] = useState<MinistryEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [at, setAt] = useState(""); const [place, setPlace] = useState(""); const [note, setNote] = useState("");
  useEffect(() => { fetchEvents().then(setList).catch(() => {}); }, []);
  async function submit() {
    if (!title.trim() || !at) return;
    try {
      const e = await addEvent({ title, starts_at: new Date(at).toISOString(), place, note });
      if (e) setList((p) => [...p, e].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
      setTitle(""); setAt(""); setPlace(""); setNote(""); setOpen(false);
    } catch { notify(t("min.notReady")); }
  }
  async function del(id: string) {
    if (!confirm(t("min.delConfirm"))) return;
    setList((p) => p.filter((x) => x.id !== id));
    try { await deleteEvent(id); } catch { notify(t("min.notReady")); }
  }
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <h2 style={secHead}>{t("min.schedule")}</h2>
        {canManage && !open && <button onClick={() => setOpen(true)} style={addBtn}>{t("min.addEvent")}</button>}
      </div>
      {canManage && open && (
        <div style={formBox}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("min.titlePh")} autoFocus style={inp} />
          <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} style={inp} />
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t("min.placePh")} style={inp} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("min.eventNotePh")} style={inp} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setOpen(false)} style={btnGhost}>{t("reach.cancel")}</button>
            <button onClick={submit} disabled={!title.trim() || !at} style={{ ...btnPrimary, opacity: title.trim() && at ? 1 : 0.5 }}>{t("reach.save")}</button>
          </div>
        </div>
      )}
      {list.length === 0 ? <p style={emptyP}>{t("min.noEvents")}</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((e) => (
            <div key={e.id} style={itemCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.text }}>{e.title}</span>
                {canManage && <button onClick={() => del(e.id)} aria-label="delete" style={delX}>✕</button>}
              </div>
              <div style={{ fontSize: 12.5, color: theme.primarySoft, fontWeight: 700, marginTop: 3 }}>🗓️ {fmtWhen(e.starts_at)}</div>
              {e.place && <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>📍 {e.place}</div>}
              {e.note && <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2, whiteSpace: "pre-wrap" }}>{e.note}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MinistryNoticesSection({ canManage, notify }: { canManage: boolean; notify: (m: string) => void }) {
  const { t } = useI18n();
  const [list, setList] = useState<MinistryNotice[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  useEffect(() => { fetchNotices().then(setList).catch(() => {}); }, []);
  async function submit() {
    if (!title.trim()) return;
    try {
      const n = await addNotice({ title, body });
      if (n) setList((p) => [n, ...p]);
      setTitle(""); setBody(""); setOpen(false);
    } catch { notify(t("min.notReady")); }
  }
  async function del(id: string) {
    if (!confirm(t("min.delConfirm"))) return;
    setList((p) => p.filter((x) => x.id !== id));
    try { await deleteNotice(id); } catch { notify(t("min.notReady")); }
  }
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <h2 style={secHead}>{t("min.notices")}</h2>
        {canManage && !open && <button onClick={() => setOpen(true)} style={addBtn}>{t("min.addNotice")}</button>}
      </div>
      {canManage && open && (
        <div style={formBox}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("min.titlePh")} autoFocus style={inp} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("min.bodyPh")} rows={3} style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setOpen(false)} style={btnGhost}>{t("reach.cancel")}</button>
            <button onClick={submit} disabled={!title.trim()} style={{ ...btnPrimary, opacity: title.trim() ? 1 : 0.5 }}>{t("reach.save")}</button>
          </div>
        </div>
      )}
      {list.length === 0 ? <p style={emptyP}>{t("min.noNotices")}</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((n) => (
            <div key={n.id} style={itemCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>📢 {n.title}</span>
                {canManage && <button onClick={() => del(n.id)} aria-label="delete" style={delX}>✕</button>}
              </div>
              {n.body && <p style={{ margin: "5px 0 0", fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{n.body}</p>}
              <p style={{ margin: "6px 0 0", fontSize: 10.5, color: theme.textFaint }}>{fmtDay(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ReachPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: theme.textMuted }}>…</main>}>
      <ReachInner />
    </Suspense>
  );
}
