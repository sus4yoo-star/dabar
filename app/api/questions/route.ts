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
  const langRaw   = searchParams.get("lang") || "ko";
  const lang      = ["ko", "en", "th"].includes(langRaw) ? langRaw : "ko";

  const books = booksRaw
    ? booksRaw.split(",").map(b => b.trim()).filter(Boolean)
    : [];

  // withLang=false 면 lang 필터 없이 조회 (lang 컬럼이 아직 없는 DB에서도 동작)
  function build(useLang: string, withLang: boolean) {
    let q = supabase.from("questions").select("*").limit(count * 5);
    if (withLang) q = q.eq("lang", useLang);
    if (level     && level     !== "전체") q = q.eq("level", level);
    if (testament && testament !== "전체") q = q.eq("testament", testament);
    if (books.length) q = q.in("book", books); // 특정 권 선택 시 필터
    return q;
  }

  let { data, error } = await build(lang, true);
  // lang 컬럼이 아직 없으면(마이그레이션 전) 필터 없이 재조회
  if (error && /lang/i.test(error.message)) {
    ({ data, error } = await build(lang, false));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // 해당 언어 문제가 아직 없으면 한국어로 폴백 (생성 전에도 퀴즈가 비지 않도록)
  if ((!data || !data.length) && lang !== "ko") {
    ({ data, error } = await build("ko", true));
    if (error && /lang/i.test(error.message)) ({ data, error } = await build("ko", false));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json([], { status: 200 });

  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count);
  return NextResponse.json(shuffled);
}
