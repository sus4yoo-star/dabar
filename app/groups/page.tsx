"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { getSupabase } from "@/lib/besora/supabase";
import { Group, MAX_MEMBERS, createGroup, fetchMyGroupIds, fetchPublicGroups, joinGroup } from "@/lib/besora/groups";
import { PageHeader, ACCENT, softShadow } from "@/lib/ui";

export default function GroupsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isLeader, isAdmin } = useAuth();
  const { show, view } = useToast();
  const canCreate = !!user && (isLeader || isAdmin);

  const [groups, setGroups] = useState<Group[]>([]);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", place: "", schedule: "", description: "" });
  const [diag, setDiag] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "members">("recent");

  // 권한 진단 — 앱이 실제로 읽는 값을 그대로 보여줌
  async function runDiag() {
    const out: string[] = [];
    out.push(`앱 권한값: isAdmin=${isAdmin} · isLeader=${isLeader}`);
    try {
      const { data: au } = await supabase.auth.getUser();
      const uid = au.user?.id ?? null;
      out.push(`로그인 uid: ${uid ?? "(로그인 안 됨)"}`);
      if (uid) {
        const r = await supabase.from("profiles").select("is_admin, is_leader").eq("id", uid).maybeSingle();
        if (r.error) out.push(`profiles 조회 오류: ${r.error.message}`);
        else if (!r.data) out.push("이 uid의 profiles 행이 없음");
        else out.push(`DB 직접 읽기: is_admin=${r.data.is_admin} · is_leader=${(r.data as { is_leader?: boolean }).is_leader}`);
      }
    } catch (e) { out.push("auth/profiles 예외: " + ((e as Error)?.message ?? e)); }
    try {
      const g = await getSupabase().from("groups").select("id").limit(1);
      out.push(g.error ? `groups 테이블: ${g.error.message}` : "groups 테이블: OK");
    } catch (e) { out.push("groups 예외: " + ((e as Error)?.message ?? e)); }
    try {
      const rp = await getSupabase().rpc("create_group", { p_name: "", p_place: "", p_schedule: "", p_desc: "" });
      out.push(rp.error ? `create_group RPC: ${rp.error.message}` : "create_group RPC: (빈 이름 통과?!)");
    } catch (e) { out.push("rpc 예외: " + ((e as Error)?.message ?? e)); }
    setDiag(out);
  }

  async function load() {
    setLoading(true);
    const [gs, ids] = await Promise.all([fetchPublicGroups(), fetchMyGroupIds()]);
    setGroups(gs); setMyIds(ids); setLoading(false);
  }
  useEffect(() => { load(); }, [user]);

  async function submitCreate() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      const id = await createGroup(form);
      router.push(`/groups/${id}`);
    } catch (e: any) {
      show(/leader/.test(e?.message) ? t("grp.leaderOnly") : t("grp.notReady"));
      setSaving(false);
    }
  }

  async function join(id: string) {
    if (!user) { router.push("/login"); return; }
    try { await joinGroup(id); }
    catch (e) { if ((e as Error)?.message === "full") { show(t("grp.fullMsg")); await load(); return; } }
    router.push(`/groups/${id}`);
  }

  const ql = q.trim().toLowerCase();
  const match = (g: Group) => !ql || g.name.toLowerCase().includes(ql) || (g.place ?? "").toLowerCase().includes(ql) || (g.schedule ?? "").toLowerCase().includes(ql);
  const bySort = (a: Group, b: Group) => sort === "members"
    ? b.member_count - a.member_count
    : (a.last_at < b.last_at ? 1 : a.last_at > b.last_at ? -1 : 0);
  const mine = groups.filter(g => myIds.has(g.id)).filter(match).sort(bySort);
  const others = groups.filter(g => !myIds.has(g.id)).filter(match).sort(bySort);
  const totalOthers = groups.filter(g => !myIds.has(g.id)).length;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <PageHeader title={`🤝 ${t("grp.title")}`} onHome={() => router.push("/")} homeLabel={t("common.home")} />

      {canCreate && !creating && (
        <button onClick={() => setCreating(true)} style={{ width: "100%", padding: 14, marginBottom: 14, fontSize: 15, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#1f9bef 0%,#1577c2 100%)", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(31,155,239,0.25)" }}>{t("grp.create")}</button>
      )}
      {user && !canCreate && (
        <div style={{ margin: "0 0 14px", padding: "10px 12px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10 }}>
          <p style={{ fontSize: 12.5, color: theme.textMuted, textAlign: "center", margin: 0, lineHeight: 1.5 }}>{t("grp.leaderOnly")}</p>
          <button onClick={runDiag} style={{ display: "block", margin: "8px auto 0", fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: "transparent", border: `1px solid ${theme.cardBorder}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>🔧 권한 진단</button>
          {diag.length > 0 && (
            <pre style={{ marginTop: 10, fontSize: 11, lineHeight: 1.6, color: theme.text, background: theme.bg, border: `1px solid ${theme.cardBorder}`, borderRadius: 8, padding: 10, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{diag.join("\n")}</pre>
          )}
        </div>
      )}

      {creating && (
        <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
          <Field v={form.name} ph={t("grp.namePh")} on={v => setForm(f => ({ ...f, name: v }))} />
          <Field v={form.place} ph={t("grp.placePh")} on={v => setForm(f => ({ ...f, place: v }))} />
          <Field v={form.schedule} ph={t("grp.schedulePh")} on={v => setForm(f => ({ ...f, schedule: v }))} />
          <Field v={form.description} ph={t("grp.descPh")} on={v => setForm(f => ({ ...f, description: v }))} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => { setCreating(false); setForm({ name: "", place: "", schedule: "", description: "" }); }} style={{ flex: 1, padding: 11, fontSize: 14, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, cursor: "pointer" }}>{t("grp.cancel")}</button>
            <button onClick={submitCreate} disabled={!form.name.trim() || saving} style={{ flex: 2, padding: 11, fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 10, cursor: "pointer", opacity: form.name.trim() ? 1 : 0.5 }}>{t("grp.make")}</button>
          </div>
        </div>
      )}

      {!user && <p style={{ fontSize: 12.5, color: theme.textMuted, textAlign: "center", margin: "0 0 14px", padding: "8px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10 }}>{t("grp.loginNeeded")}</p>}

      {!loading && totalOthers > 1 && (
        <div style={{ marginBottom: 14 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("grp.search")} aria-label={t("grp.search")}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 13px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {(["recent", "members"] as const).map(s => (
              <button key={s} onClick={() => setSort(s)} style={{ fontSize: 12, fontWeight: sort === s ? 800 : 600, padding: "5px 12px", borderRadius: 999, cursor: "pointer", border: `1px solid ${sort === s ? "transparent" : theme.cardBorder}`, background: sort === s ? theme.primary : theme.card, color: sort === s ? "#fff" : theme.textMuted }}>{t(s === "recent" ? "grp.sortRecent" : "grp.sortMembers")}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: theme.textMuted, padding: "2rem" }}>…</p>
      ) : (
        <>
          {mine.length > 0 && (
            <Section title={t("grp.mine")}>
              {mine.map(g => <GroupCard key={g.id} g={g} member onOpen={() => router.push(`/groups/${g.id}`)} t={t} />)}
            </Section>
          )}
          <Section title={t("grp.public")}>
            {others.length > 0
              ? others.map(g => <GroupCard key={g.id} g={g} onOpen={() => join(g.id)} t={t} />)
              : <p style={{ fontSize: 13, color: theme.textFaint, textAlign: "center", padding: "1.5rem 0", lineHeight: 1.6 }}>
                  {ql ? t("grp.noMatch") : mine.length === 0 ? (canCreate ? t("grp.emptyLeader") : t("grp.empty")) : ""}
                </p>}
          </Section>
        </>
      )}
      {view}
    </main>
  );
}

function Field({ v, ph, on }: { v: string; ph: string; on: (v: string) => void }) {
  return <input value={v} onChange={e => on(e.target.value)} placeholder={ph}
    style={{ width: "100%", boxSizing: "border-box", fontSize: 14, padding: "10px 12px", marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.8, textTransform: "uppercase", margin: "0 0 8px 2px" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function GroupCard({ g, member, onOpen, t }: { g: Group; member?: boolean; onOpen: () => void; t: (k: string) => string }) {
  const full = !member && g.member_count >= MAX_MEMBERS;
  const ac = member ? ACCENT.green : ACCENT.blue;
  return (
    <button onClick={full ? undefined : onOpen} disabled={full} className="fade-in-2"
      style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", padding: "13px 14px", borderRadius: 16, border: `1px solid ${full ? theme.cardBorder : ac.border}`, background: full ? theme.card : ac.bg, cursor: full ? "default" : "pointer", opacity: full ? 0.6 : 1, boxShadow: softShadow }}>
      <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: ac.chip, display: "grid", placeItems: "center", fontSize: 22 }}>🤝</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 2 }}>{g.name}</span>
        {g.place && <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted }}>📍 {g.place}</span>}
        {g.schedule && <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted }}>🕒 {g.schedule}</span>}
        <span style={{ display: "block", fontSize: 11.5, color: theme.textFaint, marginTop: 3 }}>👥 {g.member_count}/{MAX_MEMBERS}{t("grp.members")}</span>
      </span>
      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 800, color: "#fff", background: member ? theme.gold : full ? theme.textFaint : theme.primary, borderRadius: 11, padding: "9px 15px" }}>{member ? t("grp.enter") : full ? t("grp.full") : t("grp.join")}</span>
    </button>
  );
}
