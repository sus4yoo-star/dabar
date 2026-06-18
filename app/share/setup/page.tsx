"use client";

import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function Setup() {
  const router = useRouter();
  const { myLang, setMyLang, languages } = useLang();

  return (
    <AppShell title={ui(myLang, "setMyLanguage")} subtitle={ui(myLang, "myLanguage")}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {languages.map((l) => {
          const on = l.code === myLang;
          return (
            <button key={l.code} onClick={() => { setMyLang(l.code); router.push("/share"); }}
              style={{ borderRadius: 16, padding: "14px", textAlign: "left", cursor: "pointer", background: on ? "var(--t-sacredLight)" : theme.card, border: `1px solid ${on ? "var(--t-sacredBorder)" : theme.cardBorder}` }}>
              <span style={{ display: "block", fontWeight: 700, color: on ? "var(--t-sacred)" : theme.text }}>{l.name_native}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>{l.name_en}</span>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
