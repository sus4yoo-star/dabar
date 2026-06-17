"use client";

// 🆘 긴급 SOS 버튼 — 가볍게 유지. 모달 본체(SosModal)는 열 때만 동적 import 되어
// 홈·전도여정 등 버튼이 보이는 페이지의 초기 번들에서 분리된다.
import { useState } from "react";
import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n";

const RED = "#e23b3b";
const SosModal = dynamic(() => import("./SosModal"), { ssr: false });

export default function SosButton({ compact = false, variant = "full" }: { compact?: boolean; variant?: "full" | "mini" } = {}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "mini" ? (
        <button onClick={() => setOpen(true)} aria-label={t("sos.button")} title={t("sos.button")}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, padding: "6px 12px", fontSize: 12.5, fontWeight: 900, letterSpacing: 0.5, color: "#fff", background: RED, border: "none", borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(226,59,59,0.35)" }}>
          🆘 SOS
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ width: "100%", marginTop: compact ? 9 : 12, padding: compact ? "14px" : "16px", fontSize: compact ? 16.5 : 18, fontWeight: 900, letterSpacing: 1, color: "#fff", background: RED, border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 6px 18px rgba(226,59,59,0.4)" }}>
          {t("sos.button")}
        </button>
      )}
      {open && <SosModal onClose={() => setOpen(false)} />}
    </>
  );
}
