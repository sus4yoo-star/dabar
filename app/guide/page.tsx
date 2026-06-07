"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";

const STEPS = [
  { emoji: "🙌", title: "등록교인 (새신자)", desc: "교회에 처음 등록하고 예배에 참여하는 단계입니다. 새신자 과정으로 신앙의 기초를 배웁니다." },
  { emoji: "📖", title: "학습교인 (학습)", desc: "일정 기간 출석한 뒤, 학습 문답을 통해 신앙을 점검받고 '학습'을 받습니다. 세례를 준비하는 단계입니다." },
  { emoji: "💧", title: "세례교인 (세례)", desc: "신앙을 고백하고 세례 문답을 거쳐 세례를 받습니다. 이제 성찬에 참여하는 정식 교인(정회원)이 됩니다." },
  { emoji: "✝️", title: "입교 (유아세례자)", desc: "어려서 유아세례를 받은 '언약의 자녀'는, 자라서 스스로 신앙을 고백함으로 입교하여 세례교인이 됩니다." },
];

export default function GuidePage() {
  const router = useRouter();
  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <button onClick={() => router.push("/")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 14px", cursor: "pointer" }}>← 홈</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>📋</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.gold, margin: "0 0 4px" }}>교인 절차 안내</h1>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>등록 → 학습 → 세례 / 입교 (예장 합동 기준)</p>
      </div>

      <div style={{ position: "relative" }}>
        {STEPS.map((s, i) => (
          <div key={s.title} style={{ display: "flex", gap: 14, marginBottom: i < STEPS.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
              {i < STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: theme.cardBorder, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 2 }}>
              <p style={{ fontSize: 15.5, fontWeight: 800, color: theme.text, margin: "0 0 5px" }}>{i + 1}. {s.title}</p>
              <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: theme.goldLight, border: `1px solid ${theme.goldBorder}`, borderRadius: 14, padding: "14px 16px", marginTop: "1.5rem" }}>
        <p style={{ fontSize: 13.5, color: theme.text, margin: 0, lineHeight: 1.7 }}>
          ✔ 세례·입교교인은 <b>성찬에 참여</b>하고 공동의회 등 교회의 권리와 의무를 함께 집니다.<br />
          ✔ 세부 기간·문답·자격은 <b>교회(당회)마다 차이</b>가 있을 수 있으니 섬기는 교회의 안내를 따르세요.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
        <button onClick={() => router.push("/course/newcomer")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>🌱 새신자</button>
        <button onClick={() => router.push("/course/baptism")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>💧 세례</button>
        <button onClick={() => router.push("/course/confirmation")} style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: 700, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, cursor: "pointer" }}>✝️ 입교</button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: theme.textFaint, marginTop: "2rem" }}>※ 예장 합동 일반 절차 안내(v1). 교회 당회의 지침이 우선합니다.</p>
    </main>
  );
}
