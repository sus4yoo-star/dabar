"use client";
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const KEY = "dabar_a2hs_dismissed";

// iOS 사파리는 PWA 설치 배너가 없어서, 어르신은 "홈 화면에 추가"를 모릅니다.
// 아이폰·미설치(브라우저) 상태에서만 1회 안내하고, 닫으면 다시 안 띄웁니다.
export default function InstallHint() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "1") return;
      const ua = navigator.userAgent || "";
      const isIos = /iphone|ipad|ipod/i.test(ua);
      const standalone = window.matchMedia?.("(display-mode: standalone)").matches
        || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isIos && !standalone) {
        const id = setTimeout(() => setShow(true), 1200); // 첫 화면 안정 후 등장
        return () => clearTimeout(id);
      }
    } catch { /* */ }
  }, []);

  function dismiss() { setShow(false); try { localStorage.setItem(KEY, "1"); } catch { /* */ } }

  if (!show) return null;
  return (
    <div className="fade-in" style={{ marginBottom: 12, padding: "13px 14px", borderRadius: 16, border: `1px solid ${theme.goldBorder}`, background: theme.goldLight, display: "flex", alignItems: "flex-start", gap: 11 }}>
      <span aria-hidden style={{ flexShrink: 0, fontSize: 22, lineHeight: 1.2 }}>📲</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: theme.gold }}>{t("a2hs.title")}</span>
        <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, marginTop: 2, lineHeight: 1.5 }}>{t("a2hs.ios")}</span>
      </span>
      <button onClick={dismiss} aria-label={t("common.cancel")} style={{ flexShrink: 0, fontSize: 15, color: theme.textMuted, background: "transparent", border: "none", cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}>✕</button>
    </div>
  );
}
