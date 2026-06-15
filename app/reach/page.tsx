"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { Seeker, STAGES, Stage, addSeeker, deleteSeeker, fetchSeekers, updateSeeker } from "@/lib/besora/seekers";
import { Group, fetchMyGroups, sendGroupMessage } from "@/lib/besora/groups";

const STAGE_COLOR: Record<Stage, string> = { interest: theme.textMuted, heard: theme.primarySoft, decided: theme.gold, settled: theme.correct };
const TODAY = () => new Date().toLocaleDateString("en-CA");
const SITE = "https://dabar.theamov.com";

function ReachInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { show, view } = useToast();

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
        <h1 style={{ fontSize: 18, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("reach.title")}</h1>
        <span style={{ width: 52 }} />
      </div>

      {!authLoading && !user ? (
        <p style={{ fontSize: 13, color: theme.textMuted, textAlign: "center", padding: "8px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10 }}>{t("reach.loginNeeded")}</p>
      ) : (
        <>
          {seekers.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {STAGES.map((s) => (
                <div key={s} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 12, background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: STAGE_COLOR[s] }}>{counts[s]}</div>
                  <div style={{ fontSize: 10.5, color: theme.textMuted, marginTop: 1 }}>{stageLabel(s)}</div>
                </div>
              ))}
            </div>
          )}

          {!adding && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setAdding(true)} style={{ flex: 1, padding: 13, fontSize: 15, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 14, cursor: "pointer" }}>{t("reach.add")}</button>
              {contactsSupported && <button onClick={importContacts} style={{ flexShrink: 0, padding: "13px 14px", fontSize: 13, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", whiteSpace: "nowrap" }}>{t("reach.fromContacts")}</button>}
            </div>
          )}

          {adding && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("reach.namePh")} autoFocus style={inp} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("reach.phonePh")} inputMode="tel" style={inp} />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("reach.notePh")} rows={2} style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAdding(false); setName(""); setPhone(""); setNote(""); }} style={{ flex: 1, padding: 11, fontSize: 14, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, cursor: "pointer" }}>{t("reach.cancel")}</button>
                <button onClick={submitAdd} disabled={!name.trim()} style={{ flex: 2, padding: 11, fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, cursor: "pointer", opacity: name.trim() ? 1 : 0.5 }}>{t("reach.save")}</button>
              </div>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem" }}>…</p>
          ) : seekers.length === 0 && !adding ? (
            <p style={{ fontSize: 13, color: theme.textFaint, textAlign: "center", padding: "1.5rem 0", lineHeight: 1.6 }}>{t("reach.empty")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {seekers.map((s) => (
                <div key={s.id} style={{ padding: "13px 14px", borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: theme.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}{dateBadge(s) && <span style={{ marginInlineStart: 8 }}>{dateBadge(s)}</span>}</span>
                    <button onClick={() => remove(s)} aria-label="delete" style={{ flexShrink: 0, fontSize: 13, color: theme.textFaint, background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px" }}>✕</button>
                  </div>

                  <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
                    {STAGES.map((st) => {
                      const on = s.stage === st;
                      return <button key={st} onClick={() => setStage(s, st)} style={{ flex: 1, padding: "7px 2px", fontSize: 11.5, fontWeight: on ? 800 : 600, borderRadius: 9, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? STAGE_COLOR[st] : "transparent", color: on ? "#fff" : theme.textMuted, whiteSpace: "nowrap" }}>{stageLabel(st)}</button>;
                    })}
                  </div>

                  {editId === s.id ? (
                    <div style={{ marginTop: 10 }}>
                      <textarea value={eNote} onChange={(e) => setENote(e.target.value)} rows={2} placeholder={t("reach.notePh")} style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
                      <input value={eAction} onChange={(e) => setEAction(e.target.value)} placeholder={t("reach.nextPh")} style={inp} />
                      <input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} style={inp} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setEditId(null)} style={{ flex: 1, padding: 9, fontSize: 12.5, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 9, cursor: "pointer" }}>{t("reach.cancel")}</button>
                        <button onClick={() => saveEdit(s.id)} style={{ flex: 2, padding: 9, fontSize: 12.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 9, cursor: "pointer" }}>{t("reach.save")}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {s.next_action && <p style={{ margin: "9px 0 0", fontSize: 12.5, color: theme.text, fontWeight: 600 }}>📌 {s.next_action}</p>}
                      {s.note && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: theme.textMuted, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{s.note}</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                        <button onClick={() => openEdit(s)} style={act}>{t("reach.edit")}</button>
                        <button onClick={() => shareSeeker(s)} style={act}>{t("reach.share")}</button>
                        <button onClick={() => openPray(s)} style={act}>{t("reach.pray")}</button>
                      </div>
                      {prayId === s.id && (
                        <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 10, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}` }}>
                          <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: theme.textMuted }}>{t("reach.pickGroup")}</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {groups.map((g) => <button key={g.id} onClick={() => prayTo(s, g.id)} style={{ ...act, background: theme.card }}>{g.name}</button>)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {view}
    </main>
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 12px", marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" };
const act: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 9, padding: "6px 11px", cursor: "pointer", whiteSpace: "nowrap" };

export default function ReachPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: theme.textMuted }}>…</main>}>
      <ReachInner />
    </Suspense>
  );
}
