"use client";
import { useEffect } from "react";

// 배포 직후 브라우저가 옛 HTML로 사라진 JS 청크를 요청하면 흰 화면(ChunkLoadError)이 난다.
// 이를 감지해 1회 자동 새로고침으로 자가복구한다. (무한 새로고침 방지 가드)
const RELOAD_KEY = "dabar_chunk_reloaded";
const isChunkErr = (m?: string | null) =>
  !!m && /ChunkLoadError|Loading chunk [\d]+ failed|dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(m);

export default function ChunkGuard() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        if (sessionStorage.getItem(RELOAD_KEY)) return; // 이미 한 번 시도 → 루프 방지
        sessionStorage.setItem(RELOAD_KEY, "1");
      } catch { /* */ }
      location.reload();
    };
    const onError = (e: ErrorEvent) => {
      if (isChunkErr(e.message) || isChunkErr((e.error as { message?: string } | undefined)?.message)) reloadOnce();
    };
    const onReject = (e: PromiseRejectionEvent) => {
      const r = e.reason as { message?: string } | string | undefined;
      const m = typeof r === "string" ? r : r?.message;
      if (isChunkErr(m)) reloadOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    // 정상적으로 떴으면 가드 해제 → 다음 배포 때 다시 1회 새로고침 허용
    const t = window.setTimeout(() => { try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* */ } }, 5000);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      window.clearTimeout(t);
    };
  }, []);
  return null;
}
