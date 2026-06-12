import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VAPID_PUBLIC =
  "BITYYMQXCwSrfln-Hlcf5_67p2LvUVVpVBkEM7xAzKChuld5sr4nWF8nwHzWaSZql-Z-6ZOytgAoBMW5FMbCyPo";

export async function POST(req: NextRequest) {
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@theamov.com";
  if (!priv) return NextResponse.json({ error: "no-vapid" }, { status: 500 });

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { companionId?: string; title?: string; body?: string; url?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }
  const { companionId, title, body: text, url } = body;
  if (!companionId) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // 호출자(전도자)의 토큰으로 동작 → RPC 가 본인이 그 동행에 속했는지 확인
  const sb = createClient(sbUrl, anon, {
    db: { schema: "besora" },
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: subs, error } = await sb.rpc("peer_push_subs", { p_companion: companionId });
  if (error) return NextResponse.json({ error: "rpc-failed", detail: error.message }, { status: 502 });
  const list = (subs ?? []) as { endpoint: string; p256dh: string; auth: string }[];
  if (list.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  webpush.setVapidDetails(subject, VAPID_PUBLIC, priv);
  const payload = JSON.stringify({ title: title || "다바르", body: text || "", url: url || "/share/me", tag: `chat-${companionId}` });

  let sent = 0;
  await Promise.all(
    list.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch {
        /* 만료/실패 구독은 무시 (다음 enablePush 때 갱신) */
      }
    })
  );
  return NextResponse.json({ ok: true, sent });
}
