"use client";

// 💱 환율 계산기 — 태국 바트(THB) ↔ 대한민국 원(KRW). 양방향 입력.
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

  // 환율이 들어오면 현재 입력 기준으로 한 번 계산
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
    <div className="fade-in-3" style={{ marginTop: 9, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: theme.gold }}>💱 {t("fx.title")}</span>
        <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700 }}>
          {rate != null ? t("fx.per", { n: rate.toFixed(2) }) : t("fx.loading")}
        </span>
      </div>

      <Row flag="🇹🇭" label={t("fx.baht")} code="THB" value={last === "thb" ? thb : group(thb)} onChange={onThb} />
      <div style={{ textAlign: "center", margin: "4px 0", color: theme.textFaint, fontSize: 15, fontWeight: 800 }}>⇅</div>
      <Row flag="🇰🇷" label={t("fx.won")} code="KRW" value={last === "krw" ? krw : group(krw)} onChange={onKrw} />

      <p style={{ margin: "10px 2px 0", fontSize: 10.5, color: theme.textFaint, textAlign: "center" }}>
        {t("fx.note", { d: dateStr })}
      </p>
    </div>
  );
}

function Row({ flag, label, code, value, onChange }: { flag: string; label: string; code: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 13, padding: "9px 12px" }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{flag}</span>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 64 }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.text }}>{code}</span>
        <span style={{ fontSize: 10, color: theme.textMuted }}>{label}</span>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="0"
        style={{ flex: 1, minWidth: 0, textAlign: "right", fontSize: 18, fontWeight: 800, color: theme.text, background: "transparent", border: "none", outline: "none" }}
      />
    </div>
  );
}
