"use client";

// 💱 환율 계산기 — 음성통역 지원 언어들의 통화를 골라 환전. 양방향 입력. (좁은 반칸에서도 안 깨지게)
// 시세는 /api/fx 의 USD 기준 전체 시세표(매일 오전 9시 KST 갱신)를 사용해 두 통화 교차환산.
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 지원 통화 (음성통역 20개 언어의 대표 통화)
const CURRENCIES: { cur: string; flag: string }[] = [
  { cur: "KRW", flag: "🇰🇷" }, { cur: "THB", flag: "🇹🇭" }, { cur: "USD", flag: "🇺🇸" },
  { cur: "LAK", flag: "🇱🇦" }, { cur: "JPY", flag: "🇯🇵" }, { cur: "CNY", flag: "🇨🇳" },
  { cur: "VND", flag: "🇻🇳" }, { cur: "IDR", flag: "🇮🇩" }, { cur: "MYR", flag: "🇲🇾" },
  { cur: "MMK", flag: "🇲🇲" }, { cur: "INR", flag: "🇮🇳" }, { cur: "BDT", flag: "🇧🇩" },
  { cur: "PKR", flag: "🇵🇰" }, { cur: "EUR", flag: "🇪🇺" }, { cur: "BRL", flag: "🇧🇷" },
  { cur: "SAR", flag: "🇸🇦" }, { cur: "IRR", flag: "🇮🇷" }, { cur: "RUB", flag: "🇷🇺" },
  { cur: "KES", flag: "🇰🇪" },
];
const flagOf = (c: string) => CURRENCIES.find((x) => x.cur === c)?.flag ?? "🏳️";

const num = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;
const group = (s: string) => (s === "" ? "" : Number(s).toLocaleString("en-US", { maximumFractionDigits: 2 }));
const clean = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
// from→to 환율(1 from = ? to), USD 기준 시세표로 교차계산
const crossRate = (rates: Record<string, number>, from: string, to: string): number | null => {
  const rf = rates[from], rt = rates[to];
  if (!rf || !rt) return null;
  return rt / rf;
};
// 소수점 없는 통화(원·엔·동 등)는 정수로, 그 외는 소수 2자리
const ZERO_DEC = new Set(["KRW", "JPY", "VND", "IDR", "LAK", "MMK", "IRR", "KHR"]);
const fmt = (n: number, cur: string) => ZERO_DEC.has(cur) ? String(Math.round(n)) : String(Math.round(n * 100) / 100);

export default function HomeFxCard() {
  const { t, lang } = useI18n();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [asOf, setAsOf] = useState<string | null>(null);
  const [fromCur, setFromCur] = useState("THB");
  const [toCur, setToCur] = useState("KRW");
  const [fromVal, setFromVal] = useState("1000");
  const [toVal, setToVal] = useState("");
  const [last, setLast] = useState<"from" | "to">("from");

  useEffect(() => {
    fetch("/api/fx").then((r) => r.json()).then((j) => { if (j?.rates) { setRates(j.rates); setAsOf(j.asOf ?? null); } }).catch(() => {});
  }, []);

  const rate = crossRate(rates, fromCur, toCur); // 1 from = rate to

  // 시세·통화 변경 시 마지막 입력 기준으로 재계산
  useEffect(() => {
    if (rate == null) return;
    if (last === "from") setToVal(fromVal === "" ? "" : fmt(num(fromVal) * rate, toCur));
    else setFromVal(toVal === "" ? "" : fmt(num(toVal) / rate, fromCur));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates, fromCur, toCur]);

  function onFrom(v: string) {
    const c = clean(v); setFromVal(c); setLast("from");
    if (rate != null) setToVal(c === "" ? "" : fmt(num(c) * rate, toCur));
  }
  function onTo(v: string) {
    const c = clean(v); setToVal(c); setLast("to");
    if (rate != null) setFromVal(c === "" ? "" : fmt(num(c) / rate, fromCur));
  }

  // 위아래 통화 교체 (값도 함께 스왑 → 환산값 유지)
  function swap() {
    setFromCur(toCur); setToCur(fromCur);
    setFromVal(toVal); setToVal(fromVal);
    setLast(last === "from" ? "to" : "from");
  }

  const dateStr = asOf ? new Date(asOf).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-CA", { month: "2-digit", day: "2-digit" }) : "—";

  return (
    <div className="fade-in-3" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "12px 11px" }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.gold, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>💱 {t("fx.title")}</div>

      <Row cur={fromCur} onCur={(c) => { setFromCur(c); setLast("from"); }} value={last === "from" ? fromVal : group(fromVal)} onChange={onFrom} />
      <div style={{ display: "flex", justifyContent: "center", margin: "5px 0" }}>
        <button onClick={swap} aria-label={t("fx.swap")} title={t("fx.swap")}
          style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: theme.primary, color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(31,155,239,0.35)" }}>⇅</button>
      </div>
      <Row cur={toCur} onCur={(c) => { setToCur(c); setLast("from"); }} value={last === "to" ? toVal : group(toVal)} onChange={onTo} />

      <p style={{ margin: "9px 1px 0", fontSize: 12, color: theme.textFaint, lineHeight: 1.45 }}>
        {rate != null ? `1 ${fromCur} = ${fmtRate(rate)} ${toCur}` : t("fx.loading")}<br />{t("fx.note", { d: dateStr })}
      </p>
    </div>
  );
}

// 환율 표기: 큰 값은 천단위, 1 이상은 소수2, 1 미만은 유효숫자 — "0"으로 안 보이게
function fmtRate(r: number): string {
  if (r >= 100) return Math.round(r).toLocaleString("en-US");
  if (r >= 1) return String(Math.round(r * 100) / 100);
  return Number(r.toPrecision(2)).toString();
}

function Row({ cur, onCur, value, onChange }: { cur: string; onCur: (c: string) => void; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "6px 8px" }}>
      <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{flagOf(cur)}</span>
      <select value={cur} onChange={(e) => onCur(e.target.value)}
        style={{ flexShrink: 0, fontSize: 12, fontWeight: 800, color: theme.text, background: "transparent", border: "none", outline: "none", appearance: "none", WebkitAppearance: "none", cursor: "pointer", padding: "2px 0" }}>
        {CURRENCIES.map((c) => <option key={c.cur} value={c.cur}>{c.cur}</option>)}
      </select>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" placeholder="0"
        style={{ flex: 1, minWidth: 0, width: "100%", textAlign: "right", fontSize: 15, fontWeight: 800, color: theme.text, background: "transparent", border: "none", outline: "none" }} />
    </div>
  );
}
