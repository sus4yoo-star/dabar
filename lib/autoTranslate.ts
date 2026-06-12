"use client";
import { useEffect, useMemo, useState } from "react";
import type { Course } from "@/lib/courses";

// 정적 번역이 갖춰진 언어 (런타임 자동번역 불필요)
const STATIC_LANGS = ["ko", "en", "th"];

async function translateChunk(q: string[], target: string): Promise<string[]> {
  const r = await fetch("/api/translate-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: "ko", target }),
  });
  if (!r.ok) throw new Error("translate-failed");
  const d = await r.json();
  return (d.translations as string[]) ?? [];
}

// 훅이 아닌 일반 함수: 문자열들을 대상 언어로 번역해 {원문: 번역} 맵 반환 (+캐시).
// 정적 언어(ko/en/th)는 빈 맵.
export async function translateMany(texts: string[], lang: string, ns: string): Promise<Record<string, string>> {
  if (!lang || STATIC_LANGS.includes(lang)) return {};
  const cacheKey = `dabar_at_${ns}_${lang}`;
  let cache: Record<string, string> = {};
  try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch { /* ignore */ }
  const need = Array.from(new Set(texts.filter((t) => t && !(t in cache))));
  for (let i = 0; i < need.length; i += 50) {
    const slice = need.slice(i, i + 50);
    try {
      const tr = await translateChunk(slice, lang);
      slice.forEach((t, j) => { if (tr[j]) cache[t] = tr[j]; });
    } catch { break; }
  }
  try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch { /* ignore */ }
  return cache;
}

// 한국어 원문 배열을 대상 언어로 자동번역 (Google 번역) + localStorage 캐시.
// 정적 번역 언어(ko/en/th)는 원문을 그대로 반환.
export function useAutoTranslate(items: string[], lang: string, ns: string) {
  const auto = !!lang && !STATIC_LANGS.includes(lang);
  const [out, setOut] = useState<string[]>(items);
  const [loading, setLoading] = useState(false);
  const sig = items.join("");

  useEffect(() => {
    if (!auto) { setOut(items); return; }
    const cacheKey = `dabar_at_${ns}_${lang}`;
    let cache: Record<string, string> = {};
    try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch { /* ignore */ }

    const need = Array.from(new Set(items.filter((t) => t && !(t in cache))));
    if (!need.length) { setOut(items.map((t) => cache[t] ?? t)); return; }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        // Google Translate 세그먼트 제한 대응: 50개씩 나눠 요청
        for (let i = 0; i < need.length; i += 50) {
          const slice = need.slice(i, i + 50);
          const tr = await translateChunk(slice, lang);
          slice.forEach((t, j) => { if (tr[j]) cache[t] = tr[j]; });
          if (cancelled) return;
          setOut(items.map((t) => cache[t] ?? t)); // 점진적 반영
        }
        try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch { /* ignore */ }
      } catch {
        if (!cancelled) setOut(items); // 실패 시 원문(한국어) 유지
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, ns, sig, auto]);

  return { out, auto, loading };
}

// 교재(Course) 전체의 문자열 필드를 모아 자동번역 후 번역된 Course 를 돌려준다.
function collectCourse(c: Course): string[] {
  const arr: string[] = [c.title, c.subtitle];
  c.lessons.forEach((l) => {
    arr.push(l.title);
    if (l.section) arr.push(l.section);
    if (l.label) arr.push(l.label);
    if (l.verse) arr.push(l.verse);
    if (l.verseRef) arr.push(l.verseRef);
    l.teaching.forEach((p) => arr.push(p));
    l.questions.forEach((q) => {
      arr.push(q.question);
      q.options.forEach((o) => arr.push(o));
      if (q.explanation) arr.push(q.explanation);
    });
  });
  return arr.filter(Boolean);
}

export function useAutoCourse(course: Course | undefined, lang: string) {
  const strings = useMemo(() => (course ? collectCourse(course) : []), [course]);
  const { out, auto, loading } = useAutoTranslate(strings, lang, `course_${course?.slug ?? "x"}`);

  const translated = useMemo(() => {
    if (!course || !auto) return course;
    const map: Record<string, string> = {};
    strings.forEach((s, i) => { if (s && out[i]) map[s] = out[i]; });
    const tr = (s: string | undefined) => (s && map[s] ? map[s] : s) as string;
    return {
      ...course,
      title: tr(course.title),
      subtitle: tr(course.subtitle),
      lessons: course.lessons.map((l) => ({
        ...l,
        title: tr(l.title),
        section: l.section ? tr(l.section) : l.section,
        label: l.label ? tr(l.label) : l.label,
        verse: tr(l.verse),
        verseRef: tr(l.verseRef),
        teaching: l.teaching.map((p) => tr(p)),
        questions: l.questions.map((q) => ({
          ...q,
          question: tr(q.question),
          options: q.options.map((o) => tr(o)),
          explanation: tr(q.explanation),
        })),
      })),
    } as Course;
  }, [course, auto, out, strings]);

  return { course: translated, auto, loading };
}
