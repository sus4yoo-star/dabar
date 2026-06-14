"use client";

import { useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function LanguageToggle() {
  const { myLang, seekerLang, setSeekerLang, setMyLang, languages } = useLang();
  const [open, setOpen] = useState<null | "my" | "seeker">(null);

  const nameOf = (code: string) =>
    languages.find((l) => l.code === code)?.name_native ?? code;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <button
          onClick={() => setOpen(open === "my" ? null : "my")}
          style={{ borderRadius: 999, padding: "6px 12px", background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, cursor: "pointer" }}
        >
          {nameOf(myLang)}
        </button>
        <span style={{ color: theme.textMuted }}>↔</span>
        <button
          onClick={() => setOpen(open === "seeker" ? null : "seeker")}
          style={{ borderRadius: 999, padding: "6px 12px", fontWeight: 700, color: theme.gold, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, cursor: "pointer" }}
        >
          {seekerLang ? nameOf(seekerLang) : ui(myLang, "seekerLanguage")}
        </button>
      </div>

      {open && (
        <div style={{ position: "absolute", right: 0, zIndex: 50, marginTop: 8, maxHeight: 220, width: 224, overflow: "auto", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: "#ffffff", padding: 8, boxShadow: "0 16px 40px rgba(23,50,73,0.18)" }}>
          <p style={{ padding: "4px 8px", fontSize: 11, color: theme.textMuted, margin: 0 }}>
            {open === "my" ? ui(myLang, "myLanguage") : ui(myLang, "seekerLanguage")}
          </p>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { open === "my" ? setMyLang(l.code) : setSeekerLang(l.code); setOpen(null); }}
              style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: "8px 12px", textAlign: "left", fontSize: 14, color: theme.text, background: "transparent", border: "none", cursor: "pointer" }}
            >
              <span>{l.name_native} ({l.code})</span>
              <span style={{ fontSize: 11, color: theme.textMuted }}>{l.name_en}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
