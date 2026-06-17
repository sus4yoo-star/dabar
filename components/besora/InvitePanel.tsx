"use client";

import { useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { createInvite } from "@/lib/besora/companions";

// 동행 초대 — 코드 생성 후 링크/QR/공유 제공
export default function InvitePanel() {
  const { myLang } = useLang();
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [qrFailed, setQrFailed] = useState(false);

  async function make() {
    setBusy(true); setErr("");
    try {
      const code = await createInvite();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setLink(`${origin}/share/join?code=${code}`);
    } catch {
      setErr(ui(myLang, "loginToConnect"));
    }
    setBusy(false);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }
  async function share() {
    if (navigator.share) { try { await navigator.share({ url: link, title: ui(myLang, "inviteCreate") }); } catch { /* ignore */ } }
    else copy();
  }

  const qr = link ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(link)}` : "";

  if (!link) {
    return (
      <div>
        <button onClick={make} disabled={busy}
          style={{ width: "100%", borderRadius: 14, background: theme.gold, color: "#08263a", border: "none", padding: "14px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
          ＋ {ui(myLang, "inviteCreate")}
        </button>
        {err && <p style={{ marginTop: 8, fontSize: 12.5, color: theme.wrong }}>{err}</p>}
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 16, textAlign: "center" }}>
      <p style={{ margin: "0 0 12px", fontSize: 13.5, color: theme.textMuted, lineHeight: 1.55 }}>{ui(myLang, "inviteReady")}</p>
      {/* QR 은 외부 서비스 — 오프라인/실패해도 아래 링크 텍스트로 공유 가능 */}
      {!qrFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={ui(myLang, "inviteCreate")} width={180} height={180} onError={() => setQrFailed(true)} style={{ borderRadius: 12, background: "#fff", padding: 6 }} />
      )}
      {/* 링크는 항상 선택·복사 가능한 텍스트로도 노출 */}
      <p style={{ margin: "10px auto 0", maxWidth: "100%", fontSize: 12.5, color: theme.primarySoft, wordBreak: "break-all", userSelect: "all", lineHeight: 1.5 }}>{link}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={copy}
          style={{ flex: 1, borderRadius: 12, background: theme.primaryBg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}`, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {copied ? ui(myLang, "inviteCopied") : ui(myLang, "inviteCopy")}
        </button>
        <button onClick={share}
          style={{ flex: 1, borderRadius: 12, background: theme.gold, color: "#08263a", border: "none", padding: "11px 0", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
          {ui(myLang, "inviteShare")}
        </button>
      </div>
    </div>
  );
}
