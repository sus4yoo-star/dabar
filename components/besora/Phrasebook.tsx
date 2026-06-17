"use client";

// 📖 오프라인 표현집 — 카테고리별 필수 문장을 상대 언어로 보여주고 읽어준다.
// ko/en/th/lo 는 내장(에어플레인 모드 OK). 그 외 언어는 온라인 번역+캐시로 채운다.
// 검색(전 카테고리 한/영 필터) + 즐겨찾기(⭐, localStorage) 지원.
import { useEffect, useMemo, useState } from "react";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { speak } from "@/lib/besora/speak";
import { PHRASEBOOK } from "@/lib/besora/phrasebook";

const BAKED = new Set(["ko", "en", "th", "lo"]);
const TRC = "dabar_phrase_trc"; // 온라인 번역 캐시 (오프라인 폴백)
const FAV_KEY = "dabar_phrase_favs";
const FAV_CAT = "__fav";
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
function loadFavs(): string[] { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; } }

type Phrase = { id: string; t: Record<string, string> };

export default function Phrasebook({ big = false }: { big?: boolean } = {}) {
  const { myLang, seekerLang, languages, rtlFor } = useLang();
  const seeker = seekerLang || "en";
  const [cat, setCat] = useState(PHRASEBOOK[0].id);
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>([]);
  const [dyn, setDyn] = useState<Record<string, string>>({}); // phraseId -> 온라인 번역된 상대어
  void languages;

  useEffect(() => { setFavs(loadFavs()); }, []);
  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }

  const cur = PHRASEBOOK.find((c) => c.id === cat) ?? PHRASEBOOK[0];
  const myText = (p: Phrase) => p.t[myLang] || p.t.en || p.t.ko;
  const seekerText = (p: Phrase) => p.t[seeker] || dyn[p.id] || p.t.en;
  const allPhrases = useMemo(() => PHRASEBOOK.flatMap((c) => c.phrases), []);

  // 화면에 보여줄 문장 목록: 검색어 > 즐겨찾기 > 현재 카테고리
  const list: Phrase[] = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (qq) return allPhrases.filter((p) =>
      (p.t[myLang] || "").toLowerCase().includes(qq) ||
      (p.t.ko || "").toLowerCase().includes(qq) ||
      (p.t.en || "").toLowerCase().includes(qq));
    if (cat === FAV_CAT) return allPhrases.filter((p) => favs.includes(p.id));
    return cur.phrases;
  }, [q, cat, favs, myLang, cur, allPhrases]);

  // 상대 언어가 내장(ko/en/th/lo)이 아니면 온라인 번역으로 채움 (캐시 우선, 오프라인이면 영어 폴백)
  useEffect(() => {
    if (seeker === myLang || BAKED.has(seeker)) return;
    const need = list.filter((p) => !p.t[seeker]);
    if (!need.length) return;
    const cached: Record<string, string> = {};
    const toFetch: { id: string; en: string }[] = [];
    need.forEach((p) => { const c = trGet(seeker, p.t.en); if (c) cached[p.id] = c; else toFetch.push({ id: p.id, en: p.t.en }); });
    if (Object.keys(cached).length) setDyn((d) => ({ ...d, ...cached }));
    if (!toFetch.length || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const batch = toFetch.slice(0, 50); // 한 번에 과도한 요청 방지
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/translate-batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: batch.map((t) => t.en), source: "en", target: seeker }) });
        const d = await r.json();
        const tr = d.translations as string[] | undefined;
        if (tr && !cancelled) {
          const upd: Record<string, string> = {};
          batch.forEach((t, i) => { if (tr[i]) { upd[t.id] = tr[i]; trPut(seeker, t.en, tr[i]); } });
          setDyn((prev) => ({ ...prev, ...upd }));
        }
      } catch { /* 오프라인 — 영어 폴백 유지 */ }
    })();
    return () => { cancelled = true; };
  }, [list, seeker, myLang]);

  const twoWay = seeker !== myLang;
  const searching = q.trim().length > 0;

  return (
    <div>
      {/* 검색 */}
      <div style={{ position: "relative", marginBottom: 9 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`🔍 ${ui(myLang, "search")}`}
          style={{ width: "100%", boxSizing: "border-box", fontSize: 15, padding: "11px 36px 11px 13px", borderRadius: 12, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, outline: "none" }}
        />
        {searching && (
          <button onClick={() => setQ("")} aria-label="clear" style={{ position: "absolute", insetInlineEnd: 6, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: 999, border: "none", background: theme.card, color: theme.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>
        )}
      </div>

      {/* 카테고리 탭 — 검색 중이 아닐 때만. ⭐ 즐겨찾기 탭 + 가로 스크롤 알약형 */}
      {!searching && (
        <div style={{ display: "flex", gap: 7, marginBottom: 9, overflowX: "auto", paddingBottom: 3, WebkitOverflowScrolling: "touch" }}>
          {[{ id: FAV_CAT, icon: "⭐", title: { [myLang]: ui(myLang, "favorites") } as Record<string, string> }, ...PHRASEBOOK].map((c) => {
            const on = c.id === cat;
            return (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: `1px solid ${on ? theme.gold : theme.cardBorder}`, background: on ? theme.gold : theme.card, color: on ? "#fff" : theme.textMuted, fontSize: 13.5, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                {c.icon} {c.title[myLang] || c.title.en}
              </button>
            );
          })}
        </div>
      )}

      {!searching && cat !== FAV_CAT && (
        <p style={{ margin: "0 0 9px 2px", fontSize: 11.5, color: theme.textFaint }}>{ui(myLang, "phraseHint")}</p>
      )}

      {/* 빈 상태 */}
      {list.length === 0 && (
        <p style={{ textAlign: "center", color: theme.textFaint, fontSize: 13.5, lineHeight: 1.6, padding: "28px 12px" }}>
          {searching ? ui(myLang, "noResults") : ui(myLang, "noFavorites")}
        </p>
      )}

      {/* 문장 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((p) => {
          const st = seekerText(p);
          const fav = favs.includes(p.id);
          return (
            <div key={p.id} role="button" tabIndex={0}
              onClick={() => twoWay && speak(st, seeker)}
              onKeyDown={(e) => { if (twoWay && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); speak(st, seeker); } }}
              style={{ textAlign: "left", width: "100%", padding: "11px 13px", borderRadius: 13, border: `1px solid ${theme.cardBorder}`, background: theme.card, cursor: twoWay ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
                aria-label="favorite" aria-pressed={fav}
                style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, lineHeight: 1, color: fav ? theme.gold : theme.textFaint, filter: fav ? "none" : "grayscale(1)", opacity: fav ? 1 : 0.5 }}>★</button>
              <div style={{ flex: 1, minWidth: 0 }}>
                {twoWay && (
                  <p dir={rtlFor(seeker) ? "rtl" : "ltr"} style={{ margin: "0 0 3px", fontSize: big ? 18 : 16.5, fontWeight: 800, color: theme.text, lineHeight: 1.45 }}>{st}</p>
                )}
                <p style={{ margin: 0, fontSize: big ? 14 : 13, fontWeight: 600, color: theme.textMuted, lineHeight: 1.4 }}>{myText(p)}</p>
              </div>
              {twoWay && (
                <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, background: theme.goldLight, color: theme.gold, display: "grid", placeItems: "center", fontSize: 19 }}>▶</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
