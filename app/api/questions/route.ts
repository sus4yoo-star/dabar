import { getSupabase } from "@/lib/supabase";
import { BIBLE_BOOKS } from "@/lib/bible";
import { NextRequest, NextResponse } from "next/server";

const VALID_BOOKS = new Set([...BIBLE_BOOKS.old, ...BIBLE_BOOKS.new]);
const VALID_LEVELS = new Set(["easy", "medium", "hard"]);
const VALID_TESTAMENTS = new Set(["old", "new"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level     = searchParams.get("level");
  const testament = searchParams.get("testament");
  const rawCount  = parseInt(searchParams.get("count") || "10");
  const count     = Math.max(1, Math.min(30, isNaN(rawCount) ? 10 : rawCount));
  const booksRaw  = searchParams.get("books");

  const books = booksRaw
    ? booksRaw.split(",").map(b => b.trim()).filter(b => VALID_BOOKS.has(b))
    : [];

  let query = getSupabase().from("questions").select("*").limit(count * 5);
  if (level     && VALID_LEVELS.has(level))     query = query.eq("level", level);
  if (testament && VALID_TESTAMENTS.has(testament)) query = query.eq("testament", testament);
  if (books.length) query = query.in("book", books);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json([], { status: 200 });

  // Fisher-Yates 셔플
  const arr = [...data];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return NextResponse.json(arr.slice(0, count));
}
