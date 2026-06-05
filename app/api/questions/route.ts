import { getSupabase } from "@/lib/supabase";
import { BIBLE_BOOKS } from "@/lib/bible";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

const VALID_BOOKS = new Set([...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new]);
const VALID_LEVELS = new Set(["easy", "medium", "hard"]);
const VALID_TESTAMENTS = new Set(["old", "new"]);

export async function GET(req: NextRequest) {
  // 요청 제한: 분당 30회 초과 시 차단
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const levelRaw     = searchParams.get("level");
  const testamentRaw = searchParams.get("testament");
  const rawCount     = parseInt(searchParams.get("count") || "10");
  const count        = Math.max(1, Math.min(30, isNaN(rawCount) ? 10 : rawCount));
  const booksRaw     = searchParams.get("books");

  const level     = levelRaw && VALID_LEVELS.has(levelRaw) ? levelRaw : null;
  const testament = testamentRaw && VALID_TESTAMENTS.has(testamentRaw) ? testamentRaw : null;
  const books = booksRaw
    ? booksRaw.split(",").map(b => b.trim()).filter(b => VALID_BOOKS.has(b))
    : [];

  const supabase = getSupabase();

  // 1순위: DB에서 직접 무작위 추출(RPC). 함수 미등록 시 기존 방식으로 폴백.
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_random_questions", {
    p_count: count,
    p_level: level,
    p_testament: testament,
    p_books: books.length ? books : null,
  });
  if (!rpcError && Array.isArray(rpcData)) {
    return NextResponse.json(rpcData);
  }

  // 폴백: count*5 조회 후 Fisher-Yates 셔플
  let query = supabase.from("questions").select("*").limit(count * 5);
  if (level)         query = query.eq("level", level);
  if (testament)     query = query.eq("testament", testament);
  if (books.length)  query = query.in("book", books);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json([], { status: 200 });

  const arr = [...data];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return NextResponse.json(arr.slice(0, count));
}
