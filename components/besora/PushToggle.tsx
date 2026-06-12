"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { getPushState, enablePush, type PushState } from "@/lib/besora/push";

// 동행 메시지 푸시 알림 켜기 토글 (/share/me)
export default function PushToggle() {
  const { myLang } = useLang();
  const [state, setState] = useState<PushState>("off");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getPushState().then(setState).catch(() => {}); }, []);

  if (state === "unsupported") return null;

  async function turnOn() {
    setBusy(true);
    try { setState(await enablePush()); } catch { /* ignore */ }
    setBusy(false);
  }

  if (state === "on") {
    return (
      <p style={{ fontSize: 12.5, color: theme.correct, fontWeight: 700, margin: "0 0 14px" }}>{ui(myLang, "pushEnabled")}</p>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={turnOn} disabled={busy || state === "denied"}
        style={{ width: "100%", borderRadius: 12, background: state === "denied" ? theme.card : theme.primaryBg, color: state === "denied" ? theme.textFaint : theme.primarySoft, border: `1px solid ${theme.cardBorder}`, padding: "11px 0", fontSize: 13.5, fontWeight: 700, cursor: state === "denied" ? "default" : "pointer", opacity: busy ? 0.5 : 1 }}>
        {ui(myLang, "pushEnable")}
      </button>
      {state === "denied" && <p style={{ fontSize: 11.5, color: theme.textMuted, margin: "6px 2px 0", lineHeight: 1.5 }}>{ui(myLang, "pushDenied")}</p>}
    </div>
  );
}
