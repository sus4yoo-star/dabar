"use client";

// 💛 마음에 닿는 말씀 — 지금 감정/상황(글·사진)을 올리면 위로·치유·용기가 되는 말씀이 나오고,
// 양옆 ‹ › 버튼으로 연관된 이전/다음 말씀을 오간다 (최대 10개).
import { useRef, useState, type CSSProperties } from "react";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

type Verse = { ref: string; text: string; note: string };
const RTL = new Set(["ar", "fa", "ur"]);
const EMO = ["cf.e1", "cf.e2", "cf.e3", "cf.e4", "cf.e5", "cf.e6"];

// 이미지 → 축소 JPEG base64(접두어 제거). 디코드 실패 시 null.
async function toJpegBase64(file: File, max = 1024, q = 0.7): Promise<string | null> {
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return null;
  try {
    let w = 0, h = 0;
    let draw: (ctx: CanvasRenderingContext2D, dw: number, dh: number) => void;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      w = bmp.width; h = bmp.height; draw = (ctx, dw, dh) => ctx.drawImage(bmp, 0, 0, dw, dh);
    } catch {
      const url = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
      URL.revokeObjectURL(url);
      w = img.naturalWidth; h = img.naturalHeight; draw = (ctx, dw, dh) => ctx.drawImage(img, 0, 0, dw, dh);
    }
    if (!w || !h) return null;
    const scale = Math.min(1, max / Math.max(w, h));
    const dw = Math.round(w * scale), dh = Math.round(h * scale);
    const canvas = document.createElement("canvas"); canvas.width = dw; canvas.height = dh;
    const ctx = canvas.getContext("2d"); if (!ctx) return null;
    draw(ctx, dw, dh);
    return canvas.toDataURL("image/jpeg", q).split(",")[1] || null;
  } catch { return null; }
}

export default function HomeComfort() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]); // base64 jpeg (접두어 없음)
  const [verses, setVerses] = useState<Verse[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dir = RTL.has(lang) ? "rtl" : "ltr";

  async function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = Math.max(0, 4 - images.length);
    const out: string[] = [];
    for (const f of files.slice(0, room)) { const b = await toJpegBase64(f); if (b) out.push(b); }
    if (out.length) setImages((prev) => [...prev, ...out].slice(0, 4));
  }

  async function ask(feeling: string) {
    const f = feeling.trim();
    if ((!f && images.length === 0) || loading) return;
    setLoading(true); setErr(""); setVerses([]);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 40000);
    try {
      const r = await fetch("/api/comfort", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feeling: f, lang, images }), signal: ctrl.signal });
      const d = await r.json();
      if (!r.ok || !d.verses?.length) setErr(d.error === "no-key" ? t("cf.errKey") : t("cf.err"));
      else { setVerses(d.verses as Verse[]); setIdx(0); }
    } catch { setErr(t("cf.err")); }
    finally { clearTimeout(to); setLoading(false); }
  }
  function reset() { setVerses([]); setIdx(0); setInput(""); setImages([]); setErr(""); }

  const card: CSSProperties = { marginTop: 12, padding: "13px 14px", borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card };
  const arrow = (side: "start" | "end"): CSSProperties => ({
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 2,
    [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: -2,
    width: 30, height: 30, borderRadius: 999, display: "grid", placeItems: "center",
    background: "#fff", border: `1px solid ${theme.goldBorder}`, color: theme.gold,
    fontSize: 19, lineHeight: 1, fontWeight: 800, cursor: "pointer", boxShadow: "0 3px 10px rgba(23,50,73,0.14)",
  });

  // 결과 보기 — 양옆 이전/다음
  if (verses.length > 0) {
    const v = verses[idx];
    const atFirst = idx === 0;
    const atLast = idx >= verses.length - 1;
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{t("cf.title")}</span>
          <button onClick={reset} style={{ fontSize: 11.5, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer" }}>{t("cf.again")}</button>
        </div>

        <div style={{ position: "relative" }}>
          {!atFirst && <button onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label={t("cf.prev")} style={arrow("start")}>{dir === "rtl" ? "›" : "‹"}</button>}
          <div style={{ background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 14, padding: "15px 36px", minHeight: 92 }}>
            <p key={idx} dir={dir} className="fade-in" style={{ margin: 0, fontSize: 17, lineHeight: 1.7, fontWeight: 600, color: theme.text, textAlign: dir === "rtl" ? "right" : "left" }}>“{v.text}”</p>
            {v.ref && <p dir={dir} style={{ margin: "8px 0 0", fontSize: 12.5, fontWeight: 800, color: theme.gold, textAlign: dir === "rtl" ? "right" : "left" }}>— {v.ref}</p>}
            {v.note && <p dir={dir} style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.6, color: theme.textMuted, textAlign: dir === "rtl" ? "right" : "left" }}>{v.note}</p>}
          </div>
          {!atLast && <button onClick={() => setIdx((i) => Math.min(verses.length - 1, i + 1))} aria-label={t("cf.next")} style={arrow("end")}>{dir === "rtl" ? "‹" : "›"}</button>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 9 }}>
          <span style={{ display: "flex", gap: 4 }}>
            {verses.map((_, i) => <span key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 999, background: i === idx ? theme.gold : "rgba(13,52,84,0.18)", transition: "width .2s" }} />)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.textFaint }}>{idx + 1} / {verses.length}</span>
        </div>
      </div>
    );
  }

  // 입력 보기
  return (
    <div style={card}>
      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: theme.text }}>{t("cf.title")}</p>
      <p style={{ margin: "3px 0 9px", fontSize: 12, color: theme.textMuted }}>{t("cf.sub")}</p>

      {/* 감정 칩 — 한 줄(가로 스크롤) */}
      <div style={{ display: "flex", flexWrap: "nowrap", gap: 6, marginBottom: 9, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
        {EMO.map((k) => (
          <button key={k} onClick={() => { setInput(t(k)); ask(t(k)); }} disabled={loading}
            style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{t(k)}</button>
        ))}
      </div>

      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} placeholder={t("cf.placeholder")}
        style={{ width: "100%", boxSizing: "border-box", resize: "none", fontSize: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none", lineHeight: 1.5 }} />

      {/* 사진 첨부 (복수) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button onClick={() => fileRef.current?.click()} disabled={loading || images.length >= 4}
          style={{ fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", cursor: images.length >= 4 ? "default" : "pointer", opacity: images.length >= 4 ? 0.5 : 1 }}>{t("cf.addImage")}</button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPickImages} style={{ display: "none" }} />
        {images.map((b, i) => (
          <span key={i} style={{ position: "relative", width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
            <img src={`data:image/jpeg;base64,${b}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} aria-label="remove"
              style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, lineHeight: "16px", cursor: "pointer", padding: 0 }}>×</button>
          </span>
        ))}
      </div>

      <button onClick={() => ask(input)} disabled={loading || (!input.trim() && images.length === 0)}
        style={{ width: "100%", marginTop: 9, padding: 12, fontSize: 14.5, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 12, cursor: loading || (!input.trim() && images.length === 0) ? "default" : "pointer", opacity: loading || (!input.trim() && images.length === 0) ? 0.55 : 1 }}>
        {loading ? t("cf.loading") : t("cf.submit")}
      </button>
      {err && <p style={{ margin: "8px 0 0", fontSize: 12, color: theme.wrong, textAlign: "center" }}>{err}</p>}
    </div>
  );
}
