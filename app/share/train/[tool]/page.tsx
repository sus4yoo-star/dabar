"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { getTraining } from "@/lib/besora/training";

const GRAD: Record<string, { bg: string; dark?: boolean }> = {
  gold:    { bg: "linear-gradient(135deg,#D9B154,#B0821A)" },
  crimson: { bg: "linear-gradient(135deg,#C2493A,#8C2A20)" },
  parch:   { bg: "linear-gradient(135deg,#EDE7D8,#DAD2BF)", dark: true },
  green:   { bg: "linear-gradient(135deg,#3E9B6E,#236245)" },
  violet:  { bg: "linear-gradient(135deg,#7C6CB0,#534878)" },
};
// 각 도구 색의 진한 전경색(제목·라벨용) — 그라데이션과 어울리는 딥톤
const ACCENT: Record<string, string> = {
  gold: "#8a6410", crimson: "#8C2A20", parch: "#7a6a2e", green: "#236245", violet: "#534878",
};

// 섹션 카드 래퍼
function Card({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: "15px 16px", boxShadow: "0 2px 10px rgba(26,37,48,0.05)" }}>
      {children}
    </section>
  );
}
function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return <p className="serif" style={{ fontSize: 15.5, fontWeight: 800, color, margin: "0 0 10px" }}>{children}</p>;
}

export default function TrainToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = use(params);
  const router = useRouter();
  const { myLang } = useLang();
  const data = getTraining(tool);

  if (!data) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center" }}>
        <p style={{ color: theme.textMuted, marginBottom: 16 }}>교육 자료를 찾을 수 없어요.</p>
        <Link href="/share/train" style={{ color: theme.primary, fontWeight: 700 }}>← 전도자 교육으로</Link>
      </main>
    );
  }

  const g = GRAD[data.color] ?? GRAD.gold;
  const fg = g.dark ? "#2A2440" : "#ffffff";
  const accent = ACCENT[data.color] ?? "var(--t-sacred)";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh" }}>
      <main style={{ padding: "0.6rem 1rem 2.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 상단: ← 목록 + 홈 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32 }}>
          <button onClick={() => (history.length > 1 ? history.back() : router.push("/share/train"))}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span aria-hidden>←</span>{ui(myLang, "trainCta")}
          </button>
          <span style={{ flex: 1 }} />
          <Link href="/" style={{ fontSize: 12.5, fontWeight: 600, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "6px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>{ui(myLang, "home")}</Link>
        </div>

        {/* 도구 히어로(색 정체성) */}
        <div style={{ borderRadius: 20, background: g.bg, padding: "18px 18px 16px" }}>
          <h1 className="serif" style={{ fontSize: 23, fontWeight: 800, color: fg, margin: 0 }}>{data.name}</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: fg, opacity: 0.92 }}>{data.tagline}</p>
        </div>

        {/* 한눈에 */}
        <Card>
          <Label color={accent}>한눈에</Label>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: theme.text }}>{data.overview}</p>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            <Meta k="유래" v={data.origin} />
            <Meta k="이럴 때 강해요" v={data.bestFor} />
          </div>
        </Card>

        {/* 복음의 핵심 */}
        <Card>
          <Label color={accent}>복음의 핵심</Label>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: theme.text }}>{data.gospelCore}</p>
        </Card>

        {/* 단계별 이해 */}
        <Card>
          <Label color={accent}>단계별 이해 — 왜 이 순서인가</Label>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {data.steps.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 11 }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: g.bg, color: fg, fontSize: 12.5, fontWeight: 800, display: "grid", placeItems: "center" }}>{i + 1}</span>
                <div>
                  <p className="serif" style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: theme.text }}>{s.step}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13.5, lineHeight: 1.65, color: theme.textMuted }}>{s.why}</p>
                  {s.verse && <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: accent }}>📖 {s.verse}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* 자주 나오는 질문 & 대답 */}
        <Card>
          <Label color={accent}>자주 나오는 질문 &amp; 대답</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.qa.map((qa, i) => (
              <div key={i}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: theme.text }}>Q. {qa.q}</p>
                <p style={{ margin: "3px 0 0", fontSize: 13.5, lineHeight: 1.65, color: theme.textMuted }}>A. {qa.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 현장 팁 */}
        <Card>
          <Label color={accent}>현장 팁</Label>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: theme.correct }}>이렇게 하세요</p>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
            {data.tipsDo.map((t, i) => <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.text }}>{t}</li>)}
          </ul>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: theme.wrong }}>이건 피하세요</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
            {data.tipsDont.map((t, i) => <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.text }}>{t}</li>)}
          </ul>
        </Card>

        {/* 스스로 점검 */}
        <Card>
          <Label color={accent}>스스로 점검</Label>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {data.selfCheck.map((c, i) => (
              <li key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.6, color: theme.text }}>
                <span aria-hidden style={{ color: accent, fontWeight: 800, flexShrink: 0 }}>☑</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 실전 연결 — 이 도구로 실제 발표 화면 열기 */}
        <Link href={`/share/present/${data.slug}`} style={{ textDecoration: "none" }}>
          <div style={{ borderRadius: 16, background: g.bg, padding: "15px 18px", textAlign: "center", cursor: "pointer" }}>
            <span className="serif" style={{ fontSize: 15.5, fontWeight: 800, color: fg }}>이 도구로 전하러 가기 →</span>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: fg, opacity: 0.9 }}>배운 것을 실제 발표 화면에서 익혀 보세요</p>
          </div>
        </Link>
      </main>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.55 }}>
      <span style={{ flexShrink: 0, fontWeight: 800, color: theme.textMuted, minWidth: 74 }}>{k}</span>
      <span style={{ color: theme.textMuted }}>{v}</span>
    </div>
  );
}
