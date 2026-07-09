"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { serif } from "@/lib/ui";

// 교회 연결 요청 — 지역·연락처를 남기면 관리자가 직접 검증된 교회를 찾아 소개한다.
// 자동 매칭 없음: 앱은 접수만 하고, 소개는 사람이 확인 후 직접 한다.
// 게스트도 제출 가능(전도 현장에서 전도자 폰으로 접수하는 경우).
export default function ConnectPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { show, view: toastView } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [region, setRegion] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !region.trim()) { show(t("conn.required")); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("church_connect_requests").insert({
        user_id: user?.id ?? null,
        name: name.trim().slice(0, 60),
        contact: contact.trim().slice(0, 120),
        region: region.trim().slice(0, 120),
        note: note.trim().slice(0, 500) || null,
        lang,
      });
      if (error) throw error;
      setDone(true);
    } catch {
      show(t("conn.fail"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main style={{ maxWidth: 460, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center", minHeight: "100dvh" }}>
        <p style={{ fontSize: 44, margin: "0 0 14px" }}>⛪</p>
        <h1 className="serif" style={{ fontSize: 22, fontWeight: 800, color: theme.gold, margin: "0 0 10px" }}>{t("conn.doneTitle")}</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: theme.textMuted, margin: "0 0 28px" }}>{t("conn.doneBody")}</p>
        <button onClick={() => router.push("/")} style={{ padding: "12px 26px", borderRadius: 12, border: "none", background: theme.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{t("r.home")}</button>
        {toastView}
      </main>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "13px 14px", fontSize: 15,
    border: `1px solid ${theme.border}`, borderRadius: 12, outline: "none",
    background: theme.card, color: theme.text,
  };

  return (
    <main style={{ maxWidth: 460, margin: "0 auto", padding: "1.2rem 1.25rem 3rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => (history.length > 1 ? history.back() : router.push("/"))} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>←</button>
        <h1 style={{ fontFamily: serif, fontSize: 20, fontWeight: 800, color: theme.gold, margin: 0 }}>⛪ {t("conn.title")}</h1>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.textMuted, margin: "0 0 20px" }}>{t("conn.intro")}</p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t("conn.name")} maxLength={60} style={inputStyle} />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder={t("conn.contact")} maxLength={120} style={inputStyle} />
        <input value={region} onChange={e => setRegion(e.target.value)} placeholder={t("conn.region")} maxLength={120} style={inputStyle} />
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t("conn.note")} maxLength={500} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />

        <p style={{ fontSize: 12, color: theme.textFaint, lineHeight: 1.6, margin: "2px 0 0" }}>
          🔒 {t("conn.privacy")} <a href="/privacy" style={{ color: theme.textMuted }}>{t("privacy.title")}</a>
        </p>

        <button type="submit" disabled={busy}
          style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: theme.gold, color: "#fff", border: "none", borderRadius: 13, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, marginTop: 4 }}>
          {busy ? t("conn.sending") : t("conn.submit")}
        </button>
      </form>
      {toastView}
    </main>
  );
}
