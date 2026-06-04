import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase  = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const BOOKS: Record<string, string[]> = {
  old: ["창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하","열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언","전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스","오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기"],
  new: ["마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에베소서","빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서","베드로전서","베드로후서","요한일서","요한이서","요한삼서","유다서","요한계시록"],
};

const BOOK_COUNT: Record<string, number> = {
  "창세기": 50, "출애굽기": 45, "민수기": 30, "신명기": 30, "사무엘상": 35, "사무엘하": 30,
  "열왕기상": 30, "열왕기하": 30, "시편": 60, "잠언": 45, "이사야": 45, "예레미야": 35,
  "에스겔": 30, "다니엘": 30, "마태복음": 55, "마가복음": 40, "누가복음": 50, "요한복음": 55,
  "사도행전": 50, "로마서": 35, "고린도전서": 35, "요한계시록": 40,
};
function getCount(book: string) { return BOOK_COUNT[book] || 20; }

async function generateForBook(book: string, testament: string, count: number): Promise<number> {
  const easy = Math.round(count * 0.35);
  const medium = Math.round(count * 0.45);
  const hard = count - easy - medium;
  const prompt = `당신은 성경 전문가입니다. "${book}"에 관한 퀴즈 문제 ${count}개를 만들어 주세요.

반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운, 코드블록, 설명 텍스트 없이 JSON만 출력하세요.

[{"book":"${book}","testament":"${testament}","category":"인물","level":"easy","question":"질문 내용","options":["선택지1","선택지2","선택지3","선택지4"],"answer":0,"hint":"힌트 1~2문장","explanation":"정답 해설 2~3문장"}]

조건:
- easy ${easy}개, medium ${medium}개, hard ${hard}개
- category: "인물" | "사건" | "말씀" | "지명" 중 하나
- 신학적으로 정확하고 검증된 내용만
- 어린이(7세)도 풀 수 있는 쉬운 문제부터 신학생 수준의 어려운 문제까지
- 한국어로 작성`;

  try {
    const res = await anthropic.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 8000, messages: [{ role: "user", content: prompt }] });
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const qs = JSON.parse(clean);
    const { error } = await supabase.from("questions").insert(qs);
    if (error) throw error;
    console.log(`✅ ${book}: ${qs.length}개 저장`);
    return qs.length;
  } catch (e) {
    console.error(`❌ ${book} 실패:`, e);
    return 0;
  }
}

async function main() {
  console.log("🚀 DABAR 문제 생성 시작...\n");
  let total = 0;
  for (const [testament, books] of Object.entries(BOOKS)) {
    for (const book of books) {
      total += await generateForBook(book, testament, getCount(book));
      console.log(`📊 누적 ${total}개\n`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  console.log(`\n🎉 완료! 총 ${total}개 문제 생성됨`);
}
main();
