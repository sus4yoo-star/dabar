"use client";

// 🆘 긴급 SOS — 해외에선 카톡 중심. 상황·위치를 카톡으로 전송하고, 상황을 태국어로 번역해
// 현지인에게 보여주며, 긴급기관에 바로 전화. (동행 연락처/문자 제거)
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const LS_KEY = "dabar_sos_v3";
const RED = "#e23b3b";

const HOTLINES: { key: string; num: string; emoji: string }[] = [
  { key: "sos.touristPolice", num: "1155", emoji: "👮" },
  { key: "sos.police", num: "191", emoji: "🚓" },
  { key: "sos.medical", num: "1669", emoji: "🚑" },
  { key: "sos.fire", num: "199", emoji: "🚒" },
  { key: "sos.embassy", num: "+66819145803", emoji: "🇰🇷" },
  { key: "sos.consul", num: "+82233210404", emoji: "☎️" },
];

type SosData = { name: string; place: string };

export default function SosButton({ compact = false }: { compact?: boolean } = {}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SosData>({ name: "", place: "" });
  const [gps, setGps] = useState("");
  const [locState, setLocState] = useState<"off" | "wait" | "on">("off");
  const [situation, setSituation] = useState("");   // 현재 상황 (선택, 매번 새로)
  const [situThai, setSituThai] = useState("");       // 상황 태국어 번역
  const [showLocal, setShowLocal] = useState(false);  // 현지인 전체화면
  const [copied, setCopied] = useState("");
  const trTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { const d = JSON.parse(raw); setData({ name: d.name ?? "", place: d.place ?? "" }); } } catch { /* */ }
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

  // 상황 → 태국어 번역 (디바운스). 현지인에게 보여줄 용도.
  useEffect(() => {
    const q = situation.trim();
    if (!q) { setSituThai(""); return; }
    if (trTimer.current) clearTimeout(trTimer.current);
    trTimer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, target: "th" }) });
        const d = await r.json();
        if (d?.text) setSituThai(d.text);
      } catch { /* */ }
    }, 600);
    return () => { if (trTimer.current) clearTimeout(trTimer.current); };
  }, [situation]);

  const locText = [data.place.trim(), gps].filter(Boolean).join(" ");

  function buildBody() {
    const who = data.name.trim() ? `[${data.name.trim()}] ` : "";
    const situ = situation.trim() ? ` (${situation.trim()})` : "";
    const loc = locText ? ` ${t("sos.loc")} ${locText}` : "";
    return `${who}${t("sos.smsBody")}${situ}${loc}`;
  }
  async function shareKakao() {
    const body = buildBody();
    try {
      if (navigator.share) await navigator.share({ title: "🆘 SOS", text: body });
      else { await navigator.clipboard.writeText(body); setCopied(t("sos.copied")); }
    } catch { /* canceled */ }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ width: "100%", marginTop: compact ? 9 : 12, padding: compact ? "13px" : "15px", fontSize: compact ? 15.5 : 17, fontWeight: 900, letterSpacing: 1, color: "#fff", background: RED, border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 6px 18px rgba(226,59,59,0.4)" }}>
        {t("sos.button")}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,8,8,0.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "12px 15px calc(28px + env(safe-area-inset-bottom))", maxHeight: "96dvh", overflowY: "auto", maxWidth: 480, width: "100%", margin: "0 auto", boxShadow: "0 -12px 36px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: RED }}>{t("sos.title")}</span>
              <button onClick={() => setOpen(false)} style={{ fontSize: 13, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "5px 13px", cursor: "pointer" }}>{t("sos.close")} ✕</button>
            </div>

            {/* 내 이름 */}
            <label style={lbl}>{t("sos.senderName")}</label>
            <input value={data.name} onChange={(e) => save({ ...data, name: e.target.value })} placeholder={t("sos.senderPh")} style={{ ...inp, marginBottom: 11 }} />

            {/* 현재 상황 (선택) — 라벨 옆 빨간 안내 */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={lbl}>{t("sos.situation")}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: theme.wrong }}>{t("sos.situationHint")}</span>
            </div>
            <input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("sos.situationPh")} style={{ ...inp, marginBottom: situation.trim() ? 8 : 11 }} />
            {/* 상황 태국어 — 현지인에게 보여주기 */}
            {situation.trim() && (
              <div style={{ marginBottom: 11, padding: "10px 12px", borderRadius: 10, background: theme.goldLight, border: `1px solid ${theme.goldBorder}` }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, color: theme.gold }}>{t("sos.situThai")}</p>
                <p style={{ margin: "3px 0 0", fontSize: 15.5, fontWeight: 700, color: theme.text, lineHeight: 1.45 }}>{situThai || "…"}</p>
              </div>
            )}

            {/* 내 위치 (선택) — 긴급전화 위 */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={lbl}>{t("sos.locTitle")}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: locState === "on" ? theme.correct : theme.primarySoft }}>{t("sos.locNote")}</span>
            </div>
            <input value={data.place} onChange={(e) => save({ ...data, place: e.target.value })} placeholder={t("sos.manualLocPh")} style={{ ...inp, marginBottom: 12 }} />

            {/* 카카오톡으로 상황·위치 전송 (해외 기본) */}
            <button onClick={shareKakao}
              style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 900, color: "#3a1d1d", background: "#FEE500", border: "none", borderRadius: 13, cursor: "pointer", marginBottom: 8 }}>
              {t("sos.kakao")}
            </button>
            {/* 현지인에게 크게 보여주기 */}
            <button onClick={() => setShowLocal(true)}
              style={{ width: "100%", padding: "12px", fontSize: 14.5, fontWeight: 800, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 13, cursor: "pointer", marginBottom: copied ? 6 : 14 }}>
              {t("sos.showLocal")}
            </button>
            {copied && <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: theme.correct, textAlign: "center" }}>{copied}</p>}

            {/* 긴급 전화 */}
            <p style={{ margin: "0 0 6px 2px", fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>{t("sos.callTitle")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {HOTLINES.map((h) => (
                <a key={h.key} href={`tel:${h.num}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "8px 10px", borderRadius: 10, border: `1px solid ${theme.cardBorder}`, background: theme.card, textDecoration: "none", color: theme.text }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.emoji} {t(h.key)}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: RED, flexShrink: 0 }}>📞</span>
                </a>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 10.5, color: theme.textFaint, letterSpacing: 1, margin: "22px 0 0" }}>DABAR by AMOV · Love Creates Value</p>
          </div>
        </div>,
        document.body
      )}

      {/* 현지(태국)인에게 보여주는 SOS 화면 — 태국어 크게 + 상황 + 긴급전화 */}
      {showLocal && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 95, background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowLocal(false)} style={{ fontSize: 14, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "7px 16px", cursor: "pointer" }}>{t("sos.close")} ✕</button>
          </div>
          <div style={{ flex: 1, maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, paddingTop: 8 }}>
            <p style={{ margin: 0, fontSize: 50, fontWeight: 900, color: RED, textAlign: "center", lineHeight: 1.1 }}>🆘 ช่วยด้วย!</p>
            <p style={{ margin: "0 0 2px", fontSize: 21, fontWeight: 800, color: theme.text, textAlign: "center", lineHeight: 1.4 }}>ฉันมีเหตุฉุกเฉิน ต้องการความช่วยเหลือด่วน</p>
            {situThai && (
              <div style={{ padding: "12px 14px", borderRadius: 14, background: "#fff5f5", border: `2px solid ${RED}` }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: theme.text, textAlign: "center", lineHeight: 1.45 }}>{situThai}</p>
              </div>
            )}
            <p style={{ margin: "2px 0 8px", fontSize: 16, color: theme.textMuted, textAlign: "center", lineHeight: 1.5 }}>ฉันพูดภาษาไทยไม่ได้ 🙏 กรุณาช่วยโทรแจ้ง:</p>
            {[
              { th: "🚑 รถพยาบาล / ฉุกเฉิน", num: "1669" },
              { th: "🚓 ตำรวจ", num: "191" },
              { th: "👮 ตำรวจท่องเที่ยว", num: "1155" },
            ].map((x) => (
              <a key={x.num} href={`tel:${x.num}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "16px 18px", borderRadius: 16, border: `2px solid ${RED}`, background: "#fff5f5", textDecoration: "none", color: theme.text }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{x.th}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: RED }}>📞 {x.num}</span>
              </a>
            ))}
            {data.name.trim() && <p style={{ margin: "8px 0 0", fontSize: 15, color: theme.textMuted, textAlign: "center" }}>ชื่อ: {data.name.trim()}</p>}
            <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: theme.text, textAlign: "center" }}>ขอบคุณมากค่ะ/ครับ 🙏</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "9px 11px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 800, color: theme.textMuted, marginBottom: 4 };
