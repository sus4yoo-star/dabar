"use client";

// 🆘 긴급 SOS — 발신자 본명 + 동행 연락처(최대 10) 미리 저장 → 한 번에 긴급 문자(위치 포함),
// 태국/한국 긴급기관 바로 전화. 위치는 GPS 또는 직접 입력. 선교 현장 안전.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { getSupabase } from "@/lib/besora/supabase";

const LS_KEY = "dabar_sos_v2";
const RED = "#e23b3b";
const MAX = 10;

type Contact = { name: string; phone: string };
type SosData = { name: string; place: string; contacts: Contact[] };

const HOTLINES: { key: string; num: string; emoji: string }[] = [
  { key: "sos.touristPolice", num: "1155", emoji: "👮" },
  { key: "sos.police", num: "191", emoji: "🚓" },
  { key: "sos.medical", num: "1669", emoji: "🚑" },
  { key: "sos.fire", num: "199", emoji: "🚒" },
  { key: "sos.embassy", num: "+66819145803", emoji: "🇰🇷" },
  { key: "sos.consul", num: "+82233210404", emoji: "☎️" },
];

const isIOS = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function SosButton({ compact = false }: { compact?: boolean } = {}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SosData>({ name: "", place: "", contacts: [] });
  const [gps, setGps] = useState("");
  const [locState, setLocState] = useState<"off" | "wait" | "on">("off");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [situation, setSituation] = useState(""); // 현재 상황 (선택, 매번 새로)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { const d = JSON.parse(raw); setData({ name: d.name ?? "", place: d.place ?? "", contacts: Array.isArray(d.contacts) ? d.contacts.slice(0, MAX) : [] }); }
    } catch { /* */ }
  }, []);
  function save(next: SosData) { setData(next); try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* */ } }

  useEffect(() => {
    if (!open || !navigator.geolocation) return;
    setLocState("wait");
    navigator.geolocation.getCurrentPosition(
      (p) => { setGps(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`); setLocState("on"); },
      () => setLocState("off"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [open]);

  // 직접 입력한 위치 + GPS 링크를 함께 (둘 다 메시지에 포함)
  const locText = [data.place.trim(), gps].filter(Boolean).join(" ");
  const phones = data.contacts.map((c) => c.phone.trim()).filter(Boolean);

  function buildBody() {
    const who = data.name.trim() ? `[${data.name.trim()}] ` : "";
    const situ = situation.trim() ? ` (${situation.trim()})` : "";
    const loc = locText ? ` ${t("sos.loc")} ${locText}` : "";
    return `${who}${t("sos.smsBody")}${situ}${loc}`;
  }
  function openSmsApp(body: string) {
    const sep = isIOS() ? "&" : "?";
    window.location.href = `sms:${phones.join(",")}${sep}body=${encodeURIComponent(body)}`;
  }
  async function sendSms() {
    if (!phones.length || sending) return;
    const body = buildBody();
    setSentMsg(""); setSending(true);
    // 1) Twilio 자동 발송 시도 (로그인 토큰 있을 때)
    try {
      const token = (await getSupabase().auth.getSession()).data.session?.access_token;
      if (token) {
        const r = await fetch("/api/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ phones, body }),
        });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.sent > 0) { setSentMsg(t("sos.sent", { n: d.sent })); setSending(false); return; }
      }
    } catch { /* fall back */ }
    // 2) 폴백: 문자앱 열기 (수신자·내용 채워짐)
    setSending(false);
    openSmsApp(body);
  }

  async function shareKakao() {
    const body = buildBody();
    try {
      if (navigator.share) await navigator.share({ title: "🆘 SOS", text: body });
      else { await navigator.clipboard.writeText(body); setSentMsg(t("sos.copied")); }
    } catch { /* canceled */ }
  }

  function setContact(i: number, patch: Partial<Contact>) {
    save({ ...data, contacts: data.contacts.map((c, idx) => idx === i ? { ...c, ...patch } : c) });
  }
  function addContact() { if (data.contacts.length < MAX) save({ ...data, contacts: [...data.contacts, { name: "", phone: "" }] }); }
  function removeContact(i: number) { save({ ...data, contacts: data.contacts.filter((_, idx) => idx !== i) }); }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ width: "100%", marginTop: compact ? 9 : 12, padding: compact ? "13px" : "15px", fontSize: compact ? 15.5 : 17, fontWeight: 900, letterSpacing: 1, color: "#fff", background: RED, border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 6px 18px rgba(226,59,59,0.4)" }}>
        {t("sos.button")}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,8,8,0.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "16px 18px calc(20px + env(safe-area-inset-bottom))", maxHeight: "94dvh", overflowY: "auto", maxWidth: 480, width: "100%", margin: "0 auto", boxShadow: "0 -12px 36px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 19, fontWeight: 900, color: RED }}>{t("sos.title")}</span>
              <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}>{t("sos.close")} ✕</button>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: theme.textMuted, lineHeight: 1.5 }}>{t("sos.sub")}</p>

            {/* 발신자 본명 */}
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: theme.textMuted, marginBottom: 5 }}>{t("sos.senderName")}</label>
            <input value={data.name} onChange={(e) => save({ ...data, name: e.target.value })} placeholder={t("sos.senderPh")}
              style={{ ...inp, marginBottom: 14 }} />

            {/* 동행 연락처 (최대 10) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: theme.textMuted }}>{t("sos.contactsTitle")} <span style={{ color: theme.textFaint, fontWeight: 500 }}>· {t("sos.savedHint")}</span></span>
              <button onClick={addContact} disabled={data.contacts.length >= MAX} style={{ fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "5px 11px", cursor: data.contacts.length >= MAX ? "default" : "pointer", opacity: data.contacts.length >= MAX ? 0.5 : 1 }}>{t("sos.addContact")}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10, maxHeight: 168, overflowY: "auto" }}>
              {data.contacts.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={c.name} onChange={(e) => setContact(i, { name: e.target.value })} placeholder={t("sos.namePh")} style={{ ...inp, width: 92, flexShrink: 0, marginBottom: 0 }} />
                  <input value={c.phone} onChange={(e) => setContact(i, { phone: e.target.value })} placeholder={t("sos.phonePh")} inputMode="tel" style={{ ...inp, flex: 1, minWidth: 0, marginBottom: 0 }} />
                  <button onClick={() => removeContact(i)} aria-label="remove" style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.textMuted, fontSize: 15, cursor: "pointer" }}>✕</button>
                </div>
              ))}
            </div>

            {/* 현재 상황 (선택) */}
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: theme.textMuted, marginBottom: 5 }}>{t("sos.situation")}</label>
            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("sos.situationPh")} rows={2}
              style={{ ...inp, resize: "none", lineHeight: 1.5, marginBottom: 4 }} />
            <p style={{ margin: "0 0 14px", fontSize: 11, color: theme.wrong, fontWeight: 700 }}>{t("sos.situationHint")}</p>

            {/* 위치 — GPS 또는 직접 입력 */}
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: theme.textMuted, marginBottom: 5 }}>{t("sos.locTitle")}</label>
            <input value={data.place} onChange={(e) => save({ ...data, place: e.target.value })} placeholder={t("sos.manualLocPh")} style={{ ...inp, marginBottom: 8 }} />
            {/* 위치 강조 */}
            <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 12, background: locState === "on" ? "rgba(23,160,94,0.10)" : theme.primaryBg, border: `1px solid ${locState === "on" ? theme.correct : theme.cardBorder}` }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: locState === "on" ? theme.correct : theme.primarySoft }}>{t("sos.locNote")}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: theme.textMuted }}>{locState === "on" ? t("sos.locOn") : locState === "wait" ? t("sos.locWait") : t("sos.locOff")}</p>
            </div>

            <button onClick={sendSms} disabled={!phones.length || sending}
              style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 900, color: "#fff", background: phones.length ? RED : theme.textFaint, border: "none", borderRadius: 13, cursor: phones.length && !sending ? "pointer" : "default", marginBottom: 8 }}>
              {sending ? t("sos.sending") : t("sos.sendSms")}
            </button>
            {/* 카카오톡 단톡방 전송 */}
            <button onClick={shareKakao}
              style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 800, color: "#3a1d1d", background: "#FEE500", border: "none", borderRadius: 13, cursor: "pointer", marginBottom: sentMsg ? 6 : 18 }}>
              {t("sos.kakao")}
            </button>
            {sentMsg && <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: theme.correct, textAlign: "center" }}>{sentMsg}</p>}

            {/* 긴급 전화 */}
            <p style={{ margin: "0 0 8px 2px", fontSize: 11.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>{t("sos.callTitle")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {HOTLINES.map((h) => (
                <a key={h.key} href={`tel:${h.num}`}
                  style={{ display: "flex", flexDirection: "column", gap: 2, padding: "11px 12px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, textDecoration: "none", color: theme.text }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{h.emoji} {t(h.key)}</span>
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

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 16, padding: "10px 12px", borderRadius: 11, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" };
