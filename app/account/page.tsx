"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading, nickname, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);

  async function handleDelete() {
    if (!confirm(t("acct.deleteConfirm"))) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_me");
      if (error) throw error;
      await signOut();
      alert(t("acct.deleted"));
      router.replace("/");
    } catch {
      setDeleting(false);
      alert(t("acct.deleteFail"));
    }
  }

  if (loading || !user) return <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: theme.textMuted }}>…</main>;

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer" }}>{t("common.home")}</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: theme.text, margin: 0 }}>{t("acct.title")}</h1>
        <span style={{ width: 52 }} />
      </div>

      {/* 프로필 */}
      <div style={{ padding: "16px", borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, marginBottom: 14 }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: theme.text, margin: "0 0 4px" }}>{nickname}</p>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0, wordBreak: "break-all" }}>{user.email ?? ""}</p>
      </div>

      {/* 링크 */}
      <a href="/privacy" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", padding: "14px 16px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 14.5, fontWeight: 600, marginBottom: 10 }}>
        {t("privacy.title")} <span style={{ color: theme.textMuted }}>›</span>
      </a>

      <button onClick={signOut} style={{ width: "100%", padding: 13, fontSize: 14.5, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer", marginBottom: 24 }}>{t("acct.logout")}</button>

      {/* 위험 구역 — 계정 삭제 (애플 심사 필수) */}
      <div style={{ padding: "16px", borderRadius: 14, border: `1px solid ${theme.wrong}`, background: theme.wrongBg }}>
        <p style={{ fontSize: 14.5, fontWeight: 800, color: theme.wrong, margin: "0 0 6px" }}>{t("acct.delete")}</p>
        <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.6 }}>{t("acct.deleteDesc")}</p>
        <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: 12, fontSize: 14, fontWeight: 800, color: "#fff", background: theme.wrong, border: "none", borderRadius: 10, cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.7 : 1 }}>{deleting ? t("acct.deleting") : t("acct.delete")}</button>
      </div>
    </main>
  );
}
