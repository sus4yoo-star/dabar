"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { PageHeader, AccentCard, ACCENT, softCard, softShadow } from "@/lib/ui";

const STEPS = [
  { emoji: "🙌", tk: "g.step1t", dk: "g.step1d", accent: ACCENT.green },
  { emoji: "📖", tk: "g.step2t", dk: "g.step2d", accent: ACCENT.blue },
  { emoji: "💧", tk: "g.step3t", dk: "g.step3d", accent: ACCENT.blue },
  { emoji: "✝️", tk: "g.step4t", dk: "g.step4d", accent: ACCENT.amber },
];

export default function GuidePage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <main className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "1rem 1.25rem 2.5rem", minHeight: "100dvh" }}>
      <PageHeader title={t("g.title")} onHome={() => router.push("/")} homeLabel={t("common.home")} />

      {/* 히어로 — 홈 스타일 아이콘 칩 */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ width: 62, height: 62, margin: "0 auto 10px", borderRadius: 19, background: "linear-gradient(135deg,#e7f7ee 0%,#e9f4fd 100%)", display: "grid", placeItems: "center", fontSize: 30, boxShadow: "0 12px 26px rgba(31,155,239,0.20)" }}>📋</div>
        <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>{t("g.sub")}</p>
      </div>

      {/* 단계 — 홈 메뉴 카드 스타일 (번호 + 컬러 아이콘 칩) */}
      <div>
        {STEPS.map((s, i) => (
          <AccentCard
            key={s.tk}
            icon={s.emoji}
            title={`${i + 1}. ${t(s.tk)}`}
            sub={t(s.dk)}
            accent={s.accent}
            right={<span aria-hidden style={{ flexShrink: 0, fontSize: 14, fontWeight: 800, color: s.accent.fg, opacity: 0.55 }}>{i + 1}/{STEPS.length}</span>}
          />
        ))}
      </div>

      {/* 콜아웃 */}
      <div className="fade-in-2" style={{ ...softCard({ marginTop: "1.4rem", padding: "15px 17px", background: ACCENT.green.bg, border: `1px solid ${theme.goldBorder}` }) }}>
        <p style={{ fontSize: 13.5, color: theme.text, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>
          {t("g.callout")}
        </p>
      </div>

      {/* 과정 바로가기 */}
      <div style={{ display: "flex", gap: 10, marginTop: "1.4rem" }}>
        {[
          { tk: "g.btnNew", to: "/course/newcomer" },
          { tk: "g.btnBap", to: "/course/baptism" },
          { tk: "g.btnConf", to: "/course/confirmation" },
        ].map((b) => (
          <button key={b.tk} onClick={() => router.push(b.to)}
            style={{ flex: 1, padding: "13px 8px", fontSize: 14, fontWeight: 800, background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, cursor: "pointer", boxShadow: softShadow, whiteSpace: "nowrap" }}>
            {t(b.tk)}
          </button>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: 11.5, color: theme.textFaint, marginTop: "2rem" }}>{t("g.footer")}</p>
    </main>
  );
}
