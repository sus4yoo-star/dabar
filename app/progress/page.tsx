"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>{t("common.home")}</button>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: theme.gold, margin: 0 }}>{t("prog.title")}</h1>
        <span style={{ width: 56 }} />
      </div>

      {!user ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem" }}>{t("prog.login")}</p>
      ) : loading ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem" }}>{t("c.loading")}</p>
      ) : overall.a === 0 ? (
        <p style={{ textAlign: "center", color: theme.textMuted, marginTop: "3rem", lineHeight: 1.6 }}>{t("prog.empty")}</p>
      ) : (
        <>
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{t("prog.overall", { a: overall.a, t: overall.t, p: pct })}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: theme.correct }}>✓ {overall.o}</span>
            </div>
            <div style={{ height: 9, background: "rgba(13,52,84,0.12)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${theme.primarySoft}, ${theme.gold})`, borderRadius: 5, transition: "width .4s" }} />
            </div>
          </div>

          <p style={{ fontSize: 12, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "0 0 8px 2px" }}>{t("q.bookProg")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {byBook.map(({ book, s }) => {
              const p = s.t ? Math.round((s.a / s.t) * 100) : 0;
              return (
                <div key={book} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: "10px 13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, color: theme.text }}>{bookLabel(book, lang)}</span>
                    <span style={{ color: p === 100 ? theme.correct : theme.textMuted, fontWeight: 700 }}>{s.a}/{s.t}{p === 100 ? " ✓" : ""}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(13,52,84,0.12)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: p === 100 ? theme.correct : `linear-gradient(90deg,${theme.primarySoft},${theme.gold})`, borderRadius: 3 }} />
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
