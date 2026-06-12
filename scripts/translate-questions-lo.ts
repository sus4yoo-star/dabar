/**
 * 성경퀴즈(한국어 3000여 문제) → 라오스어로 번역해 questions 테이블에 lang='lo' 행으로 고정.
 *
 * 사전 준비:
 *   1) supabase/questions-allow-lo.sql 실행 (lang 제약에 'lo' 허용)
 *   2) .env.local 에 아래 값:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_KEY=...            (service role 키 — 쓰기 권한)
 *        GOOGLE_TRANSLATE_API_KEY=...        (번역 키)
 *
 * 사용법:
 *   npx tsx scripts/translate-questions-lo.ts            → 한국어 문제 전부 번역·삽입(기존 lo 행은 먼저 삭제)
 *   npx tsx scripts/translate-questions-lo.ts --limit 50 → 50개만 (비용/테스트용)
 *
 * 동작:
 *   - question / options(4개) / hint / explanation 만 번역
 *   - book / testament / category / level / answer 는 그대로 (필터·정답 유지)
 *   - 번역 결과는 "검수 1차본" 입니다. Supabase 에서 직접 수정·검수하세요.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const GKEY = process.env.GOOGLE_TRANSLATE_API_KEY!;

const limitArg = (() => {
  const i = process.argv.indexOf("--limit");
  return i >= 0 ? parseInt(process.argv[i + 1] || "0", 10) : 0;
})();

type Row = {
  id: string; book: string; testament: string; category: string; level: string;
  question: string; options: string[]; answer: number; hint: string; explanation: string;
};

async function translateBatch(texts: string[]): Promise<string[]> {
  // 빈 문자열은 번역 생략(자리 유지)
  const idxNonEmpty: number[] = [];
  const payload: string[] = [];
  texts.forEach((t, i) => { if (t && t.trim()) { idxNonEmpty.push(i); payload.push(t); } });
  if (!payload.length) return texts.slice();
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GKEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: payload, source: "ko", target: "lo", format: "text" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("translate-failed: " + JSON.stringify(data?.error?.message ?? data));
  const tr: string[] = data.data.translations.map((t: { translatedText: string }) => t.translatedText);
  const out = texts.slice();
  idxNonEmpty.forEach((origIdx, k) => { out[origIdx] = tr[k]; });
  return out;
}

async function main() {
  console.log("● 한국어 문제 불러오는 중…");
  // 페이지네이션으로 전부 가져오기
  const all: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("questions").select("*").eq("lang", "ko")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || !data.length) break;
    all.push(...(data as Row[]));
    if (data.length < PAGE) break;
  }
  const rows = limitArg ? all.slice(0, limitArg) : all;
  console.log(`● 대상: ${rows.length}개`);

  // 기존 lo 행 삭제 (깨끗한 재실행)
  if (!limitArg) {
    console.log("● 기존 라오스어 행 삭제 중…");
    await supabase.from("questions").delete().eq("lang", "lo");
  }

  let done = 0;
  // 문제 단위로 번역(한 문제당 question+4보기+hint+explanation = 7문자열), 한 번에 ~15문제씩
  const GROUP = 15;
  for (let g = 0; g < rows.length; g += GROUP) {
    const group = rows.slice(g, g + GROUP);
    const strings: string[] = [];
    for (const r of group) strings.push(r.question, ...r.options, r.hint ?? "", r.explanation ?? "");
    let tr: string[];
    try {
      tr = await translateBatch(strings);
    } catch (e) {
      console.error("번역 오류, 30초 후 재시도:", (e as Error).message);
      await new Promise((res) => setTimeout(res, 30000));
      tr = await translateBatch(strings);
    }
    // 다시 문제 단위로 분해 (7개씩)
    const inserts = group.map((r, i) => {
      const base = i * 7;
      return {
        book: r.book, testament: r.testament, category: r.category, level: r.level,
        answer: r.answer, lang: "lo",
        question: tr[base],
        options: [tr[base + 1], tr[base + 2], tr[base + 3], tr[base + 4]],
        hint: tr[base + 5] ?? "",
        explanation: tr[base + 6] ?? "",
      };
    });
    const { error } = await supabase.from("questions").insert(inserts);
    if (error) throw error;
    done += group.length;
    console.log(`  …${done}/${rows.length}`);
    await new Promise((res) => setTimeout(res, 200)); // 가벼운 텀
  }
  console.log(`✅ 완료: 라오스어 ${done}개 삽입. Supabase 에서 검수·수정하세요.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
