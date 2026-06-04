/**
 * DABAR 문제 생성 (재개 가능 / 권별 분량·중요도 차등 / 배치 생성)
 *
 * 사용법:
 *   npm run generate              → 부족한 문제 전부 채우기 (이미 있는 건 건너뜀)
 *   npm run generate -- --plan    → 생성 안 하고 계획만 출력 (크레딧 0원)
 *   npm run generate -- --book 창세기   → 특정 권만
 *   npm run generate -- --limit 100     → 이번 실행에서 최대 100개만 (지출 조절)
 */
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase  = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const MODEL = "claude-sonnet-4-20250514";
const BATCH_SIZE = 12;
const DELAY_MS = 1200;
const MAX_EMPTY_RETRY = 3;

const BOOK_TARGET: Record<string, number> = {
  "창세기": 100, "출애굽기": 85, "레위기": 50, "민수기": 60, "신명기": 70,
  "여호수아": 55, "사사기": 55, "룻기": 30, "사무엘상": 70, "사무엘하": 60,
  "열왕기상": 60, "열왕기하": 60, "역대상": 45, "역대하": 50, "에스라": 35,
  "느헤미야": 38, "에스더": 38, "욥기": 55, "시편": 100, "잠언": 70,
  "전도서": 38, "아가": 25, "이사야": 85, "예레미야": 70, "예레미야애가": 22,
  "에스겔": 60, "다니엘": 60, "호세아": 35, "요엘": 22, "아모스": 30,
  "오바댜": 15, "요나": 30, "미가": 28, "나훔": 18, "하박국": 20,
  "스바냐": 18, "학개": 18, "스가랴": 30, "말라기": 22,
  "마태복음": 95, "마가복음": 70, "누가복음": 90, "요한복음": 95, "사도행전": 90,
  "로마서": 70, "고린도전서": 60, "고린도후서": 40, "갈라디아서": 38, "에베소서": 40,
  "빌립보서": 35, "골로새서": 30, "데살로니가전서": 30, "데살로니가후서": 20, "디모데전서": 30,
  "디모데후서": 25, "디도서": 20, "빌레몬서": 15, "히브리서": 55, "야고보서": 35,
  "베드로전서": 35, "베드로후서": 25, "요한일서": 30, "요한이서": 12, "요한삼서": 12,
  "유다서": 15, "요한계시록": 70,
};

const TESTAMENT_OF: Record<string, "old" | "new"> = {};
[
  "창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하",
  "열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언",
  "전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스",
  "오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기",
].forEach(b => (TESTAMENT_OF[b] = "old"));
[
  "마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에베소서",
  "빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서",
  "베드로전서","베드로후서","요한일서","요한이서","요한삼서","유다서","요한계시록",
].forEach(b => (TESTAMENT_OF[b] = "new"));

const BOOKS = Object.keys(BOOK_TARGET);

const VALID_LEVELS = new Set(["easy", "medium", "hard"]);
const VALID_CATS   = new Set(["인물", "사건", "말씀", "지명"]);

function args() {
  const a = process.argv.slice(2);
  const get = (flag: string) => { const i = a.indexOf(flag); return i >= 0 ? a[i + 1] : undefined; };
  return {
    plan: a.includes("--plan"),
    book: get("--book"),
    limit: get("--limit") ? parseInt(get("--limit")!) : Infinity,
  };
}

function isCreditError(e: any): boolean {
  const msg = e?.error?.error?.message || e?.error?.message || e?.message || "";
  return /credit balance is too low|insufficient|billing/i.test(String(msg));
}

function extractJsonArray(text: string): any[] {
  const t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("JSON 배열을 찾을 수 없음");
  return JSON.parse(t.slice(start, end + 1));
}

function isValidQ(q: any): boolean {
  return !!q
    && typeof q.question === "string" && q.question.trim().length > 0
    && Array.isArray(q.options) && q.options.length === 4 && q.options.every((o: any) => typeof o === "string" && o.length > 0)
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    && VALID_LEVELS.has(q.level) && VALID_CATS.has(q.category)
    && typeof q.hint === "string" && typeof q.explanation === "string";
}

