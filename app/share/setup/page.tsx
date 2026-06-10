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
    <AppShell>
      <h1 style={{ marginBottom: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 24, fontWeight: 600, color: theme.text }}>{ui(myLang, "setMyLanguage")}</h1>
      <p style={{ marginBottom: 24, fontSize: 14, color: theme.textMuted }}>{ui(myLang, "myLanguage")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {languages.map((l) => (
          <button key={l.code} onClick={() => { setMyLang(l.code); router.push("/share"); }}
            style={{ borderRadius: 16, padding: "16px", textAlign: "left", cursor: "pointer", background: theme.card, border: `1px solid ${l.code === myLang ? theme.goldBorder : theme.cardBorder}` }}>
            <span style={{ display: "block", fontWeight: 700, color: theme.text }}>{l.name_native}</span>
            <span style={{ fontSize: 12, color: theme.textMuted }}>{l.name_en}</span>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
