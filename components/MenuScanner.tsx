"use client";

// 📷 이미지 번역 — 사진 찍기/첨부 → 글자 읽어 설정 언어로 번역. 결과는 사진 + 깔끔한 번역 목록(전체화면).
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n, LANGS } from "@/lib/i18n";

type Item = { original: string; translated: string };

// 사진을 긴 변 1024px·JPEG 로 정규화(EXIF 회전 반영) → 화면표시용 dataUrl + 전송용 base64.
async function processImage(file: File, maxDim = 900, quality = 0.68): Promise<{ base64: string; dataUrl: string }> {
  let bmp: ImageBitmap | HTMLImageElement;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    const url = URL.createObjectURL(file);
    bmp = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
  }
  let w = (bmp as ImageBitmap).width, h = (bmp as ImageBitmap).height;
  if (Math.max(w, h) > maxDim) { const r = maxDim / Math.max(w, h); w = Math.round(w * r); h = Math.round(h * r); }
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp as CanvasImageSource, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { base64: dataUrl.split(",")[1] ?? "", dataUrl };
}

export default function MenuScanner() {
  const { t, lang } = useI18n();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(lang); // 번역 결과 언어 (선택 가능)

  async function handle(file: File) {
    setErr(""); setLoading(true); setItems(null);
    try {
      const { base64, dataUrl } = await processImage(file);
      if (!base64) { setErr(t("scan.fail")); setLoading(false); return; }
      setImgUrl(dataUrl);
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, lang: target }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setErr(d?.error === "no-key" ? t("scan.noKey") : (d?.detail ? `${t("scan.fail")}\n(${String(d.detail).slice(0, 140)})` : t("scan.fail")));
      else { setItems((d.items ?? []) as Item[]); setOpen(true); }
    } catch { setErr(t("scan.fail")); }
    setLoading(false);
  }
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) handle(f); };

  const btn: React.CSSProperties = { width: "100%", padding: "11px 8px", fontSize: 13.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap" };

  return (
    <div className="fade-in-3" style={{ height: "100%", display: "flex", flexDirection: "column", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "12px 13px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
        <span style={{ fontSize: 16 }}>📷</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: theme.gold }}>{t("scan.title")}</span>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 11.5, color: theme.textMuted, lineHeight: 1.4 }}>{t("scan.sub")}</p>

      {/* 번역 언어 선택 */}
      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: theme.textMuted, flexShrink: 0 }}>{t("scan.toLang")}</span>
        <select value={target} onChange={(e) => setTarget(e.target.value)}
          style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: theme.text, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "6px 8px", outline: "none", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>

      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onPick} style={{ display: "none" }} />
      <input ref={galRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />

      {loading ? (
        <p style={{ margin: "4px 0", fontSize: 13, color: theme.primarySoft, fontWeight: 700, textAlign: "center" }}>{t("scan.loading")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => camRef.current?.click()} style={btn}>{t("scan.camera")}</button>
          <button onClick={() => galRef.current?.click()} style={{ ...btn, background: theme.primaryBg, color: theme.primarySoft, border: `1px solid ${theme.cardBorder}` }}>{t("scan.attach")}</button>
        </div>
      )}
      {err && <p style={{ margin: "8px 0 0", fontSize: 12, color: theme.wrong, textAlign: "center", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{err}</p>}

      {open && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: theme.bg, display: "flex", flexDirection: "column" }}>
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${theme.cardBorder}` }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: theme.gold }}>📷 {t("scan.title")}</span>
            <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 700, color: theme.text, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "7px 16px", cursor: "pointer" }}>{t("scan.close")} ✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 28px", maxWidth: 560, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            {imgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl} alt="scan" style={{ display: "block", width: "100%", maxHeight: "34vh", objectFit: "contain", borderRadius: 10, background: theme.card, marginBottom: 14 }} />
            )}
            {!items || items.length === 0 ? (
              <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 14, padding: "1.5rem 0" }}>{t("scan.none")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, lineHeight: 1.4 }}>{it.translated}</div>
                    {it.original && <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 3, lineHeight: 1.4 }}>{it.original}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
