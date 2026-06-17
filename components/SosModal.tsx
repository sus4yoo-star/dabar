"use client";

// 🆘 긴급 SOS 모달 본체 — SosButton 이 열릴 때만 동적 import 되어 로드된다(초기 번들 분리).
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { getCountry, hotlinesFor, detectCountryCode, COUNTRIES, type HotKind } from "@/lib/sosCountries";
import { emergencyHeader, helpCallLine, COMMON_SITU } from "@/lib/sosPhrases";

const LS_KEY = "dabar_sos_v3";       // 이름·위치 (기존 사용자 보존)
const LS_COUNTRY = "dabar_sos_country";
const TRC_KEY = "dabar_sos_trc";     // 번역 캐시 (오프라인 폴백)
const RED = "#e23b3b";

const LBL_KEY: Record<HotKind, string> = {
  tourist: "sos.lblTourist", police: "sos.lblPolice", medical: "sos.lblMedical",
  fire: "sos.lblFire", unified: "sos.lblUnified", embassy: "sos.lblEmbassy", consular: "sos.lblConsular",
};

type SosData = { name: string; place: string };

// ── 번역 캐시 (localStorage) ──────────────────────────────
function trcGet(lang: string, q: string): string {
  try { const m = JSON.parse(localStorage.getItem(TRC_KEY) || "{}"); return m[`${lang}|${q}`] || ""; } catch { return ""; }
}
function trcPut(lang: string, q: string, v: string) {
  try {
    const m = JSON.parse(localStorage.getItem(TRC_KEY) || "{}");
    m[`${lang}|${q}`] = v;
    const keys = Object.keys(m);
    if (keys.length > 300) delete m[keys[0]]; // 오래된 항목부터 제거(무한 증가 방지)
    localStorage.setItem(TRC_KEY, JSON.stringify(m));
  } catch { /* */ }
}

