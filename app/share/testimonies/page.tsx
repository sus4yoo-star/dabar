"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { useAuth } from "@/lib/auth";
import { fetchTestimonies, addTestimony, deleteTestimony, toggleAmen, type Testimony } from "@/lib/besora/testimonies";

export default function TestimoniesPage() {
  const { myLang } = useLang();
  const { user, nickname, isAdmin, loading: authLoading } = useAuth();
  const T = (k: string) => ui(myLang, k as Parameters<typeof ui>[1]);

  const [items, setItems] = useState<Testimony[]>([]);
  const [amened, setAmened] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchTestimonies().then(({ items, amened }) => { setItems(items); setAmened(amened); }).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (user) load(); else setLoading(false); }, [user, load]);

  async function post() {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    try { await addTestimony(text, { anonymous: anon, displayName: nickname }); setBody(""); load(); }
    catch { /* */ }
    finally { setBusy(false); }
  }

  async function amen(t: Testimony) {
    const wasOn = amened.has(t.id);
    // 낙관적
    setAmened((prev) => { const n = new Set(prev); if (wasOn) n.delete(t.id); else n.add(t.id); return n; });
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, amen_count: Math.max(0, x.amen_count + (wasOn ? -1 : 1)) } : x)));
    const res = await toggleAmen(t.id);
    if (res) setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, amen_count: res.count } : x)));
  }

  async function remove(t: Testimony) {
    if (!confirm(T("testiDelete") + "?")) return;
    setItems((prev) => prev.filter((x) => x.id !== t.id));
    await deleteTestimony(t.id);
  }

  if (!authLoading && !user) {
    return (
      <AppShell title={T("testiTitle")} subtitle={T("testiSub")}>
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: theme.textMuted }}>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>{T("testiLogin")}</p>
          <Link href="/login" style={{ display: "inline-block", padding: "11px 22px", borderRadius: 12, background: "var(--t-sacred)", color: "#fff", fontWeight: 800, textDecoration: "none" }}>{myLang === "ko" ? "로그인" : "Sign in"}</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={T("testiTitle")} subtitle={T("testiSub")}>
      {/* 작성 */}
      <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "13px 14px", marginBottom: 14 }}>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={T("testiPlaceholder")} rows={3} maxLength={1500}
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 14.5, lineHeight: 1.6, border: `1px solid ${theme.border}`, borderRadius: 11, outline: "none", background: theme.bg, color: theme.text, resize: "vertical" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: theme.textMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} style={{ width: 16, height: 16 }} />
            {T("testiAnon")}
          </label>
          <button onClick={post} disabled={!body.trim() || busy}
            style={{ padding: "9px 20px", borderRadius: 11, border: "none", background: "var(--t-sacred)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: body.trim() && !busy ? "pointer" : "default", opacity: body.trim() && !busy ? 1 : 0.55 }}>
            {T("testiPost")}
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 13 }}>…</p>}
      {!loading && items.length === 0 && (
        <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 13.5, lineHeight: 1.7, padding: "1.5rem 1rem" }}>{T("testiEmpty")}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {items.map((t) => {
          const on = amened.has(t.id);
          const mine = user?.id === t.owner;
          return (
            <div key={t.id} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "13px 15px", boxShadow: "0 2px 8px rgba(26,37,48,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: theme.text }}>{t.display_name || T("testiAnonName")}</span>
                <span style={{ fontSize: 11.5, color: theme.textFaint }}>{new Date(t.created_at).toLocaleDateString()}</span>
                <span style={{ flex: 1 }} />
                {(mine || isAdmin) && <button onClick={() => remove(t)} style={{ fontSize: 11.5, color: theme.textFaint, background: "none", border: "none", cursor: "pointer" }}>{T("testiDelete")}</button>}
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: theme.text, whiteSpace: "pre-wrap" }}>{t.body}</p>
              <div style={{ marginTop: 10 }}>
                <button onClick={() => amen(t)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, padding: "7px 14px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${on ? "var(--t-sacred)" : theme.cardBorder}`,
                    background: on ? "var(--t-sacredLight)" : "transparent",
                    color: on ? "var(--t-sacred)" : theme.textMuted }}>
                  🙏 {T("testiAmen")}{t.amen_count > 0 ? ` ${t.amen_count}` : ""}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
