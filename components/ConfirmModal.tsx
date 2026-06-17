"use client";
import { useCallback, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 스타일된 확인 모달 — 브라우저 기본 confirm() 대신 사용. 약속(Promise)을 반환해
//   if (await confirm({ ... })) { ... }  형태로 자연스럽게 쓸 수 있다.
type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean };

export function useConfirm() {
  const { t } = useI18n();
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((opts: ConfirmOpts) =>
    new Promise<boolean>((resolve) => setState({ ...opts, resolve })), []);

  const close = (v: boolean) => { state?.resolve(v); setState(null); };

  const view = state ? (
    <div role="dialog" aria-modal="true" onClick={() => close(false)}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(8,20,30,0.5)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in"
        style={{ width: "100%", maxWidth: 340, background: theme.bg, borderRadius: 18, border: `1px solid ${theme.cardBorder}`, padding: "20px 20px 16px", boxShadow: "0 18px 50px rgba(0,0,0,0.28)" }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: theme.text, margin: "0 0 8px", lineHeight: 1.4 }}>{state.title}</p>
        {state.message && <p style={{ fontSize: 13.5, color: theme.textMuted, margin: "0 0 18px", lineHeight: 1.6 }}>{state.message}</p>}
        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={() => close(false)}
            style={{ flex: 1, padding: 13, fontSize: 14.5, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>
            {state.cancelLabel ?? t("common.cancel")}
          </button>
          <button onClick={() => close(true)} autoFocus
            style={{ flex: 1, padding: 13, fontSize: 14.5, fontWeight: 800, color: "#fff", background: state.danger ? theme.wrong : theme.primary, border: "none", borderRadius: 12, cursor: "pointer" }}>
            {state.confirmLabel ?? t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, view };
}
