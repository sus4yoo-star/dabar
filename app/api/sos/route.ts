import { NextRequest, NextResponse } from "next/server";

// 🆘 SOS 자동 문자 발송 — Twilio REST API (서버에서만 키 사용).
// 로그인 사용자만 호출 가능(Supabase JWT 검증). 키 미설정/실패 시 클라이언트가 문자앱으로 폴백.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 전화번호 → E.164 (한국 기본). "010-..." → +8210..., "+66..." 유지, "00.." → "+.."
function e164(raw: string): string | null {
  let s = (raw || "").replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) return s.length >= 8 ? s : null;
  if (s.startsWith("00")) return "+" + s.slice(2);
  if (s.startsWith("0")) return "+82" + s.slice(1); // 한국 휴대폰 기본
  return s.length >= 8 ? "+" + s : null;
}

async function verifyUser(req: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!url || !anon || !token) return false;
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    return r.ok;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !tok || !from) return NextResponse.json({ error: "no-twilio" }, { status: 503 });

  if (!(await verifyUser(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { phones?: string[]; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }

  const text = (body.body ?? "").slice(0, 600).trim();
  const phones = (Array.isArray(body.phones) ? body.phones : []).map(e164).filter(Boolean).slice(0, 10) as string[];
  if (!text || !phones.length) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const authHeader = "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64");
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  let sent = 0; let failed = 0;
  await Promise.all(phones.map(async (to) => {
    try {
      const params = new URLSearchParams({ To: to, From: from, Body: text });
      const r = await fetch(endpoint, { method: "POST", headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
      if (r.ok) sent++; else failed++;
    } catch { failed++; }
  }));

  return NextResponse.json({ sent, failed });
}
