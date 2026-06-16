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
  const [placeThai, setPlaceThai] = useState("");     // 위치(직접입력) 태국어 번역
  const [copied, setCopied] = useState("");
  const trTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 위치(직접 입력) → 태국어 번역 (디바운스)
  useEffect(() => {
    const q = data.place.trim();
    if (!q) { setPlaceThai(""); return; }
    if (trTimer2.current) clearTimeout(trTimer2.current);
    trTimer2.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, target: "th" }) });
        const d = await r.json();
        if (d?.text) setPlaceThai(d.text);
      } catch { /* */ }
    }, 600);
    return () => { if (trTimer2.current) clearTimeout(trTimer2.current); };
  }, [data.place]);

  const locText = [data.place.trim(), gps].filter(Boolean).join(" ");
  const locThai = [placeThai, gps].filter(Boolean).join(" ");

  // 현지인에게 보여줄 태국어 카드 (이름·상황·위치, 실시간)
  function thaiCard() {
    const lines = ["🆘 ฉุกเฉิน! ช่วยด้วย — ต้องการความช่วยเหลือด่วน"];
    if (data.name.trim()) lines.push(`ชื่อ: ${data.name.trim()}`);
    if (situThai) lines.push(`สถานการณ์: ${situThai}`);
    if (locThai) lines.push(`สถานที่: ${locThai}`);
    lines.push("ฉันพูดภาษาไทยไม่ได้ 🙏 กรุณาช่วยโทร 191 (ตำรวจ) / 1669 (ฉุกเฉิน)");
    return lines.join("\n");
  }

  function buildBody() {
    const who = data.name.trim() ? `[${data.name.trim()}] ` : "";
    const situ = situation.trim() ? ` (${situation.trim()})` : "";
    const loc = locText ? ` ${t("sos.loc")} ${locText}` : "";
    const ko = `${who}${t("sos.smsBody")}${situ}${loc}`;
    // 받는 사람이 현지인에게 보여줄 수 있도록 태국어 카드도 함께
    return `${ko}\n\n— ${t("sos.situThai")} —\n${thaiCard()}`;
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
            <input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("sos.situationPh")} style={{ ...inp, marginBottom: 11 }} />

            {/* 내 위치 (선택) — 긴급전화 위 */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={lbl}>{t("sos.locTitle")}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: locState === "on" ? theme.correct : theme.primarySoft }}>{t("sos.locNote")}</span>
            </div>
            <input value={data.place} onChange={(e) => save({ ...data, place: e.target.value })} placeholder={t("sos.manualLocPh")} style={{ ...inp, marginBottom: 12 }} />

            {/* 🇹🇭 현지인에게 보여줄 태국어 카드 (이름·상황·위치, 실시간) */}
            <div style={{ marginBottom: 12, padding: "11px 13px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}` }}>
              <p style={{ margin: "0 0 4px", fontSize: 10.5, fontWeight: 800, color: theme.gold }}>{t("sos.situThai")}</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{thaiCard()}</p>
            </div>

            {/* 카카오톡으로 상황·위치 전송 (해외 기본) */}
            <button onClick={shareKakao}
              style={{ width: "100%", padding: "15px", fontSize: 16, fontWeight: 900, color: "#3a1d1d", background: "#FEE500", border: "none", borderRadius: 13, cursor: "pointer", marginBottom: 8 }}>
              {t("sos.kakao")}
            </button>
            {copied && <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 700, color: theme.correct, textAlign: "center" }}>{copied}</p>}

            {/* 긴급 전화 */}
            <p style={{ margin: "14px 0 6px 2px", fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>{t("sos.callTitle")}</p>
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
    </>
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 14, padding: "9px 11px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 800, color: theme.textMuted, marginBottom: 4 };
