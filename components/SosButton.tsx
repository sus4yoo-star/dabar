"use client";

// 🆘 긴급 SOS — 동행에게 동시 문자(위치 포함) + 태국/한국 긴급기관 바로 전화. 선교 현장 안전.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const LS_KEY = "dabar_sos_contacts";
const RED = "#e23b3b";

// 긴급 연락처(태국 + 한국 영사). tel: 바로 전화.
const HOTLINES: { key: string; num: string; emoji: string }[] = [
  { key: "sos.touristPolice", num: "1155", emoji: "👮" },
  { key: "sos.police", num: "191", emoji: "🚓" },
  { key: "sos.medical", num: "1669", emoji: "🚑" },
  { key: "sos.fire", num: "199", emoji: "🚒" },
  { key: "sos.embassy", num: "+66819145803", emoji: "🇰🇷" },
  { key: "sos.consul", num: "+82233210404", emoji: "☎️" },
];

export default function SosButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState("");
  const [loc, setLoc] = useState("");                 // maps url
  const [locState, setLocState] = useState<"off" | "wait" | "on">("off");

  useEffect(() => { try { setContacts(localStorage.getItem(LS_KEY) ?? ""); } catch { /* */ } }, []);
  function saveContacts(v: string) { setContacts(v); try { localStorage.setItem(LS_KEY, v); } catch { /* */ } }

  useEffect(() => {
    if (!open || !navigator.geolocation) return;
    setLocState("wait");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`); setLocState("on"); },
      () => setLocState("off"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [open]);

  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  function sendSms() {
    const nums = contacts.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean).join(",");
    const body = `${t("sos.smsBody")}${loc ? " " + loc : ""}`;
    const sep = isIOS ? "&" : "?";
    window.location.href = `sms:${nums}${sep}body=${encodeURIComponent(body)}`;
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ width: "100%", marginTop: 12, padding: "15px", fontSize: 17, fontWeight: 900, letterSpacing: 1, color: "#fff", background: RED, border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 6px 18px rgba(226,59,59,0.4)" }}>
        {t("sos.button")}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,8,8,0.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "16px 18px calc(20px + env(safe-area-inset-bottom))", maxHeight: "92dvh", overflowY: "auto", maxWidth: 480, width: "100%", margin: "0 auto", boxShadow: "0 -12px 36px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 19, fontWeight: 900, color: RED }}>{t("sos.title")}</span>
              <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}>{t("sos.close")} ✕</button>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: theme.textMuted, lineHeight: 1.5 }}>{t("sos.sub")}</p>

            {/* 동행 긴급 문자 */}
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: theme.textMuted, marginBottom: 5 }}>{t("sos.contactsLabel")}</label>
            <input value={contacts} onChange={(e) => saveContacts(e.target.value)} placeholder={t("sos.contactsPh")} inputMode="tel"
              style={{ width: "100%", boxSizing: "border-box", fontSize: 16, padding: "11px 13px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none", marginBottom: 8 }} />
            <p style={{ margin: "0 0 8px", fontSize: 11, color: locState === "on" ? theme.correct : theme.textFaint }}>
              {locState === "on" ? t("sos.locOn") : locState === "wait" ? t("sos.locWait") : t("sos.locOff")}
            </p>
            <button onClick={sendSms} disabled={!contacts.trim()}
              style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 900, color: "#fff", background: contacts.trim() ? RED : theme.textFaint, border: "none", borderRadius: 13, cursor: contacts.trim() ? "pointer" : "default", marginBottom: 18 }}>
              {t("sos.sendSms")}
            </button>

            {/* 긴급 전화 */}
            <p style={{ margin: "0 0 8px 2px", fontSize: 11.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>{t("sos.callTitle")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {HOTLINES.map((h) => (
                <a key={h.key} href={`tel:${h.num}`}
                  style={{ display: "flex", flexDirection: "column", gap: 2, padding: "11px 12px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, textDecoration: "none", color: theme.text }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{h.emoji} {t(h.key)}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: RED }}>📞 {h.num}</span>
                </a>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