async function fetchExisting(): Promise<{ book: string; question: string }[]> {
  const all: { book: string; question: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from("questions").select("book, question").range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...(data as any));
    if (data.length < PAGE) break;
  }
  return all;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generateBatch(book: string, testament: string, n: number, avoidStems: string[]): Promise<any[]> {
  const easy = Math.max(1, Math.round(n * 0.35));
  const medium = Math.max(1, Math.round(n * 0.45));
  const hard = Math.max(0, n - easy - medium);

  const avoidBlock = avoidStems.length
    ? `\n\n[중복 금지] 아래 질문들과 의미가 겹치지 않는 새로운 문제만 만드세요:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
    : "";

  const prompt = `당신은 성경 전문가입니다. "${book}"에 관한 퀴즈 문제 ${n}개를 만들어 주세요.

반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON만 출력하세요.

[{"book":"${book}","testament":"${testament}","category":"인물","level":"easy","question":"질문 내용","options":["선택지1","선택지2","선택지3","선택지4"],"answer":0,"hint":"힌트 1~2문장","explanation":"정답 해설 2~3문장"}]

조건:
- easy ${easy}개, medium ${medium}개, hard ${hard}개
- category: "인물" | "사건" | "말씀" | "지명" 중 하나
- answer: 정답인 선택지의 인덱스 (0~3, 0부터 시작)
- 신학적으로 정확하고 검증된 내용만 (개역개정 기준)
- easy는 어린이(7세)도 풀 수 있게, hard는 신학생 수준으로
- 한국어로 작성${avoidBlock}`;

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find(b => b.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  return extractJsonArray(text);
}

async function fillBook(book: string, have: number, target: number, existingStems: string[], remainingBudget: number): Promise<number> {
  const need = Math.min(target - have, remainingBudget);
  if (need <= 0) {
    console.log(`⏭️  ${book}: 이미 ${have}/${target}개 — 건너뜀`);
    return 0;
  }
  const testament = TESTAMENT_OF[book];
  const seen = new Set(existingStems.map(s => s.trim()));
  let added = 0;
  let emptyStreak = 0;

  console.log(`📝 ${book}: 현재 ${have}개 → 목표 ${target}개 (이번에 ${need}개 생성)`);

  while (added < need) {
    const batch = Math.min(BATCH_SIZE, need - added);
    let raw: any[];
    try {
      raw = await generateBatch(book, testament, batch, [...seen]);
    } catch (e) {
      if (isCreditError(e)) throw e;
      console.error(`   ⚠️ ${book} 배치 생성 오류 (건너뜀):`, (e as any)?.message || e);
      emptyStreak++;
      if (emptyStreak >= MAX_EMPTY_RETRY) { console.log(`   ⏹ ${book} 연속 실패 → 다음 책으로`); break; }
      await sleep(DELAY_MS);
      continue;
    }

    const fresh = raw
      .map(q => ({ ...q, book, testament }))
      .filter(isValidQ)
      .filter(q => { const s = q.question.trim(); if (seen.has(s)) return false; seen.add(s); return true; })
      .slice(0, need - added);

    if (!fresh.length) {
      emptyStreak++;
      if (emptyStreak >= MAX_EMPTY_RETRY) { console.log(`   ⏹ ${book} 새 문제 없음 → 다음 책으로`); break; }
      await sleep(DELAY_MS);
      continue;
    }
    emptyStreak = 0;

    const { error } = await supabase.from("questions").insert(fresh);
    if (error) { console.error(`   ❌ ${book} 저장 실패:`, error.message); break; }

    added += fresh.length;
    console.log(`   ✅ +${fresh.length} (${have + added}/${target})`);
    await sleep(DELAY_MS);
  }
  return added;
}

async function main() {
  const { plan, book: onlyBook, limit } = args();

  if (plan && onlyBook === undefined) {
    let totalTarget = 0;
    console.log("📋 권별 목표 문제 수\n");
    for (const b of BOOKS) { console.log(`${b.padEnd(8)} ${BOOK_TARGET[b]}`); totalTarget += BOOK_TARGET[b]; }
    console.log(`\n🎯 전체 목표 합계: ${totalTarget}개`);
    return;
  }

  console.log("📊 기존 문제 현황 확인 중...");
  const existing = await fetchExisting();
  const have: Record<string, number> = {};
  const stemsByBook: Record<string, string[]> = {};
  for (const row of existing) {
    have[row.book] = (have[row.book] || 0) + 1;
    (stemsByBook[row.book] ||= []).push(row.question);
  }
  console.log(`   현재 DB에 총 ${existing.length}개\n`);

  const targets = onlyBook ? [onlyBook] : BOOKS;
  if (onlyBook && !BOOK_TARGET[onlyBook]) { console.error(`❌ "${onlyBook}"는 목표 목록에 없는 책입니다.`); return; }

  let budget = limit;
  let totalAdded = 0;
  try {
    for (const b of targets) {
      if (budget <= 0) { console.log("\n💰 이번 실행 생성 한도(--limit) 도달 → 종료"); break; }
      const added = await fillBook(b, have[b] || 0, BOOK_TARGET[b], stemsByBook[b] || [], budget);
      totalAdded += added;
      budget -= added;
    }
    console.log(`\n🎉 완료! 이번 실행에서 ${totalAdded}개 새로 생성. (DB 총 ${existing.length + totalAdded}개)`);
  } catch (e) {
    if (isCreditError(e)) {
      console.error(`\n🛑 크레딧 부족으로 중단됨. 지금까지 ${totalAdded}개 생성 (DB 총 ${existing.length + totalAdded}개).`);
      console.error(`   충전 후 다시 'npm run generate' 하면 이어서 채웁니다 (이미 만든 건 건너뜀).`);
    } else {
      console.error("\n❌ 예기치 못한 오류:", e);
    }
    process.exit(1);
  }
}
main();
