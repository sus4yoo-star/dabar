"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import MenuIcon from "@/components/MenuIcon";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PageHeader, ACCENT, softShadow, softCard } from "@/lib/ui";
import { ALL_BOOKS } from "@/lib/bible";
import { fetchQuizProgress } from "@/lib/quizProgress";
import { bookLabel } from "@/lib/bookNames";

type Stat = { a: number; o: number; t: number };

async function fetchAllQuestions(lang: string): Promise<{ id: string; book: string }[]> {
  const load = async (useLang: string) => {
    const rows: { id: string; book: string }[] = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await supabase.from("questions").select("id, book").eq("lang", useLang).range(from, from + 999);
      if (error || !data?.length) break;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    return rows;
  };
  let rows = await load(lang);
  if (!rows.length && lang !== "ko") rows = await load("ko"); // 해당 언어 문제가 없으면 한국어 기준
  return rows;
}

export default function ProgressPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [byBook, setByBook] = useState<{ book: string; s: Stat }[]>([]);
  const [overall, setOverall] = useState<Stat>({ a: 0, o: 0, t: 0 });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const [qs, prog] = await Promise.all([fetchAllQuestions(lang), fetchQuizProgress(user.id)]);
      const map = new Map<string, Stat>();
      qs.forEach(q => {
        const s = map.get(q.book) ?? { a: 0, o: 0, t: 0 };
        s.t++;
        const r = prog[q.id];
        if (r) { s.a++; if (r === "o") s.o++; }
        map.set(q.book, s);
      });
      const ordered = ALL_BOOKS.filter(b => map.has(b)).map(b => ({ book: b, s: map.get(b)! }));
      // ALL_BOOKS 에 없는 권(혹시 모를 표기 차이)도 뒤에 추가
      map.forEach((s, b) => { if (!ALL_BOOKS.includes(b)) ordered.push({ book: b, s }); });
      setByBook(ordered);
      setOverall(ordered.reduce((acc, x) => ({ a: acc.a + x.s.a, o: acc.o + x.s.o, t: acc.t + x.s.t }), { a: 0, o: 0, t: 0 }));
      setLoading(false);
    })();
  }, [user, lang]);

  const pct = overall.t ? Math.round((overall.a / overall.t) * 100) : 0;

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 1.1rem 2rem", minHeight: "100dvh" }}>
      <PageHeader title={t("prog.title")} homeLabel={t("common.home")} onHome={() => router.push("/")} accentColor={ACCENT.blue.fg} />

      {!user ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem" }}>{t("prog.login")}</p>
      ) : loading ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem" }}>{t("c.loading")}</p>
      ) : overall.a === 0 ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem", lineHeight: 1.6 }}>{t("prog.empty")}</p>
      ) : (
        <>
          <div className="fade-in" style={{ background: ACCENT.blue.bg, border: `1px solid ${ACCENT.blue.border}`, borderRadius: 18, padding: "16px 17px", marginBottom: "1.1rem", boxShadow: softShadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 11 }}>
              <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, background: ACCENT.blue.chip, display: "grid", placeItems: "center" }}><MenuIcon name="chart" color={ACCENT.blue.fg} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: ACCENT.blue.fg }}>{t("prog.overall", { a: overall.a, t: overall.t, p: pct })}</span>
              </span>
              <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 800, color: theme.correct }}>✓ {overall.o}</span>
            </div>
            <div style={{ height: 10, background: "var(--t-border)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.primary})`, borderRadius: 5, transition: "width .4s" }} />
            </div>
          </div>

          <p style={{ fontSize: 12.5, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "0 0 9px 2px" }}>{t("q.bookProg")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {byBook.map(({ book, s }) => {
              const p = s.t ? Math.round((s.a / s.t) * 100) : 0;
              const done = p === 100;
              return (
                <div key={book} style={softCard({ padding: "12px 14px", border: `1px solid ${done ? theme.goldBorder : theme.cardBorder}` })}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 7 }}>
                    <span style={{ fontWeight: 700, color: theme.text }}>{bookLabel(book, lang)}</span>
                    <span style={{ color: done ? theme.correct : theme.textMuted, fontWeight: 800 }}>{s.a}/{s.t}{done ? " ✓" : ""}</span>
                  </div>
                  <div style={{ height: 7, background: "var(--t-border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: done ? theme.correct : `linear-gradient(90deg,${theme.primarySoft},${theme.primary})`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
