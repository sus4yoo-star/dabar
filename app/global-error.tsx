"use client";
import { useEffect, useState } from "react";

// 최후의 방어선 — 루트에서 렌더 크래시가 나도 흰 화면 대신 복구 UI를 보여준다.
// i18n 프로바이더 밖이라, 저장된 언어/야간 설정을 직접 읽어 맞춰준다.
const MSG: Record<string, { t: string; s: string; retry: string; refresh: string }> = {
  ko: { t: "화면을 불러오지 못했어요", s: "잠시 후 다시 시도해 주세요. 새로고침하면 대부분 해결돼요.", retry: "다시 시도", refresh: "새로고침" },
  en: { t: "Something went wrong", s: "Please try again in a moment. Refreshing usually fixes it.", retry: "Try again", refresh: "Refresh" },
  th: { t: "โหลดหน้าจอไม่สำเร็จ", s: "กรุณาลองอีกครั้งในอีกสักครู่ การรีเฟรชมักช่วยแก้ได้", retry: "ลองอีกครั้ง", refresh: "รีเฟรช" },
  lo: { t: "ໂຫຼດໜ້າຈໍບໍ່ສຳເລັດ", s: "ກະລຸນາລອງໃໝ່ໃນອີກບໍ່ດົນ ການໂຫຼດຄືນມັກຊ່ວຍແກ້ໄຂໄດ້", retry: "ລອງໃໝ່", refresh: "ໂຫຼດຄືນ" },
};

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState("ko");
  const [night, setNight] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem("dabar_lang");
      if (l && MSG[l]) setLang(l);
      setNight(localStorage.getItem("dabar_night") === "1");
    } catch { /* */ }
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

  const m = MSG[lang] ?? MSG.ko;
  const bg = night ? "#0e1620" : "#ffffff";
  const fg = night ? "#e9eff5" : "#173249";
  const sub = night ? "#a3b6c7" : "#54718a";
  const dir = lang === "ar" || lang === "fa" || lang === "ur" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: bg, color: fg }}>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🕊️</div>
          <p style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{m.t}</p>
          <p style={{ fontSize: 13, color: sub, margin: 0, lineHeight: 1.6 }}>{m.s}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => { try { reset(); } catch { location.reload(); } }}
              style={{ fontSize: 14, fontWeight: 800, color: "#fff", background: "#1f9bef", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>{m.retry}</button>
            <button onClick={() => location.reload()}
              style={{ fontSize: 14, fontWeight: 700, color: fg, background: "transparent", border: `1px solid ${night ? "rgba(255,255,255,0.2)" : "rgba(23,50,73,0.2)"}`, borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>{m.refresh}</button>
          </div>
        </div>
      </body>
    </html>
  );
}
