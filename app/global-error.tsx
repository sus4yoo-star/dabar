"use client";
import { useEffect } from "react";

// 최후의 방어선 — 루트에서 렌더 크래시가 나도 흰 화면 대신 복구 UI를 보여준다.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 청크 로드 실패면 1회 자동 새로고침으로 자가복구
    const m = error?.message || "";
    if (/ChunkLoadError|Loading chunk|dynamically imported module|module script failed/i.test(m)) {
      try {
        if (!sessionStorage.getItem("dabar_chunk_reloaded")) {
          sessionStorage.setItem("dabar_chunk_reloaded", "1");
          location.reload();
        }
      } catch { /* */ }
    }
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#ffffff", color: "#173249" }}>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🕊️</div>
          <p style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>화면을 불러오지 못했어요</p>
          <p style={{ fontSize: 13, color: "#54718a", margin: 0, lineHeight: 1.6 }}>잠시 후 다시 시도해 주세요. 새로고침하면 대부분 해결돼요.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => { try { reset(); } catch { location.reload(); } }}
              style={{ fontSize: 14, fontWeight: 800, color: "#fff", background: "#1f9bef", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>다시 시도</button>
            <button onClick={() => location.reload()}
              style={{ fontSize: 14, fontWeight: 700, color: "#173249", background: "transparent", border: "1px solid rgba(23,50,73,0.2)", borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>새로고침</button>
          </div>
        </div>
      </body>
    </html>
  );
}
