"use client";
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 홈 상단 항상 보이는 큰 글씨 / 야간 모드 빠른 토글 (어르신 접근성).
// 계정 > 화면 설정과 같은 <html> 클래스·localStorage 키를 공유한다.
export default function DisplayQuickToggle() {
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
  }
  function toggleBig() { const v = !big; setBig(v); apply("big-text", "dabar_bigtext", v); }
  function toggleNight() { const v = !night; setNight(v); apply("night", "dabar_night", v); }

  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 10 }}>
      <Pill icon="🔆" label={t("disp.bigText")} on={big} onClick={toggleBig} />
      <Pill icon="🌙" label={t("disp.night")} on={night} onClick={toggleNight} />
    </div>
  );
}

function Pill({ icon, label, on, onClick }: { icon: string; label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px",
        fontSize: 13, fontWeight: 800, cursor: "pointer", borderRadius: 999, whiteSpace: "nowrap",
        color: on ? "#fff" : theme.textMuted,
        background: on ? theme.primary : "transparent",
        border: `1.5px solid ${on ? theme.primary : theme.border}`,
        transition: "background .15s, color .15s, border-color .15s",
      }}>
      <span aria-hidden style={{ fontSize: 15 }}>{icon}</span>{label}
      <span aria-hidden style={{ fontSize: 11, opacity: 0.85, fontWeight: 700 }}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}
