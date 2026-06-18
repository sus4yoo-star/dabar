"use client";
import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { getCourse } from "@/lib/courses";
import { getCompleted } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useAutoCourse } from "@/lib/autoTranslate";
import { supabase } from "@/lib/supabase";
import { PageHeader, AccentCard, ACCENT, softCard } from "@/lib/ui";

const STATIC_LANGS = ["ko", "en", "th"];

export default function CoursePage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const isAuto = !!lang && !STATIC_LANGS.includes(lang);
  const { course, auto, loading } = useAutoCourse(getCourse(params.slug, isAuto ? "ko" : lang), lang);
  const [done, setDone] = useState<Record<string, boolean>>({});

  // 로컬(기기) 진도 + 서버(계정) 진도를 합쳐서 표시 → 다른 기기에서도 이어보기
  useEffect(() => {
    setDone(getCompleted());
    if (!user) return;
    supabase.from("lesson_progress").select("course, lesson").eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        setDone(prev => {
          const merged = { ...prev };
          data.forEach((r: any) => { merged[`${r.course}/${r.lesson}`] = true; });
          return merged;
        });
      });
  }, [user, params.slug]);

  if (!course) {
    return <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center", color: theme.textMuted }}>
      {t("co.notFound")} <button onClick={() => router.push("/")} style={{ color: theme.gold, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{t("r.home")}</button>
    </main>;
  }

  const total = course.lessons.length;
  const completed = course.lessons.filter(l => done[`${course.slug}/${l.id}`]).length;
  const allDone = completed === total;

  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "0.7rem 1.25rem 1.4rem", minHeight: "100dvh" }}>
      <PageHeader
        title={t("co.courseTitle", { t: course.title })}
        subtitle={course.subtitle}
        onHome={() => router.push("/")}
        homeLabel={t("common.home")}
        accentColor={ACCENT.green.fg}
        right={<span style={{ fontSize: 12.5, fontWeight: 800, color: ACCENT.green.fg, background: ACCENT.green.chip, border: `1px solid ${ACCENT.green.border}`, borderRadius: 999, padding: "6px 12px", whiteSpace: "nowrap" }}>{t("co.done", { a: completed, b: total })}</span>}
      />

      {auto && (
        <p style={{ textAlign: "center", fontSize: 11.5, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: "6px 10px", display: "block", margin: "0 auto 10px", maxWidth: "fit-content" }}>
          {loading ? t("c.autoTransing") : t("c.autoTrans")}
        </p>
      )}

      {/* 진도바 */}
      <div style={{ height: 8, background: "var(--t-border)", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${total ? (completed / total) * 100 : 0}%`, background: ACCENT.green.fg, transition: "width .4s ease", borderRadius: 4 }} />
      </div>

      {allDone && (
        <div className="fade-in" style={{ ...softCard({ background: theme.correctBg, border: `1px solid ${theme.correct}` }), padding: "14px", textAlign: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: theme.correct, margin: "0 0 2px" }}>{t("co.allDone", { t: course.title })}</p>
          <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>{t("co.allDoneSub")}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {course.lessons.map((l, i) => {
          const isDoneL = !!done[`${course.slug}/${l.id}`];
          const showSection = l.section && l.section !== course.lessons[i - 1]?.section;
          const prefix = l.label ?? `${l.id}과`;
          const accent = ACCENT.green;
          return (
            <Fragment key={l.id}>
              {showSection && <p style={{ fontSize: 12.5, fontWeight: 800, color: ACCENT.green.fg, letterSpacing: 0.3, margin: "12px 2px 0" }}>{l.section}</p>}
              <AccentCard
                accent={accent}
                onClick={() => router.push(`/course/${course.slug}/${l.id}`)}
                icon={isDoneL ? "✅" : <span style={{ color: ACCENT.green.fg, fontWeight: 800, fontSize: 19 }}>{l.id}</span>}
                title={`${prefix}. ${l.title}`}
                sub={isDoneL ? t("co.done2") : t("co.learnQuiz")}
              />
            </Fragment>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "1.25rem", lineHeight: 1.6 }}>
        {t("co.disclaimer")}
      </p>
    </main>
  );
}
