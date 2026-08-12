import { NextRequest, NextResponse } from "next/server";
import { limitByIp } from "@/lib/rateLimit";

// 전도 롤플레이 — AI가 "전도 대상(구도자)" 역할을 맡아, 전도자가 실전처럼 연습하게 한다.
// mode="chat": 상대(구도자)로서 응답 / mode="feedback": 코치로서 대화 전체를 평가.
// Anthropic 서버사이드 호출. 키는 환경변수에만. (comfort 라우트와 동일 패턴)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";

const LANG_NAME: Record<string, string> = {
  ko: "Korean", en: "English", th: "Thai", lo: "Lao", es: "Spanish", pt: "Portuguese",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", fa: "Persian", my: "Burmese", ms: "Malay",
  vi: "Vietnamese", id: "Indonesian", bn: "Bengali", ja: "Japanese", ur: "Urdu", fr: "French", ru: "Russian", sw: "Swahili",
};

const TOOL_NAME: Record<string, string> = {
  wordless: "The Wordless Book (five colors)",
  "four-laws": "The Four Spiritual Laws",
  bridge: "The Bridge to Life illustration",
  "three-circles": "Three Circles (God's design / brokenness / gospel)",
  romans: "The Romans Road",
};

const PERSONA: Record<string, string> = {
  curious: "warm and genuinely curious, asks honest questions, fairly open but wants to understand",
  tired: "weary, hurting, carrying pain and doubt about whether God cares; responds to compassion more than argument",
  skeptic: "intellectually skeptical; raises real objections (suffering, science, other religions, hypocrisy in church) but is fair",
  busy: "busy, a bit indifferent and guarded, short on time and patience; needs relevance before attention",
};

type Msg = { role: "evangelist" | "seeker"; content: string };

export async function POST(req: NextRequest) {
  const rl = limitByIp(req, "roleplay", 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate-limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "no-key" }, { status: 500 });

  let body: { tool?: string; persona?: string; lang?: string; mode?: string; messages?: Msg[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-request" }, { status: 400 }); }

  const lang = body.lang && LANG_NAME[body.lang] ? body.lang : "ko";
  const langName = LANG_NAME[lang];
  const toolName = TOOL_NAME[body.tool ?? ""] ?? "a gospel-sharing tool";
  const personaDesc = PERSONA[body.persona ?? ""] ?? PERSONA.curious;
  const mode = body.mode === "feedback" ? "feedback" : "chat";
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "evangelist" || m.role === "seeker") && typeof m.content === "string")
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));

  let system: string;
  let messages: { role: "user" | "assistant"; content: string }[];

  if (mode === "feedback") {
    // 코치 모드 — 대화 전체를 보고 전도자에게 따뜻하고 구체적인 피드백.
    system =
      `You are a warm, experienced evangelism coach and pastor. A trainee has just practiced sharing the gospel using ${toolName} with a role-played seeker. ` +
      `Review the whole conversation and give kind, specific, encouraging feedback to the EVANGELIST (not the seeker). ` +
      `Cover: (1) what they did well, (2) 2-3 concrete things to improve (clarity, listening, gospel accuracy, gentleness, inviting a response), (3) one short encouragement. ` +
      `Be gracious and practical, never harsh. Write ENTIRELY in ${langName}. Use short paragraphs or bullet points. Keep it under ~180 words.`;
    const transcript = history.map((m) => `${m.role === "evangelist" ? "EVANGELIST" : "SEEKER"}: ${m.content}`).join("\n");
    messages = [{ role: "user", content: `Here is the practice conversation:\n\n${transcript}\n\nGive your coaching feedback now.` }];
  } else {
    // 상대(구도자) 모드 — 캐릭터를 유지하며 짧게 응답.
    system =
      `You are role-playing as a real person who does NOT yet follow Jesus, talking with someone who is practicing sharing the gospel using ${toolName}. ` +
      `Your character is ${personaDesc}. Stay fully in character as this seeker — never break character, never become the evangelist, never preach. ` +
      `Respond the way a real person like this would: natural, human, sometimes with honest questions, hesitations, or objections that fit your character. ` +
      `Keep replies SHORT — 1 to 3 sentences. Do not wrap up the conversation too quickly; let the evangelist lead and earn your trust. ` +
      `If the evangelist is gentle, clear, and genuine, you may gradually soften and show real interest. If they are pushy, confusing, or preachy, react as a real person would. ` +
      `Write ONLY your spoken reply, ENTIRELY in ${langName}. No stage directions, no quotation marks, no labels.`;
    // 전도자=user, 구도자(AI)=assistant. 첫 메시지가 seeker이면 걸러진다(대개 전도자가 먼저 말함).
    messages = history.map((m) => ({ role: m.role === "evangelist" ? "user" as const : "assistant" as const, content: m.content }));
    // Anthropic 은 첫 메시지가 user여야 함 — 선두의 assistant(구도자) 메시지는 제거
    while (messages.length && messages[0].role === "assistant") messages.shift();
    if (messages.length === 0) messages = [{ role: "user", content: "(전도자가 다가와 인사합니다.)" }];
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: mode === "feedback" ? 700 : 300, system, messages }),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    const detail = upstream ? await upstream.text().catch(() => "") : "";
    return NextResponse.json({ error: "api-failed", detail: detail.slice(0, 300) }, { status: 502 });
  }
  const data = await upstream.json().catch(() => null) as { content?: { type: string; text?: string }[] } | null;
  const reply = (data?.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("").trim();
  if (!reply) return NextResponse.json({ error: "empty" }, { status: 502 });
  return NextResponse.json({ reply });
}
