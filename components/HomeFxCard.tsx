"use client";

// 💱 환율 계산기 — 태국 바트(THB) ↔ 대한민국 원(KRW). 양방향 입력. (좁은 반칸에서도 안 깨지게 컴팩트)
// 환율은 /api/fx 에서 매일 오전 9시(KST) 기준으로 갱신된 값을 사용.
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const num = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;
const group = (s: string) => (s === "" ? "" : Number(s).toLocaleString("en-US", { maximumFractionDigits: 2 }));
const clean = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

export default function HomeFxCard() {
  const { t, lang } = useI18n();
  const [rate, setRate] = useState<number | null>(null);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [thb, setThb] = useState("1000");
  const [krw, setKrw] = useState("");
  const [last, setLast] = useState<"thb" | "krw">("thb");

  useEffect(() => {
    fetch("/api/fx")
      .then((r) => r.json())
      .then((j) => { if (j?.rate) { setRate(j.rate); setAsOf(j.asOf ?? null); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (rate == null) return;
    if (last === "thb") setKrw(thb === "" ? "" : String(Math.round(num(thb) * rate)));
    else setThb(krw === "" ? "" : String(Math.round((num(krw) / rate) * 100) / 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  function onThb(v: string) {
    const c = clean(v); setThb(c); setLast("thb");
    if (rate != null) setKrw(c === "" ? "" : String(Math.round(num(c) * rate)));
  }
  function onKrw(v: string) {
    const c = clean(v); setKrw(c); setLast("krw");
    if (rate != null) setThb(c === "" ? "" : String(Math.round((num(c) / rate) * 100) / 100));
  }

  const dateStr = asOf
    ? new Date(asOf).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-CA", { month: "2-digit", day: "2-digit" })
    : "—";

  return (
    <div className="fade-in-3" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "12px 11px" }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.gold, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>💱 {t("fx.title")}</div>

      <Row flag="🇹🇭" code="THB" value={last === "thb" ? thb : group(thb)} onChange={onThb} />
      <div style={{ textAlign: "center", margin: "3px 0", color: theme.textFaint, fontSize: 14, fontWeight: 800 }}>⇅</div>
      <Row flag="🇰🇷" code="KRW" value={last === "krw" ? krw : group(krw)} onChange={onKrw} />

      <p style={{ margin: "9px 1px 0", fontSize: 10, color: theme.textFaint, lineHeight: 1.4 }}>
        {rate != null ? t("fx.per", { n: rate.toFixed(2) }) : t("fx.loading")}<br />{t("fx.note", { d: dateStr })}
      </p>
    </div>
  );
}

function Row({ flag, code, value, onChange }: { flag: string; code: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "8px 9px" }}>
      <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{flag}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: theme.text, flexShrink: 0 }}>{code}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="0"
        style={{ flex: 1, minWidth: 0, width: "100%", textAlign: "right", fontSize: 15, fontWeight: 800, color: theme.text, background: "transparent", border: "none", outline: "none" }}
      />
    </div>
  );
}
