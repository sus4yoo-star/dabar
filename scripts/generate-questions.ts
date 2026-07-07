/**
 * DABAR 문제 생성 (재개 가능 / 권별 분량·중요도 차등 / 배치 생성 / 다국어)
 *
 * 사용법:
 *   npm run generate                    → (한국어) 부족한 문제 전부 채우기
 *   npm run generate -- --lang en       → 영어판(NIV 기준) 생성
 *   npm run generate -- --lang th       → 태국어판(Thai Standard Version 기준) 생성
 *   npm run generate -- --lang lo       → 라오스어판(Lao Standard Version 2015 기준) 생성
 *   npm run generate -- --plan          → 생성 안 하고 계획만 출력 (크레딧 0원)
 *   npm run generate -- --book 창세기    → 특정 권만
 *   npm run generate -- --limit 100      → 이번 실행에서 최대 100개만 (지출 조절)
 *   (예: npm run generate -- --lang en --book 창세기 --limit 50)
 *
 * ※ 사전 준비: Supabase questions 테이블에 lang 컬럼이 있어야 합니다.
 *    alter table questions add column if not exists lang text not null default 'ko';
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

// 언어별 권위 성경 (각 언어 표준/공인 역본 기준으로 생성하도록 프롬프트에 명시)
const LANG_BIBLE: Record<string, { name: string; bible: string }> = {
  es: { name: "Spanish", bible: "Reina-Valera 1960 (RVR1960)" },
  pt: { name: "Portuguese", bible: "João Ferreira de Almeida (ARC)" },
  zh: { name: "Chinese (Simplified)", bible: "Chinese Union Version 和合本 (CUV)" },
  hi: { name: "Hindi", bible: "Hindi Bible (पवित्र बाइबिल)" },
  ar: { name: "Arabic", bible: "Smith & Van Dyke (فان دايك)" },
  fa: { name: "Persian (Farsi)", bible: "Persian Old Version (ترجمه قدیم)" },
  my: { name: "Burmese", bible: "Judson Bible" },
  ms: { name: "Malay", bible: "Alkitab Terjemahan Baru (TB)" },
  vi: { name: "Vietnamese", bible: "Kinh Thánh Bản Truyền Thống (1934)" },
  id: { name: "Indonesian", bible: "Alkitab Terjemahan Baru (TB)" },
  bn: { name: "Bengali", bible: "Bengali Bible (BSI Common Language)" },
  ja: { name: "Japanese", bible: "新改訳聖書 (Shinkaiyaku)" },
  ur: { name: "Urdu", bible: "Urdu Geo Version" },
  fr: { name: "French", bible: "Louis Segond 1910 (LSG)" },
  ru: { name: "Russian", bible: "Синодальный перевод (Synodal)" },
  sw: { name: "Swahili", bible: "Swahili Union Version (SUV)" },
};
const ALL_GEN_LANGS = ["ko", "en", "th", "lo", ...Object.keys(LANG_BIBLE)];

function args() {
  const a = process.argv.slice(2);
  const get = (flag: string) => { const i = a.indexOf(flag); return i >= 0 ? a[i + 1] : undefined; };
  // 플래그(--lang) 또는 환경변수(GEN_LANG) 둘 다 지원 — 붙여넣을 때 "--"가 "—"로 바뀌는 문제 회피용
  const lang = (get("--lang") || process.env.GEN_LANG || "ko") as string;
  if (!ALL_GEN_LANGS.includes(lang)) { console.error(`❌ 지원 언어 코드가 아닙니다: ${lang}\n   가능: ${ALL_GEN_LANGS.join(", ")}`); process.exit(1); }
  const limitRaw = get("--limit") || process.env.GEN_LIMIT;
  return {
    plan: a.includes("--plan") || process.env.GEN_PLAN === "1",
    book: get("--book") || process.env.GEN_BOOK,
    limit: limitRaw ? parseInt(limitRaw) : Infinity,
    lang,
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

async function fetchExisting(lang: string): Promise<{ book: string; question: string }[]> {
  const all: { book: string; question: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from("questions").select("book, question").eq("lang", lang).range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...(data as any));
    if (data.length < PAGE) break;
  }
  return all;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generateBatch(book: string, testament: string, n: number, avoidStems: string[], lang: string): Promise<any[]> {
  const easy = Math.max(1, Math.round(n * 0.35));
  const medium = Math.max(1, Math.round(n * 0.45));
  const hard = Math.max(0, n - easy - medium);

  // 공통 JSON 스키마 (book/category 는 모든 언어에서 한국어 코드 그대로 유지 → 권 필터·분류 호환)
  const schema = `[{"book":"${book}","testament":"${testament}","category":"인물","level":"easy","question":"...","options":["..","..","..",".."],"answer":0,"hint":"...","explanation":"..."}]`;

  let prompt: string;
  if (lang === "en") {
    const avoidBlock = avoidStems.length
      ? `\n\n[No duplicates] Create only NEW questions that do not overlap in meaning with these:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
      : "";
    prompt = `You are a Bible expert. Create ${n} quiz questions about the Bible book whose Korean name is "${book}".

Respond ONLY as a JSON array. No markdown, no code block, no explanatory text — JSON only.

${schema}

Rules:
- Keep "book" EXACTLY as "${book}" (Korean) and "category" as one of these EXACT codes: "인물" (person) | "사건" (event) | "말씀" (teaching/verse) | "지명" (place).
- easy ${easy}, medium ${medium}, hard ${hard}
- "answer" is the 0-based index of the correct option (0~3)
- Theologically accurate and verified, based on the NIV (New International Version)
- easy: solvable by a 7-year-old; hard: seminary level
- Write "question", "options", "hint", "explanation" in ENGLISH${avoidBlock}`;
  } else if (lang === "th") {
    const avoidBlock = avoidStems.length
      ? `\n\n[ห้ามซ้ำ] สร้างเฉพาะคำถามใหม่ที่ไม่ซ้ำความหมายกับรายการต่อไปนี้:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
      : "";
    prompt = `คุณเป็นผู้เชี่ยวชาญพระคัมภีร์ จงสร้างคำถามควิซ ${n} ข้อ เกี่ยวกับหนังสือพระคัมภีร์ที่มีชื่อภาษาเกาหลีว่า "${book}"

ตอบกลับเป็นอาร์เรย์ JSON เท่านั้น ห้ามมี markdown, code block หรือข้อความอธิบาย — JSON เท่านั้น

${schema}

เงื่อนไข:
- คง "book" ไว้เป็น "${book}" (ภาษาเกาหลี) ทุกข้อ และ "category" เป็นรหัสใดรหัสหนึ่งต่อไปนี้: "인물" (บุคคล) | "사건" (เหตุการณ์) | "말씀" (พระวจนะ) | "지명" (สถานที่)
- "answer" คือดัชนีของตัวเลือกที่ถูกต้อง (0~3 เริ่มจาก 0)
- ถูกต้องตามหลักเทววิทยาและตรวจสอบแล้ว โดยอ้างอิง "พระคริสตธรรมคัมภีร์ ฉบับมาตรฐาน 2011" (Thai Standard Version, THSV 2011) ของสมาคมพระคริสตธรรมไทย ซึ่งเป็นฉบับที่คริสตจักรไทยใช้แพร่หลายที่สุด
- ใช้ชื่อบุคคล ชื่อสถานที่ และคำศัพท์ทางศาสนาให้ตรงตามที่ปรากฏในฉบับมาตรฐาน 2011
- easy: เด็ก 7 ขวบก็ตอบได้, hard: ระดับนักศึกษาเทววิทยา
- เขียน "question", "options", "hint", "explanation" เป็นภาษาไทย${avoidBlock}`;
  } else if (lang === "lo") {
    const avoidBlock = avoidStems.length
      ? `\n\n[ຫ້າມຊ້ຳ] ສ້າງສະເພາະຄຳຖາມໃໝ່ທີ່ບໍ່ຊ້ຳຄວາມໝາຍກັບລາຍການຕໍ່ໄປນີ້:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
      : "";
    prompt = `ທ່ານເປັນຜູ້ຊ່ຽວຊານດ້ານພຣະຄຳພີ ຈົ່ງສ້າງຄຳຖາມຄິວສ໌ ${n} ຂໍ້ ກ່ຽວກັບໜັງສືພຣະຄຳພີທີ່ມີຊື່ພາສາເກົາຫຼີວ່າ "${book}"

ຕອບກັບເປັນ JSON array ເທົ່ານັ້ນ ຫ້າມມີ markdown, code block ຫຼື ຂໍ້ຄວາມອະທິບາຍ — JSON ເທົ່ານັ້ນ

${schema}

ເງື່ອນໄຂ:
- ຮັກສາ "book" ໄວ້ເປັນ "${book}" (ພາສາເກົາຫຼີ) ທຸກຂໍ້ ແລະ "category" ເປັນລະຫັດໃດໜຶ່ງຕໍ່ໄປນີ້: "인물" (ບຸກຄົນ) | "사건" (ເຫດການ) | "말씀" (ພຣະທຳ) | "지명" (ສະຖານທີ່)
- easy ${easy} ຂໍ້, medium ${medium} ຂໍ້, hard ${hard} ຂໍ້
- "answer" ຄືດັດຊະນີຂອງຕົວເລືອກທີ່ຖືກຕ້ອງ (0~3 ເລີ່ມຈາກ 0)
- ຖືກຕ້ອງຕາມຫຼັກເທວະວິທະຍາ ອ້າງອີງສະບັບ ພຣະຄຳພີ ພາສາລາວ ສະບັບ 2015 (Lao Standard Version 2015)
- easy: ເດັກ 7 ປີກໍຕອບໄດ້, hard: ລະດັບນັກສຶກສາເທວະວິທະຍາ
- ຂຽນ "question", "options", "hint", "explanation" ເປັນພາສາລາວ${avoidBlock}`;
  } else if (LANG_BIBLE[lang]) {
    const { name, bible } = LANG_BIBLE[lang];
    const avoidBlock = avoidStems.length
      ? `\n\n[No duplicates] Create only NEW questions that do not overlap in meaning with these:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
      : "";
    prompt = `You are a Bible expert. Create ${n} Bible quiz questions about the Bible book whose Korean name is "${book}".

Respond ONLY as a JSON array. No markdown, no code block, no explanatory text — JSON only.

${schema}

Rules:
- Keep "book" EXACTLY as "${book}" (Korean) and "category" as one of these EXACT codes: "인물" (person) | "사건" (event) | "말씀" (teaching/verse) | "지명" (place).
- easy ${easy}, medium ${medium}, hard ${hard}
- "answer" is the 0-based index of the correct option (0~3)
- Theologically accurate and verified, based on the authoritative ${name} Bible: ${bible}
- Use Bible names/terms exactly as they appear in that ${name} version
- easy: solvable by a 7-year-old; hard: seminary level
- Write "question", "options", "hint", "explanation" in natural, native ${name}${avoidBlock}`;
  } else {
    const avoidBlock = avoidStems.length
      ? `\n\n[중복 금지] 아래 질문들과 의미가 겹치지 않는 새로운 문제만 만드세요:\n${avoidStems.slice(0, 60).map(s => `- ${s}`).join("\n")}`
      : "";
    prompt = `당신은 성경 전문가입니다. "${book}"에 관한 퀴즈 문제 ${n}개를 만들어 주세요.

반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON만 출력하세요.

${schema}

조건:
- easy ${easy}개, medium ${medium}개, hard ${hard}개
- category: "인물" | "사건" | "말씀" | "지명" 중 하나
- answer: 정답인 선택지의 인덱스 (0~3, 0부터 시작)
- 신학적으로 정확하고 검증된 내용만 (개역개정 기준)
- easy는 어린이(7세)도 풀 수 있게, hard는 신학생 수준으로
- 한국어로 작성${avoidBlock}`;
  }

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find(b => b.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  return extractJsonArray(text);
}

async function fillBook(book: string, have: number, target: number, existingStems: string[], remainingBudget: number, lang: string): Promise<number> {
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
      raw = await generateBatch(book, testament, batch, [...seen], lang);
    } catch (e) {
      if (isCreditError(e)) throw e;
      console.error(`   ⚠️ ${book} 배치 생성 오류 (건너뜀):`, (e as any)?.message || e);
      emptyStreak++;
      if (emptyStreak >= MAX_EMPTY_RETRY) { console.log(`   ⏹ ${book} 연속 실패 → 다음 책으로`); break; }
      await sleep(DELAY_MS);
      continue;
    }

    const fresh = raw
      .map(q => ({ ...q, book, testament, lang }))
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
  const { plan, book: onlyBook, limit, lang } = args();
  const label = lang === "en" ? " (NIV)" : lang === "th" ? " (ฉบับมาตรฐาน 2011)" : lang === "lo" ? " (Lao Standard Version 2015)" : LANG_BIBLE[lang] ? ` (${LANG_BIBLE[lang].bible})` : " (개역개정)";
  console.log(`🌐 언어: ${lang.toUpperCase()}${label}\n`);

  if (plan && onlyBook === undefined) {
    let totalTarget = 0;
    console.log("📋 권별 목표 문제 수\n");
    for (const b of BOOKS) { console.log(`${b.padEnd(8)} ${BOOK_TARGET[b]}`); totalTarget += BOOK_TARGET[b]; }
    console.log(`\n🎯 전체 목표 합계: ${totalTarget}개`);
    return;
  }

  console.log(`📊 기존 ${lang.toUpperCase()} 문제 현황 확인 중...`);
  let existing: { book: string; question: string }[];
  try {
    existing = await fetchExisting(lang);
  } catch (e: any) {
    const msg = e?.message || e?.error?.message || e?.code || JSON.stringify(e);
    console.error(`\n❌ Supabase 조회 실패: ${msg}`);
    console.error(`   ▸ 'lang' 컬럼이 없다면 Supabase SQL Editor에서 실행:`);
    console.error(`     alter table questions add column if not exists lang text not null default 'ko';`);
    console.error(`   ▸ 또는 .env.local 의 SUPABASE_SERVICE_KEY 가 올바른지 확인하세요.`);
    process.exit(1);
  }
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
      const added = await fillBook(b, have[b] || 0, BOOK_TARGET[b], stemsByBook[b] || [], budget, lang);
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
