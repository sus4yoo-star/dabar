"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import ShareSection from "@/components/besora/ShareSection";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { useAuth } from "@/lib/auth";
import {
  fetchSeekers, addSeeker, updateSeeker, deleteSeeker,
  STAGES, type Seeker, type Stage,
} from "@/lib/besora/seekers";

// 단계 색(전도 여정: 관심→복음들음→영접→정착)
const STAGE_COLOR: Record<Stage, { fg: string; chip: string }> = {
  interest: { fg: "#9a6a12", chip: "rgba(199,154,43,0.14)" },
  heard:    { fg: "#1573c4", chip: "rgba(31,143,230,0.12)" },
  decided:  { fg: "#1ea85a", chip: "rgba(30,168,90,0.14)" },
  settled:  { fg: "#6a5aa8", chip: "rgba(124,108,176,0.16)" },
};
const stageKey: Record<Stage, string> = { interest: "stInterest", heard: "stHeard", decided: "stDecided", settled: "stSettled" };

export default function SeekersPage() {
  const { myLang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null); // 상세 편집 펼침

  const T = (k: string) => ui(myLang, k as Parameters<typeof ui>[1]);
  const today = new Date().toLocaleDateString("en-CA");

  const load = useCallback(() => {
    setLoading(true);
    fetchSeekers().then(setList).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (user) load(); else setLoading(false); }, [user, load]);

  async function add() {
    if (!name.trim() || busy) return;
    setBusy(true);
    try { await addSeeker(name, note); setName(""); setNote(""); load(); }
    catch { /* 로그인/네트워크 */ }
    finally { setBusy(false); }
  }
  async function setStage(s: Seeker, stage: Stage) {
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, stage } : x))); // 낙관적
    try { await updateSeeker(s.id, { stage }); } catch { load(); }
  }
  async function saveDetail(s: Seeker, patch: Partial<Seeker>) {
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
    try { await updateSeeker(s.id, patch); } catch { load(); }
  }
  async function remove(s: Seeker) {
    if (!confirm(`'${s.name}' ${T("skDelete")}?`)) return;
    setList((prev) => prev.filter((x) => x.id !== s.id));
    await deleteSeeker(s.id);
  }

  // 비로그인(게스트): 안내
  if (!authLoading && !user) {
    return (
      <AppShell title={T("seekersTitle")} subtitle={T("seekersSub")}>
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: theme.textMuted }}>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>{T("seekersLogin")}</p>
          <Link href="/login" style={{ display: "inline-block", padding: "11px 22px", borderRadius: 12, background: "var(--t-sacred)", color: "#fff", fontWeight: 800, textDecoration: "none" }}>{ui(myLang, "home") === "Home" ? "Sign in" : "로그인"}</Link>
        </div>
      </AppShell>
    );
  }

  const due = list.filter((s) => s.next_at && s.next_at <= today && s.stage !== "settled");

  return (
    <AppShell title={T("seekersTitle")} subtitle={T("seekersSub")}>
      {/* 추가 폼 */}
      <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "13px 14px", marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={T("skName")} maxLength={40}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          style={inp} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={T("skNote")} maxLength={200}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          style={{ ...inp, marginTop: 8 }} />
        <button onClick={add} disabled={!name.trim() || busy}
          style={{ marginTop: 10, width: "100%", padding: 12, borderRadius: 12, border: "none", background: "var(--t-sacred)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: name.trim() && !busy ? "pointer" : "default", opacity: name.trim() && !busy ? 1 : 0.55 }}>
          + {T("seekersAdd")}
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 13 }}>…</p>}

      {!loading && list.length === 0 && (
        <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 13.5, lineHeight: 1.7, padding: "1.5rem 1rem" }}>{T("seekersEmpty")}</p>
      )}

      {/* 오늘 챙길 사람 */}
      {due.length > 0 && (
        <>
          <ShareSection icon="heart">{T("seekersDue")} · {due.length}</ShareSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 6 }}>
            {due.map((s) => <Card key={s.id} s={s} T={T} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} onStage={setStage} onSave={saveDetail} onDelete={remove} highlight />)}
          </div>
        </>
      )}

      {/* 전체 — 단계별 */}
      {!loading && list.length > 0 && STAGES.map((stage) => {
        const rows = list.filter((s) => s.stage === stage);
        if (rows.length === 0) return null;
        const c = STAGE_COLOR[stage];
        return (
          <div key={stage} style={{ marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 2px 8px" }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: c.fg }}>{T(stageKey[stage])}</span>
              <span style={{ fontSize: 12, color: theme.textFaint }}>{rows.length}</span>
              <span style={{ flex: 1, height: 1, background: c.fg, opacity: 0.22 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((s) => <Card key={s.id} s={s} T={T} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} onStage={setStage} onSave={saveDetail} onDelete={remove} />)}
            </div>
          </div>
        );
      })}
    </AppShell>
  );
}

