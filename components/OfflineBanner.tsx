"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

// 오프라인 안내 — 인터넷 연결이 끊기면 상단에 띄워, 빈 화면을 멈춘 줄로 오해하지 않게 한다.
export default function OfflineBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" aria-live="polite"
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 400, background: "#c9820a", color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1.4, textAlign: "center", padding: "8px 14px calc(8px + env(safe-area-inset-top))", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
      📡 {t("offline.msg")}
    </div>
  );
}
