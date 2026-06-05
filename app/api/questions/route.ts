import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level     = searchParams.get("level");
  const testament = searchParams.get("testament");
  // count 는 1~50 으로 제한 (주소창으로 큰 값을 넣어 서버에 부담 주는 것 방지)
  const parsed    = parseInt(searchParams.get("count") || "10", 10);
  const count     = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 10;
  const booksRaw  = searchParams.get("books"); // 선택한 권 (쉼표 구분)

  const books = booksRaw
    ? booksRaw.split(",").map(b => b.trim()).filter(Boolean)
    : [];

  let query = supabase.from("questions").select("*").limit(count * 5);
  if (level     && level     !== "전체") query = query.eq("level", level);
  if (testament && testament !== "전체") query = query.eq("testament", testament);
  if (books.length) query = query.in("book", books); // 특정 권 선택 시 필터

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json([], { status: 200 });

  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count);
  return NextResponse.json(shuffled);
}
