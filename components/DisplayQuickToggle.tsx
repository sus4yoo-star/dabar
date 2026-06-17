"use client";
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 상단 바(언어↔로그아웃 사이)에 들어가는 큰 글씨 / 야간 모드 빠른 토글.
// 한 줄에 들어가도록 컴팩트한 아이콘 버튼 — 켜지면 파랗게 채워진다.
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
    <div className="dq-bar" style={{ display: "flex", flexWrap: "nowrap", gap: 6, flexShrink: 0 }}>
      <Pill on={big} onClick={toggleBig} title={t("disp.bigText")}>
        <span aria-hidden style={{ fontWeight: 900, lineHeight: 1, letterSpacing: -0.5 }}>
          <span style={{ fontSize: 17 }}>A</span><span style={{ fontSize: 11 }}>a</span>
        </span>
      </Pill>
      <Pill on={night} onClick={toggleNight} title={t("disp.night")}>
        <span aria-hidden style={{ fontSize: 15, lineHeight: 1 }}>🌙</span>
      </Pill>
    </div>
  );
}

function Pill({ on, onClick, title, children }: { on: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={title} title={title}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 38, height: 32, padding: "0 9px", cursor: "pointer", borderRadius: 999,
        color: on ? "#fff" : theme.textMuted,
        background: on ? theme.primary : "transparent",
        border: `1.5px solid ${on ? theme.primary : theme.border}`,
        transition: "background .15s, color .15s, border-color .15s",
      }}>
      {children}
    </button>
  );
}
