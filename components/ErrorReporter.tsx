"use client";
import { useEffect } from "react";

// 전역 클라이언트 오류 리포터 — 핸들러/비동기에서 터지는 런타임 오류와
// 처리 안 된 Promise 거부를 잡아 /api/clientlog 로 보낸다.
// 세션당 상한·중복 제거로 로그 폭주를 막는다. (React 렌더 크래시는 global-error 가 담당)
export default function ErrorReporter() {
  useEffect(() => {
    const seen = new Set<string>();
    let sent = 0;
    const MAX = 10;

    const send = (kind: string, message: string, stack?: string) => {
      if (!message || sent >= MAX) return;
      const key = kind + "|" + message.slice(0, 120);
      if (seen.has(key)) return;
      seen.add(key); sent++;
      const body = JSON.stringify({
        kind, message: message.slice(0, 500), stack: (stack || "").slice(0, 1500),
        url: location.href, ua: navigator.userAgent.slice(0, 200),
      });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon("/api/clientlog", new Blob([body], { type: "application/json" }));
        else fetch("/api/clientlog", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch { /* */ }
    };

    const onErr = (e: ErrorEvent) => send("error", e.message || String(e.error ?? ""), (e.error as Error | undefined)?.stack);
    const onRej = (e: PromiseRejectionEvent) => {
      const r = e.reason as { message?: string; stack?: string } | undefined;
      send("unhandledrejection", r?.message || String(r ?? ""), r?.stack);
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => { window.removeEventListener("error", onErr); window.removeEventListener("unhandledrejection", onRej); };
  }, []);

  return null;
}
