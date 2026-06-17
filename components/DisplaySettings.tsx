"use client";
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { softCard } from "@/lib/ui";

// 화면 설정 — 큰 글씨 / 야간 모드 토글. <html> 클래스 + localStorage 로 즉시·지속 적용.
// (초기 클래스는 layout.tsx 의 사전 스크립트가 페인트 전에 붙인다.)
export default function DisplaySettings() {
  const { t } = useI18n();
  const [big, setBig] = useState(false);
  const [night, setNight] = useState(false);

  useEffect(() => {
    const e = document.documentElement;
    setBig(e.classList.contains("big-text"));
    setNight(e.classList.contains("night"));
  }, []);

  function apply(cls: string, key: string, on: boolean) {
    const e = document.documentElement;
    e.classList.toggle(cls, on);
    try { on ? localStorage.setItem(key, "1") : localStorage.removeItem(key); } catch { /* */ }
    if (cls === "night") { const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", on ? "#0e1620" : "#ffffff"); }
  }
  function toggleBig() { const v = !big; setBig(v); apply("big-text", "dabar_bigtext", v); }
  function toggleNight() { const v = !night; setNight(v); apply("night", "dabar_night", v); }

  return (
    <div style={softCard({ padding: "6px 4px", marginBottom: 16 })}>
      <Row icon="🔆" title={t("disp.bigText")} sub={t("disp.bigTextSub")} on={big} onToggle={toggleBig} />
      <div style={{ height: 1, background: theme.cardBorder, margin: "0 14px" }} />
      <Row icon="🌙" title={t("disp.night")} sub={t("disp.nightSub")} on={night} onToggle={toggleNight} />
    </div>
  );
}

function Row({ icon, title, sub, on, onToggle }: { icon: string; title: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={on} aria-label={title}
      style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left", padding: "12px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
      <span style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: theme.goldLight, display: "grid", placeItems: "center", fontSize: 21 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: theme.text }}>{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 1, lineHeight: 1.35 }}>{sub}</span>
      </span>
      {/* 토글 스위치 */}
      <span aria-hidden style={{ flexShrink: 0, width: 48, height: 28, borderRadius: 999, background: on ? theme.primary : theme.border, position: "relative", transition: "background .15s ease" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left .15s ease" }} />
      </span>
    </button>
  );
}