export default function SosModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<SosData>({ name: "", place: "" });
  const [country, setCountry] = useState("TH");
  const [gps, setGps] = useState("");
  const [locState, setLocState] = useState<"off" | "wait" | "on">("off");
  const [situation, setSituation] = useState("");
  const [situLocal, setSituLocal] = useState("");
  const [placeLocal, setPlaceLocal] = useState("");
  const [copied, setCopied] = useState("");
  const [online, setOnline] = useState(true);
  const trTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ctry = getCountry(country);
  const localLang = ctry.lang;
  const hotlines = hotlinesFor(country);
  const policeNum = ctry.lines.find((l) => l.kind === "police" || l.kind === "unified")?.num || "";
  const medicalNum = ctry.lines.find((l) => l.kind === "medical")?.num || "";

  // 저장된 이름·위치 + 국가(없으면 타임존 자동감지)
  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { const d = JSON.parse(raw); setData({ name: d.name ?? "", place: d.place ?? "" }); } } catch { /* */ }
    try { const c = localStorage.getItem(LS_COUNTRY); setCountry(c && COUNTRIES.some((x) => x.code === c) ? c : detectCountryCode()); } catch { setCountry(detectCountryCode()); }
  }, []);
  // Esc 로 닫기 — 키보드/접근성
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save(next: SosData) { setData(next); try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* */ } }
  function pickCountry(c: string) { setCountry(c); try { localStorage.setItem(LS_COUNTRY, c); } catch { /* */ } }

  // 온라인 상태 추적
  useEffect(() => {
    const upd = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    upd();
    window.addEventListener("online", upd); window.addEventListener("offline", upd);
    return () => { window.removeEventListener("online", upd); window.removeEventListener("offline", upd); };
  }, []);

  // 위치 (모달이 열리며 마운트될 때 1회)
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocState("wait");
    navigator.geolocation.getCurrentPosition(
      (p) => { setGps(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`); setLocState("on"); },
      () => setLocState("off"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // 상황 → 현지어 (내장표현/캐시 즉시 + 온라인 보정)
  useEffect(() => {
    const q = situation.trim();
    if (!q) { setSituLocal(""); return; }
    if (localLang === "ko") { setSituLocal(q); return; }
    const common = COMMON_SITU.find((c) => c.ko === q);
    const built = common?.tr[localLang];
    const cached = built || trcGet(localLang, q);
    // 번역 전/실패여도 현지인이 "무언가"는 보게: 내장번역 → 캐시 → 영어 → (최후)원문
    setSituLocal(cached || common?.en || q);
    if (trTimer.current) clearTimeout(trTimer.current);
    trTimer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, target: localLang }) });
        const d = await r.json();
        if (d?.text) { setSituLocal(d.text); trcPut(localLang, q, d.text); }
      } catch { /* 위에서 이미 폴백 표시함 */ }
    }, 500);
    return () => { if (trTimer.current) clearTimeout(trTimer.current); };
  }, [situation, localLang]);

  // 위치(직접입력) → 현지어
  useEffect(() => {
    const q = data.place.trim();
    if (!q) { setPlaceLocal(""); return; }
    if (localLang === "ko") { setPlaceLocal(q); return; }
    const cached = trcGet(localLang, q);
    setPlaceLocal(cached || q); // 실패해도 최소 원문은 보이게
    if (trTimer2.current) clearTimeout(trTimer2.current);
    trTimer2.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, target: localLang }) });
        const d = await r.json();
        if (d?.text) { setPlaceLocal(d.text); trcPut(localLang, q, d.text); }
      } catch { /* 위에서 이미 폴백 표시함 */ }
    }, 500);
    return () => { if (trTimer2.current) clearTimeout(trTimer2.current); };
  }, [data.place, localLang]);

  const locText = [data.place.trim(), gps].filter(Boolean).join(" ");
  const locLocal = [placeLocal, gps].filter(Boolean).join(" ");

  // 현지인에게 보여줄 카드 (이름·상황·위치 — 언어무관 이모지 라벨)
  function localCard() {
    const lines = [emergencyHeader(localLang)];
    if (data.name.trim()) lines.push(`🧑 ${data.name.trim()}`);
    if (situLocal) lines.push(`❗ ${situLocal}`);
    if (locLocal) lines.push(`📍 ${locLocal}`);
    lines.push(helpCallLine(localLang, [policeNum, medicalNum]));
    return lines.join("\n");
  }

  function buildBody() {
    const who = data.name.trim() ? `[${data.name.trim()}] ` : "";
    const situ = situation.trim() ? ` (${situation.trim()})` : "";
    const loc = locText ? ` ${t("sos.loc")} ${locText}` : "";
    const ko = `${who}${t("sos.smsBody")}${situ}${loc}`;
    return `${ko}\n\n— ${t("sos.localCard")} —\n${localCard()}`;
  }
  async function shareKakao() {
    const body = buildBody();
    try {
      if (navigator.share) await navigator.share({ title: "🆘 SOS", text: body });
      else { await navigator.clipboard.writeText(body); setCopied(t("sos.copied")); }
    } catch { /* canceled */ }
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,8,8,0.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: theme.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "10px 14px calc(16px + env(safe-area-inset-bottom))", maxHeight: "96dvh", overflowY: "auto", maxWidth: 480, width: "100%", margin: "0 auto", boxShadow: "0 -12px 36px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: RED }}>{t("sos.title")}</span>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" }}>{t("sos.close")} ✕</button>
        </div>

        {!online && (
          <div style={{ marginBottom: 8, padding: "7px 10px", borderRadius: 10, background: "#fff5e6", border: "1px solid #ffd58a", fontSize: 12, fontWeight: 700, color: "#8a5a00" }}>{t("sos.offline")}</div>
        )}

        {/* 국가·지역 선택 (긴급번호가 이 나라 기준으로 바뀜) */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={lbl}>{t("sos.country")}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: theme.primarySoft }}>{t("sos.countryNote")}</span>
        </div>
        <select value={country} onChange={(e) => pickCountry(e.target.value)} style={{ ...inp, marginBottom: 8, fontWeight: 700, appearance: "auto" }}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{t(c.nameKey)}</option>)}
        </select>

        {/* 내 이름 */}
        <label style={lbl}>{t("sos.senderName")}</label>
        <input value={data.name} onChange={(e) => save({ ...data, name: e.target.value })} placeholder={t("sos.senderPh")} style={{ ...inp, marginBottom: 8 }} />

        {/* 현재 상황 (선택) */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={lbl}>{t("sos.situation")}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.wrong }}>{t("sos.situationHint")}</span>
        </div>
        <input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("sos.situationPh")} style={{ ...inp, marginBottom: 6 }} />
        {/* 자주 쓰는 상황 칩 — 가로 스크롤 한 줄(세로 공간 절약) */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
          {COMMON_SITU.map((c) => (
            <button key={c.ko} onClick={() => setSituation(c.ko)}
              style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, padding: "7px 11px", borderRadius: 999, border: `1px solid ${theme.cardBorder}`, background: situation === c.ko ? theme.goldLight : theme.card, color: theme.text, cursor: "pointer", whiteSpace: "nowrap" }}>
              {c.ko}
            </button>
          ))}
        </div>

        {/* 내 위치 (선택) */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={lbl}>{t("sos.locTitle")}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: locState === "on" ? theme.correct : theme.primarySoft }}>{t("sos.locNote")}</span>
        </div>
        <input value={data.place} onChange={(e) => save({ ...data, place: e.target.value })} placeholder={t("sos.manualLocPh")} style={{ ...inp, marginBottom: 8 }} />

        {/* 🌏 현지인에게 보여줄 카드 (이름·상황·위치, 실시간) */}
        <div style={{ marginBottom: 8, padding: "9px 12px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}` }}>
          <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 800, color: theme.gold }}>{t("sos.localCard")}</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.text, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{localCard()}</p>
        </div>

        {/* 카카오톡으로 상황·위치 전송 (해외 기본) */}
        <button onClick={shareKakao}
          style={{ width: "100%", padding: "13px", fontSize: 16, fontWeight: 900, color: "#3a1d1d", background: "#FEE500", border: "none", borderRadius: 13, cursor: "pointer", marginBottom: 6 }}>
          {t("sos.kakao")}
        </button>
        {copied && <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: theme.correct, textAlign: "center" }}>{copied}</p>}

        {/* 긴급 전화 */}
        <p style={{ margin: "10px 0 5px 2px", fontSize: 11.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.3 }}>{t("sos.callTitle")} · {t(ctry.nameKey)}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {hotlines.map((h) => (
            <a key={h.kind + h.num} href={`tel:${h.num}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "9px 11px", borderRadius: 10, border: `1px solid ${theme.cardBorder}`, background: theme.card, textDecoration: "none", color: theme.text }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.emoji} {t(LBL_KEY[h.kind])}</span>
              <span style={{ fontSize: 12.5, fontWeight: 900, color: RED, flexShrink: 0 }}>{h.num.startsWith("+") ? "📞" : h.num}</span>
            </a>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: theme.textFaint, letterSpacing: 1, margin: "10px 0 0" }}>DABAR by AMOV · Love Creates Value</p>
      </div>
    </div>,
    document.body
  );
}

const inp: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 15, padding: "9px 11px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 800, color: theme.textMuted, marginBottom: 3 };
