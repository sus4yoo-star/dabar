"use client";

// 📖 오프라인 표현집 — 카테고리별 필수 문장을 상대 언어로 보여주고 읽어준다.
// ko/en/th/lo 는 내장(에어플레인 모드 OK). 그 외 언어는 온라인 번역+캐시로 채운다.
import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { speak } from "@/lib/besora/speak";
import { PHRASEBOOK } from "@/lib/besora/phrasebook";

const BAKED = new Set(["ko", "en", "th", "lo"]);
const TRC = "dabar_phrase_trc"; // 온라인 번역 캐시 (오프라인 폴백)
function trGet(lang: string, q: string): string {
  try { const m = JSON.parse(localStorage.getItem(TRC) || "{}"); return m[`${lang}|${q}`] || ""; } catch { return ""; }
}
function trPut(lang: string, q: string, v: string) {
  try {
    const m = JSON.parse(localStorage.getItem(TRC) || "{}");
    m[`${lang}|${q}`] = v;
    const keys = Object.keys(m);
    if (keys.length > 300) delete m[keys[0]]; // 무한 증가 방지
    localStorage.setItem(TRC, JSON.stringify(m));
  } catch { /* */ }
}

export default function Phrasebook({ big = false }: { big?: boolean } = {}) {
  const { myLang, seekerLang, languages, rtlFor } = useLang();
  const seeker = seekerLang || "en";
  const [cat, setCat] = useState(PHRASEBOOK[0].id);
  const [dyn, setDyn] = useState<Record<string, string>>({}); // phraseId -> 온라인 번역된 상대어
  const nameOf = (c: string) => languages.find((l) => l.code === c)?.name_native ?? c;

  const cur = PHRASEBOOK.find((c) => c.id === cat) ?? PHRASEBOOK[0];
  const myText = (p: { t: Record<string, string> }) => p.t[myLang] || p.t.en || p.t.ko;
  const seekerText = (p: { id: string; t: Record<string, string> }) => p.t[seeker] || dyn[p.id] || p.t.en;

  // 상대 언어가 내장(ko/en/th/lo)이 아니면 온라인 번역으로 채움 (캐시 우선, 오프라인이면 영어 폴백)
  useEffect(() => {
    if (seeker === myLang || BAKED.has(seeker)) return;
    const need = cur.phrases.filter((p) => !p.t[seeker]);
    if (!need.length) return;
    const cached: Record<string, string> = {};
    const toFetch: { id: string; en: string }[] = [];
    need.forEach((p) => { const c = trGet(seeker, p.t.en); if (c) cached[p.id] = c; else toFetch.push({ id: p.id, en: p.t.en }); });
    if (Object.keys(cached).length) setDyn((d) => ({ ...d, ...cached }));
    if (!toFetch.length || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/translate-batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: toFetch.map((t) => t.en), source: "en", target: seeker }) });
        const d = await r.json();
        const tr = d.translations as string[] | undefined;
        if (tr && !cancelled) {
          const upd: Record<string, string> = {};
          toFetch.forEach((t, i) => { if (tr[i]) { upd[t.id] = tr[i]; trPut(seeker, t.en, tr[i]); } });
          setDyn((prev) => ({ ...prev, ...upd }));
        }
      } catch { /* 오프라인 — 영어 폴백 유지 */ }
    })();
    return () => { cancelled = true; };
    // cur 은 cat 에서 파생되므로 deps 에 cat 만 두어 불필요한 재실행/루프 위험을 없앤다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, seeker, myLang]);

  const twoWay = seeker !== myLang;

  return (
    <div>
      {/* 카테고리 탭 — 가로 스크롤 알약형 (한 줄, 글자 안 깨지게) */}
      <div style={{ display: "flex", gap: 7, marginBottom: 9, overflowX: "auto", paddingBottom: 3, WebkitOverflowScrolling: "touch" }}>
        {PHRASEBOOK.map((c) => {
          const on = c.id === cat;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${on ? theme.gold : theme.cardBorder}`, background: on ? theme.gold : theme.card, color: on ? "#fff" : theme.textMuted, fontSize: 13.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
              {c.icon} {c.title[myLang] || c.title.en}
            </button>
          );
        })}
      </div>

      <p style={{ margin: "0 0 9px 2px", fontSize: 11.5, color: theme.textFaint }}>{ui(myLang, "phraseHint")}</p>

      {/* 문장 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cur.phrases.map((p) => {
          const st = seekerText(p);
          return (
            <button key={p.id} onClick={() => twoWay && speak(st, seeker)}
              style={{ textAlign: "left", width: "100%", padding: "11px 13px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: "#fff", cursor: twoWay ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {twoWay && (
                  <p dir={rtlFor(seeker) ? "rtl" : "ltr"} style={{ margin: "0 0 3px", fontSize: big ? 18 : 16.5, fontWeight: 800, color: theme.text, lineHeight: 1.45 }}>{st}</p>
                )}
                <p style={{ margin: 0, fontSize: big ? 14 : 13, fontWeight: 600, color: theme.textMuted, lineHeight: 1.4 }}>{myText(p)}</p>
              </div>
              {twoWay && (
                <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, background: theme.goldLight, color: theme.gold, display: "grid", placeItems: "center", fontSize: 19 }}>▶</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
