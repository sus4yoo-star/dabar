"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// 간단한 비차단 토스트 — alert 대신 통일된 안내/에러 표시.
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    if (timer.current) clearTimeout(timer.current); // 연속 호출 시 이전 타이머가 새 메시지를 일찍 지우지 않게
    setMsg(m);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  // 언마운트 시 타이머 정리 (언마운트된 컴포넌트 setState 방지)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const view = msg ? (
    <div role="status" aria-live="polite"
      style={{ position: "fixed", left: "50%", bottom: 92, transform: "translateX(-50%)", zIndex: 300, background: "rgba(23,50,73,0.94)", color: "#fff", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, padding: "10px 16px", borderRadius: 12, maxWidth: "86%", textAlign: "center", boxShadow: "0 8px 28px rgba(0,0,0,0.28)" }}>
      {msg}
    </div>
  ) : null;
  return { show, view };
}
