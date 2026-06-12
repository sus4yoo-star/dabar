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
  const parsed    = parseInt(searchParams.get("count") || "10", 10);
  const count     = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 10;
  const complete  = searchParams.get("complete") === "1"; // 빠짐없이 풀기(완주) — 범위 내 전 문제 고정 순서
  const booksRaw  = searchParams.get("books");
  const langRaw   = searchParams.get("lang") || "ko";
  const lang      = ["ko", "en", "th", "lo"].includes(langRaw) ? langRaw : "ko";

  const books = booksRaw ? booksRaw.split(",").map(b => b.trim()).filter(Boolean) : [];

  const applyFilters = (q: any, useLang: string, withLang: boolean) => {
    if (withLang) q = q.eq("lang", useLang);
    if (level     && level     !== "전체") q = q.eq("level", level);
    if (testament && testament !== "전체") q = q.eq("testament", testament);
    if (books.length) q = q.in("book", books);
    return q;
  };

  // 완주 모드: 범위 내 모든 문제를 고정 순서(생성순)로 페이지네이션해 전부 가져옴
  async function fetchAll(useLang: string, withLang: boolean) {
    const rows: any[] = [];
    for (let from = 0; from < 8000; from += 1000) {
      let q = supabase.from("questions").select("*").order("created_at", { ascending: true }).range(from, from + 999);
      q = applyFilters(q, useLang, withLang);
      const { data, error } = await q;
      if (error) return { data: null as any[] | null, error };
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return { data: rows, error: null as any };
  }

  // 일반 모드: 후보를 넉넉히 받아 섞어 count 개
  function fetchSome(useLang: string, withLang: boolean) {
    return applyFilters(supabase.from("questions").select("*").limit(count * 5), useLang, withLang);
  }

  const run = (useLang: string, withLang: boolean) =>
    complete ? fetchAll(useLang, withLang) : fetchSome(useLang, withLang);

  let { data, error } = await run(lang, true);
  if (error && /lang/i.test(error.message)) ({ data, error } = await run(lang, false));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 해당 언어 문제가 아직 없으면 한국어로 폴백
  if ((!data || !data.length) && lang !== "ko") {
    ({ data, error } = await run("ko", true));
    if (error && /lang/i.test(error.message)) ({ data, error } = await run("ko", false));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json([], { status: 200 });

  // 완주 모드는 고정 순서 그대로(이어풀기용), 일반 모드는 무작위 count개
  if (complete) return NextResponse.json(data);
  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count);
  return NextResponse.json(shuffled);
}
