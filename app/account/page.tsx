"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { PageHeader, AccentCard, ACCENT, softCard, softShadow } from "@/lib/ui";

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
    <main className="fade-in" style={{ maxWidth: 440, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <PageHeader title={t("acct.title")} onHome={() => router.push("/")} homeLabel={t("common.home")} />

      {/* 프로필 카드 — 홈 히어로 톤(컬러 아이콘 칩) */}
      <div className="fade-in" style={{ ...softCard({ padding: "16px 17px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14, background: ACCENT.green.bg, border: `1px solid ${theme.goldBorder}` }) }}>
        <span style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#e9ffce 0%,#d4eeff 100%)", display: "grid", placeItems: "center", fontSize: 26 }}>🙂</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: theme.text }}>{nickname}</span>
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, wordBreak: "break-all" }}>{user.email ?? ""}</span>
        </span>
      </div>

      {/* 설정/링크 섹션 */}
      <AccentCard
        icon="🔒"
        title={t("privacy.title")}
        onClick={() => router.push("/privacy")}
        accent={ACCENT.blue}
      />

      <AccentCard
        icon="🚪"
        title={t("acct.logout")}
        onClick={signOut}
        accent={ACCENT.amber}
        right={<span aria-hidden style={{ fontSize: 18, color: ACCENT.amber.fg, opacity: 0.85 }}>›</span>}
      />

      {/* 위험 구역 — 계정 삭제 (애플 심사 필수) */}
      <div className="fade-in-2" style={{ marginTop: 22, padding: "16px 17px", borderRadius: 16, border: `1px solid ${ACCENT.red.border}`, background: ACCENT.red.bg, boxShadow: softShadow }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: ACCENT.red.chip, display: "grid", placeItems: "center", fontSize: 20 }}>⚠️</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: ACCENT.red.fg, margin: 0 }}>{t("acct.delete")}</p>
        </div>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.6 }}>{t("acct.deleteDesc")}</p>
        <button onClick={handleDelete} disabled={deleting} style={{ width: "100%", padding: 13, fontSize: 14.5, fontWeight: 800, color: "#fff", background: theme.wrong, border: "none", borderRadius: 12, cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.7 : 1 }}>{deleting ? t("acct.deleting") : t("acct.delete")}</button>
      </div>
    </main>
  );
}
