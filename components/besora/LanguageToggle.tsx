"use client";

import { useEffect, useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function LanguageToggle() {
  const { myLang, seekerLang, setSeekerLang, setMyLang, languages } = useLang();
  const [open, setOpen] = useState<null | "my" | "seeker">(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const nameOf = (code: string) =>
    languages.find((l) => l.code === code)?.name_native ?? code;

  // 바깥 탭/Escape 로 닫기 (열린 채 방치되지 않게 — 특히 어르신 사용성)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
        <button
          onClick={() => setOpen(open === "my" ? null : "my")}
          aria-haspopup="listbox" aria-expanded={open === "my"}
          style={{ borderRadius: 999, padding: "9px 14px", background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, cursor: "pointer" }}
        >
          {nameOf(myLang)}
        </button>
        <span style={{ color: theme.textMuted }}>↔</span>
        <button
          onClick={() => setOpen(open === "seeker" ? null : "seeker")}
          aria-haspopup="listbox" aria-expanded={open === "seeker"}
          style={{ borderRadius: 999, padding: "9px 14px", fontWeight: 700, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, cursor: "pointer" }}
        >
          {seekerLang ? nameOf(seekerLang) : ui(myLang, "seekerLanguage")}
        </button>
      </div>

      {open && (
        <div role="listbox" style={{ position: "absolute", insetInlineEnd: 0, zIndex: 50, marginTop: 8, maxHeight: 260, width: 240, overflow: "auto", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: "#ffffff", padding: 8, boxShadow: "0 16px 40px rgba(23,50,73,0.18)" }}>
          <p style={{ padding: "4px 8px", fontSize: 11.5, color: theme.textMuted, margin: 0 }}>
            {open === "my" ? ui(myLang, "myLanguage") : ui(myLang, "seekerLanguage")}
          </p>
          {languages.map((l) => {
            const sel = (open === "my" ? myLang : seekerLang) === l.code;
            return (
              <button
                key={l.code}
                role="option" aria-selected={sel}
                onClick={() => { open === "my" ? setMyLang(l.code) : setSeekerLang(l.code); setOpen(null); }}
                style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: "12px 12px", textAlign: "left", fontSize: 14.5, color: theme.text, background: sel ? theme.goldLight : "transparent", border: "none", cursor: "pointer" }}
              >
                <span>{l.name_native} ({l.code})</span>
                <span style={{ fontSize: 11.5, color: theme.textMuted }}>{l.name_en}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
