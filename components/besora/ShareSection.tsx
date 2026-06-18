// 골드 섹션 라벨 — /reach 의 SectionLabel 과 같은 모양(아이콘 + 세리프 소제목 + 가로선).
// share 계열은 besora AppShell 을 쓰므로 lib/ui 의 SectionLabel 대신 동일 스타일을 여기서 제공.
// 컨셉 색은 항상 거룩한 골드(var(--t-sacred)). 문구는 호출부에서 기존 i18n 키로 넘긴다.
import type { ReactNode } from "react";
import MenuIcon from "@/components/MenuIcon";

const SACRED = "var(--t-sacred)";

export default function ShareSection({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 2px 9px" }}>
      <MenuIcon name={icon} size={18} color={SACRED} />
      <span className="serif" style={{ fontSize: 16, fontWeight: 700, color: SACRED, letterSpacing: -0.2 }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: SACRED, opacity: 0.38, marginLeft: 4 }} />
    </div>
  );
}
