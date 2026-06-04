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
  const count     = parseInt(searchParams.get("count") || "10");

  let query = supabase.from("questions").select("*").limit(count * 5);
  if (level     && level     !== "전체") query = query.eq("level", level);
  if (testament && testament !== "전체") query = query.eq("testament", testament);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json([], { status: 200 });

  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count);
  return NextResponse.json(shuffled);
}
