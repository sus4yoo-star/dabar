"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { Seeker, STAGES, Stage, addSeeker, deleteSeeker, fetchSeekers, updateSeeker } from "@/lib/besora/seekers";

const STAGE_COLOR: Record<Stage, string> = { interest: theme.textMuted, heard: theme.primarySoft, decided: theme.gold, settled: theme.correct };

export default function ReachPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { show, view } = useToast();

  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const firstLoad = useRef(true);

  async function load() { setLoading(true); setSeekers(await fetchSeekers()); setLoading(false); }
  useEffect(() => { if (!authLoading) load(); /* eslint-disable-next-line */ }, [user, authLoading]);

  const stageLabel = (s: Stage) => t("reach.s." + s);

  async function submitAdd() {
    if (!name.trim()) return;
    try { const s = await addSeeker(name, note); if (s) setSeekers((p) => [s, ...p]); setName(""); setNote(""); setAdding(false); }
    catch { show(t("reach.notReady")); }
  }
  async function setStage(s: Seeker, stage: Stage) {
    setSeekers((p) => p.map((x) => x.id === s.id ? { ...x, stage } : x));
    try { await updateSeeker(s.id, { stage }); } catch { show(t("reach.notReady")); load(); }
  }
  async function saveNote(id: string) {
    setSeekers((p) => p.map((x) => x.id === id ? { ...x, note: editNote.trim() || null } : x));
    setEditId(null);
    try { await updateSeeker(id, { note: editNote.trim() || null }); } catch { show(t("reach.notReady")); }
  }
  async function remove(s: Seeker) {
    if (!confirm(t("reach.delConfirm"))) return;
    setSeekers((p) => p.filter((x) => x.id !== s.id));
    await deleteSeeker(s.id);
  }

  const counts: Record<Stage, number> = { interest: 0, heard: 0, decided: 0, settled: 0 };
  seekers.forEach((s) => { if (counts[s.stage] !== undefined) counts[s.stage]++; });

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
          {/* 단계 요약 */}
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

          {!adding && <button onClick={() => setAdding(true)} style={{ width: "100%", padding: 13, marginBottom: 14, fontSize: 15, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 14, cursor: "pointer" }}>{t("reach.add")}</button>}

          {adding && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("reach.namePh")} autoFocus
                style={{ width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 12px", marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" }} />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("reach.notePh")} rows={2}
                style={{ width: "100%", boxSizing: "border-box", resize: "none", fontSize: 14, padding: "10px 12px", marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none", lineHeight: 1.5 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAdding(false); setName(""); setNote(""); }} style={{ flex: 1, padding: 11, fontSize: 14, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, cursor: "pointer" }}>{t("reach.cancel")}</button>
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
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: theme.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <button onClick={() => remove(s)} aria-label="delete" style={{ flexShrink: 0, fontSize: 13, color: theme.textFaint, background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px" }}>✕</button>
                  </div>

                  {/* 단계 칩 — 탭하면 이동 */}
                  <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
                    {STAGES.map((st) => {
                      const on = s.stage === st;
                      return (
                        <button key={st} onClick={() => setStage(s, st)}
                          style={{ flex: 1, padding: "7px 2px", fontSize: 11.5, fontWeight: on ? 800 : 600, borderRadius: 9, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? STAGE_COLOR[st] : "transparent", color: on ? "#fff" : theme.textMuted, whiteSpace: "nowrap" }}>{stageLabel(st)}</button>
                      );
                    })}
                  </div>

                  {/* 메모/기도 */}
                  {editId === s.id ? (
                    <div style={{ marginTop: 9 }}>
                      <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2} placeholder={t("reach.notePh")}
                        style={{ width: "100%", boxSizing: "border-box", resize: "none", fontSize: 13.5, padding: "8px 10px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none", lineHeight: 1.5 }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button onClick={() => setEditId(null)} style={{ flex: 1, padding: 8, fontSize: 12.5, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 9, cursor: "pointer" }}>{t("reach.cancel")}</button>
                        <button onClick={() => saveNote(s.id)} style={{ flex: 2, padding: 8, fontSize: 12.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 9, cursor: "pointer" }}>{t("reach.save")}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12.5, color: s.note ? theme.textMuted : theme.textFaint, lineHeight: 1.55, whiteSpace: "pre-wrap", flex: 1 }}>{s.note || "🙏"}</p>
                      <button onClick={() => { setEditId(s.id); setEditNote(s.note ?? ""); }} style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: theme.primarySoft, background: "transparent", border: `1px solid ${theme.cardBorder}`, borderRadius: 8, padding: "4px 9px", cursor: "pointer" }}>{t("reach.edit")}</button>
                    </div>
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
