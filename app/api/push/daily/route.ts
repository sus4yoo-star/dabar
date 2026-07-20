import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { gospelPassages } from "@/lib/besora/verses";

// 매일 "오늘의 말씀" 자동 푸시 — 스케줄러(GitHub Actions cron 등)가 하루 한 번 호출.
// 홈의 <DailyVerse/> 와 동일한 로직(연중 일수 순환)으로 같은 구절을 전 구독자에게 방송.
// CRON_SECRET 으로 보호(아무나 방송 트리거 불가). 전체 구독 조회는 서비스 롤 키 사용.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VAPID_PUBLIC =
  "BIpALnramBB_b99FS7kdN54QsUOZIvbSh64qx77NxwJQ119mWsg6btsPAH7dkW_ExQx0VL-xd8kN2vLVcwy_ieo";

// 오늘의 말씀(홈과 동일: 연중 일수 % 길이)
function todaysVerse(lang: string) {
  const list = gospelPassages(lang);
  if (!list.length) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return list[day % list.length];
}

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@theamov.com";
  if (!secret) return NextResponse.json({ error: "no-cron-secret" }, { status: 500 });
  if (!priv || !svc || !sbUrl) return NextResponse.json({ error: "misconfigured" }, { status: 500 });

  // 인증: x-cron-secret 헤더 또는 Authorization: Bearer <secret>
  const auth = req.headers.get("authorization") || "";
  const got = req.headers.get("x-cron-secret") || (auth.startsWith("Bearer ") ? auth.slice(7) : "");
  if (got !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const lang = new URL(req.url).searchParams.get("lang") || "ko";
  const verse = todaysVerse(lang);
  if (!verse) return NextResponse.json({ error: "no-verse" }, { status: 500 });

  const sb = createClient(sbUrl, svc, { db: { schema: "besora" }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: subs, error } = await sb.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (error) return NextResponse.json({ error: "db-failed", detail: error.message }, { status: 502 });
  const rows = (subs ?? []) as { endpoint: string; p256dh: string; auth: string }[];
  if (rows.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  webpush.setVapidDetails(subject, VAPID_PUBLIC, priv);
  const title = lang === "ko" ? "✦ 오늘의 말씀" : "✦ Verse of the day";
  const payload = JSON.stringify({
    title,
    body: `“${verse.text}” — ${verse.label}`.slice(0, 500),
    url: "/",
    tag: "daily-verse",
  });

  let sent = 0, gone = 0;
  await Promise.all(
    rows.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e) {
        // 410/404 = 만료된 구독 → 정리
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) { gone++; try { await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint); } catch { /* */ } }
      }
    })
  );
  return NextResponse.json({ ok: true, sent, cleaned: gone, verse: verse.label });
}

export async function POST(req: NextRequest) { return handle(req); }
export async function GET(req: NextRequest) { return handle(req); } // 일부 크론 서비스는 GET