function Card({ s, T, open, onToggle, onStage, onSave, onDelete, highlight }: {
  s: Seeker; T: (k: string) => string; open: boolean; onToggle: () => void;
  onStage: (s: Seeker, stage: Stage) => void; onSave: (s: Seeker, patch: Partial<Seeker>) => void;
  onDelete: (s: Seeker) => void; highlight?: boolean;
}) {
  const [note, setNote] = useState(s.note ?? "");
  const [phone, setPhone] = useState(s.phone ?? "");
  const [action, setAction] = useState(s.next_action ?? "");
  const [at, setAt] = useState(s.next_at ?? "");

  return (
    <div style={{ background: theme.card, border: `1px solid ${highlight ? "var(--t-sacredBorder)" : theme.cardBorder}`, borderRadius: 16, padding: "12px 13px", boxShadow: highlight ? "0 4px 14px rgba(199,154,43,0.12)" : "0 2px 8px rgba(26,37,48,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700, color: theme.text }}>{s.name}</span>
        <button onClick={onToggle} aria-label="edit" style={{ background: "none", border: "none", color: theme.textMuted, fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>⋯</button>
      </div>

      {s.note && <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.5, color: theme.textMuted }}>{s.note}</p>}
      {s.next_at && <p style={{ margin: "5px 0 0", fontSize: 12, fontWeight: 700, color: "var(--t-sacred)" }}>📌 {s.next_action || "—"} · {s.next_at}</p>}

      {/* 단계 칩 */}
      <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
        {STAGES.map((stage) => {
          const active = s.stage === stage;
          const c = STAGE_COLOR[stage];
          return (
            <button key={stage} onClick={() => onStage(s, stage)}
              style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${active ? c.fg : theme.cardBorder}`,
                background: active ? c.chip : "transparent",
                color: active ? c.fg : theme.textMuted }}>
              {T(stageKey[stage])}
            </button>
          );
        })}
      </div>

      {/* 상세 편집 */}
      {open && (
        <div style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${theme.cardBorder}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={T("skNote")} maxLength={200} style={inpSm} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={T("skPhone")} maxLength={60} style={inpSm} />
          <div style={{ display: "flex", gap: 8 }}>
            <input value={action} onChange={(e) => setAction(e.target.value)} placeholder={T("skNext")} maxLength={80} style={{ ...inpSm, flex: 1 }} />
            <input type="date" value={at} onChange={(e) => setAt(e.target.value)} style={{ ...inpSm, width: 148 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button onClick={() => { onSave(s, { note: note.trim() || null, phone: phone.trim() || null, next_action: action.trim() || null, next_at: at || null }); onToggle(); }}
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: "var(--t-sacred)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{T("skSave")}</button>
            <button onClick={() => onDelete(s)}
              style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${theme.wrong}`, background: "transparent", color: theme.wrong, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{T("skDelete")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 14.5, border: `1px solid ${theme.border}`, borderRadius: 11, outline: "none", background: theme.bg, color: theme.text };
const inpSm: React.CSSProperties = { ...inp, padding: "9px 11px", fontSize: 13.5 };
