"use client";

// 📷 메뉴·간판 번역 — 사진을 찍거나 올리면 글자를 읽어 설정한 언어로 번역.
import { useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

// 사진을 긴 변 1280px·JPEG 로 축소해 base64(접두사 제거) 로 변환 — 전송량·시간 절감.
async function toBase64(file: File, maxDim = 1280, quality = 0.7): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = url;
    });
    let { width: w, height: h } = img;
    if (Math.max(w, h) > maxDim) { const r = maxDim / Math.max(w, h); w = Math.round(w * r); h = Math.round(h * r); }
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return dataUrl.split(",")[1] ?? "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function MenuScanner() {
  const { t, lang } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState("");
  const [original, setOriginal] = useState("");
  const [showOrig, setShowOrig] = useState(false);
  const [err, setErr] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 다시 선택 가능하게
    if (!file) return;
    setErr(""); setTranslated(""); setOriginal(""); setShowOrig(false); setLoading(true);
    try {
      const image = await toBase64(file);
      if (!image) { setErr(t("scan.fail")); setLoading(false); return; }
      const r = await fetch("/api/scan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, lang }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(t("scan.fail")); }
      else if (!d.translated) { setErr(t("scan.none")); }
      else { setTranslated(d.translated); setOriginal(d.original ?? ""); }
    } catch {
      setErr(t("scan.fail"));
    }
    setLoading(false);
  }

  const has = !!translated;

  return (
    <div className="fade-in-3" style={{ marginTop: 12, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "14px 15px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>📷</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: theme.gold }}>{t("scan.title")}</span>
      </div>
      <p style={{ margin: "0 0 11px", fontSize: 12, color: theme.textMuted }}>{t("scan.sub")}</p>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPick} style={{ display: "none" }} />
      <button onClick={() => fileRef.current?.click()} disabled={loading}
        style={{ width: "100%", padding: 13, fontSize: 15, fontWeight: 800, color: "#fff", background: loading ? theme.textFaint : theme.primary, border: "none", borderRadius: 14, cursor: loading ? "default" : "pointer" }}>
        {loading ? t("scan.loading") : has ? t("scan.again") : t("scan.take")}
      </button>

      {err && <p style={{ margin: "10px 0 0", fontSize: 13, color: theme.wrong, textAlign: "center" }}>{err}</p>}

      {has && (
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, fontSize: 15, lineHeight: 1.55, color: theme.text, whiteSpace: "pre-wrap" }}>{translated}</div>
          {original && (
            <>
              <button onClick={() => setShowOrig((s) => !s)} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: "transparent", border: "none", cursor: "pointer", padding: 2 }}>
                {showOrig ? t("scan.hideOrig") : t("scan.showOrig")}
              </button>
              {showOrig && <div style={{ marginTop: 4, padding: "10px 13px", borderRadius: 12, background: theme.bg, border: `1px solid ${theme.border}`, fontSize: 13.5, lineHeight: 1.5, color: theme.textMuted, whiteSpace: "pre-wrap" }}>{original}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
