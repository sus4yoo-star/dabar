"use client";

// 📷 메뉴·간판 번역 — 사진 찍기/첨부 → 글자 위치 인식 → 원문 위에 번역을 겹쳐 표시(전체화면).
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

type Item = { box: { x: number; y: number; w: number; h: number }; original: string; translated: string };

// 사진을 긴 변 1280px·JPEG 로 정규화(EXIF 회전 반영) → 화면표시용 dataUrl + 전송용 base64.
async function processImage(file: File, maxDim = 1024, quality = 0.7): Promise<{ base64: string; dataUrl: string }> {
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
  const [imgH, setImgH] = useState(0);
  const [flip, setFlip] = useState<Record<number, boolean>>({});

  async function handle(file: File) {
    setErr(""); setLoading(true); setItems(null); setFlip({});
    try {
      const { base64, dataUrl } = await processImage(file);
      if (!base64) { setErr(t("scan.fail")); setLoading(false); return; }
      setImgUrl(dataUrl);
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, lang }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setErr(d?.error === "no-key" ? t("scan.noKey") : t("scan.fail"));
      else if (!d.items?.length) { setItems([]); setOpen(true); }
      else { setItems(d.items as Item[]); setOpen(true); }
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
      {err && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: theme.wrong, textAlign: "center" }}>{err}</p>}

      {open && imgUrl && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(8,16,28,0.92)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ position: "sticky", top: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(8,16,28,0.7)" }}>
            <span style={{ fontSize: 13, color: "#cfe0ee" }}>{items && items.length > 0 ? t("scan.hint") : t("scan.none")}</span>
            <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 999, padding: "7px 16px", cursor: "pointer" }}>{t("scan.close")} ✕</button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8px 12px 24px" }}>
            <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="scan" onLoad={(e) => setImgH(e.currentTarget.clientHeight)} style={{ display: "block", maxWidth: "100%", maxHeight: "82vh", borderRadius: 8 }} />
              {(items ?? []).map((it, i) => {
                const showOrig = flip[i];
                const fs = Math.max(9, Math.min(it.box.h * imgH * 0.66, 30));
                return (
                  <button key={i} onClick={() => setFlip((f) => ({ ...f, [i]: !f[i] }))}
                    style={{ position: "absolute", left: `${it.box.x * 100}%`, top: `${it.box.y * 100}%`, width: `${it.box.w * 100}%`, height: `${it.box.h * 100}%`,
                      background: showOrig ? "rgba(255,249,230,0.96)" : "rgba(255,255,255,0.94)", color: "#15212e", border: "none", borderRadius: 3, padding: "0 2px",
                      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 700, fontSize: fs, lineHeight: 1.05,
                      overflow: "hidden", cursor: "pointer", boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}>
                    {showOrig ? it.original : it.translated}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
