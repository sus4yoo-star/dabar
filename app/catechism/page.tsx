"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import MenuIcon from "@/components/MenuIcon";
import { useI18n } from "@/lib/i18n";
import { getCatechism } from "@/lib/catechism";
import { useAutoTranslate } from "@/lib/autoTranslate";
import { PageHeader, PillButton, ACCENT, softCard } from "@/lib/ui";

const MEM_KEY = "dabar_catechism_memorized";
const CATS = ["전체", "하나님", "구원", "십계명", "기도"] as const;
const CAT_KEY: Record<string, string> = { "전체": "cat.all", "하나님": "cat.god", "구원": "cat.salv", "십계명": "cat.law", "기도": "cat.prayer" };

// 문 번호로 분류 (웨스트민스터 구조 기준)
function catOf(n: number): string {
  if (n <= 20) return "하나님";       // 성경·하나님·창조·섭리·죄
  if (n <= 38) return "구원";         // 그리스도·구속·칭의·성화
  if (n <= 84) return "십계명";       // 본분·율법·십계명·죄
  if (n <= 97) return "구원";         // 믿음·회개·말씀·성례(은혜의 방편)
  return "기도";                       // 기도·주기도문
}

export default function CatechismPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [memorize, setMemorize] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [memorized, setMemorized] = useState<Set<number>>(new Set());
  const [cat, setCat] = useState<string>("전체");

  useEffect(() => {
    try { const a = JSON.parse(localStorage.getItem(MEM_KEY) || "[]"); setMemorized(new Set(a)); } catch { /* ignore */ }
  }, []);

  function toggleReveal(n: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  }
  function toggleMemorized(n: number) {
    setMemorized(prev => {
      const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n);
      try { localStorage.setItem(MEM_KEY, JSON.stringify([...s])); } catch { /* ignore */ }
      return s;
    });
  }

  // ko/en/th는 정적 번역, 그 외(예: 라오스어)는 한국어 원문을 런타임 자동번역
  const STATIC = ["ko", "en", "th"];
  const isAuto = !!lang && !STATIC.includes(lang);
  const base = getCatechism(isAuto ? "ko" : lang);
  const { out: tq, auto, loading: lq } = useAutoTranslate(base.map(c => c.q), lang, "cat_q");
  const { out: ta, loading: la } = useAutoTranslate(base.map(c => c.a), lang, "cat_a");
  const merged = base.map((c, i) => (auto ? { ...c, q: tq[i] ?? c.q, a: ta[i] ?? c.a } : c));
  const list = merged.filter(c => cat === "전체" || catOf(c.n) === cat);
  const memCount = memorized.size;

  return (
    <main className="fade-in" style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <PageHeader
        title={t("cat.title")}
        onHome={() => router.push("/")}
        homeLabel={t("common.home")}
        right={<PillButton tone="gold" onClick={() => router.push("/catechism/quiz")}>{t("cat.quizBtn")}</PillButton>}
      />

      <div className="fade-in" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <div style={{ width: 56, height: 56, margin: "0 auto 8px", borderRadius: 16, background: ACCENT.green.chip, display: "grid", placeItems: "center" }}><MenuIcon name="clipboard" color={ACCENT.green.fg} size={26} /></div>
        <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>{t("cat.sub")}</p>
        {auto && (
          <p style={{ marginTop: 8, fontSize: 11.5, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "6px 10px", display: "inline-block" }}>
            {lq || la ? t("c.autoTransing") : t("c.autoTrans")}
          </p>
        )}
      </div>

      {/* 외우기 진도 */}
      <div style={{ ...softCard({ background: ACCENT.green.bg }), padding: "13px 16px", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{t("cat.memProg")}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: theme.gold }}>{memCount} / 107</span>
        </div>
        <div style={{ height: 8, background: "rgba(13,52,84,0.12)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(memCount / 107) * 100}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, transition: "width .4s", borderRadius: 4 }} />
        </div>
      </div>

      {/* 분류 */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
        {CATS.map(c => {
          const on = cat === c;
          return <button key={c} onClick={() => setCat(c)} style={{ padding: "9px 15px", borderRadius: 999, fontSize: 13.5, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{t(CAT_KEY[c])}</button>;
        })}
      </div>

      {/* 모드 */}
      <div style={{ display: "flex", gap: 7, marginBottom: "1.1rem" }}>
        {([[false, "cat.readMode"], [true, "cat.memMode"]] as const).map(([val, lk]) => {
          const on = memorize === val;
          return <button key={lk} onClick={() => { setMemorize(val); setRevealed(new Set()); }} style={{ flex: 1, padding: "12px", borderRadius: 14, fontSize: 14.5, fontWeight: on ? 800 : 600, cursor: "pointer", border: `1px solid ${on ? "transparent" : theme.cardBorder}`, background: on ? theme.primary : theme.card, color: on ? "#fff" : theme.text }}>{t(lk)}</button>;
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map(c => {
          const show = !memorize || revealed.has(c.n);
          const mem = memorized.has(c.n);
          return (
            <div key={c.n} className="fade-in-2" style={{ ...softCard(mem ? { background: theme.correctBg, border: `1px solid ${theme.correct}` } : { background: ACCENT.blue.bg }), padding: "15px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: theme.gold }}>{t("cat.qno", { n: c.n })} · {t(CAT_KEY[catOf(c.n)])}</span>
                <button onClick={() => toggleMemorized(c.n)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: mem ? theme.correct : theme.textMuted, background: mem ? theme.correctBg : theme.card, border: `1px solid ${mem ? theme.correct : theme.cardBorder}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" }}>{mem ? t("cat.memOn") : t("cat.memOff")}</button>
              </div>
              <p onClick={() => memorize && toggleReveal(c.n)} style={{ fontSize: 15.5, fontWeight: 700, color: theme.text, margin: "0 0 8px", lineHeight: 1.6, cursor: memorize ? "pointer" : "default" }}>{c.q}</p>
              {show ? (
                <p style={{ fontSize: 14.5, color: theme.textMuted, margin: 0, lineHeight: 1.7 }}>{c.a}</p>
              ) : (
                <p onClick={() => toggleReveal(c.n)} style={{ fontSize: 13.5, color: theme.primarySoft, margin: 0, fontWeight: 700, cursor: "pointer" }}>{t("cat.tapAns")}</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
