"use client";
import { useCallback, useState } from "react";

// 간단한 비차단 토스트 — alert 대신 통일된 안내/에러 표시.
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 2600);
  }, []);
  const view = msg ? (
    <div role="status" aria-live="polite"
      style={{ position: "fixed", left: "50%", bottom: 92, transform: "translateX(-50%)", zIndex: 300, background: "rgba(23,50,73,0.94)", color: "#fff", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, padding: "10px 16px", borderRadius: 12, maxWidth: "86%", textAlign: "center", boxShadow: "0 8px 28px rgba(0,0,0,0.28)" }}>
      {msg}
    </div>
  ) : null;
  return { show, view };
}
