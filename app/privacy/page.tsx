"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";

const EMAIL = "easyonline0323@gmail.com";
const UPDATED = "2026-06-15";

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "1rem 1.2rem 3rem", minHeight: "100dvh", color: theme.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button onClick={() => (history.length > 1 ? history.back() : router.push("/"))} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer" }}>← Back</button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>개인정보 처리방침 · Privacy Policy</h1>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 22 }}>DABAR (다바르) · AMOV · 시행일/Effective: {UPDATED}</p>

      <Section title="1. 수집하는 정보 (Information we collect)">
        <ul style={ul}>
          <li>계정: 소셜 로그인(구글·카카오·Apple) 식별자, 이메일(제공 시), 닉네임·프로필 사진<br/><i>Account: social login (Google/Kakao/Apple) identifier, email (if provided), nickname, profile image.</i></li>
          <li>이용 기록: 성경 퀴즈 점수·진도·오답, 학습 진행<br/><i>Usage: Bible quiz scores/progress/wrong answers, lesson progress.</i></li>
          <li>소그룹·전도: 모임 정보, 그룹 채팅 메시지, 업로드한 사진, 동행 연결·메시지<br/><i>Groups/evangelism: group info, group chat messages, uploaded photos, companion connections & messages.</i></li>
        </ul>
      </Section>

      <Section title="2. 이용 목적 (How we use it)">
        <p style={p}>로그인·서비스 제공, 학습·전도·양육 기능 운영, 랭킹·진도 표시, 알림 발송. 광고 목적의 사용은 하지 않습니다.<br/><i>To provide login and the service, run study/evangelism/discipleship features, show ranking/progress, and send notifications. We do not use your data for advertising.</i></p>
      </Section>

      <Section title="3. 보관·처리 위탁 (Processing & sub-processors)">
        <p style={p}>데이터는 <b>Supabase</b>(인증·데이터베이스·저장소)와 <b>Netlify</b>(호스팅) 인프라에 저장·처리됩니다. 소셜 로그인은 각 제공자(구글·카카오·Apple)의 정책을 따릅니다.<br/><i>Data is stored/processed on <b>Supabase</b> (auth/database/storage) and <b>Netlify</b> (hosting). Social login follows each provider’s policy (Google/Kakao/Apple).</i></p>
      </Section>

      <Section title="4. 제3자 제공 (Sharing)">
        <p style={p}>법령에 따른 경우를 제외하고 개인정보를 제3자에게 판매·제공하지 않습니다.<br/><i>We do not sell or share personal data with third parties, except as required by law.</i></p>
      </Section>

      <Section title="5. 보유 기간 (Retention)">
        <p style={p}>회원 탈퇴(계정 삭제) 시 계정과 관련 데이터는 지체 없이 삭제됩니다.<br/><i>When you delete your account, your account and related data are deleted without undue delay.</i></p>
      </Section>

      <Section title="6. 이용자 권리·계정 삭제 (Your rights & account deletion)">
        <p style={p}>앱 내 <b>계정 → 계정 삭제</b>에서 언제든 직접 계정과 모든 데이터를 영구 삭제할 수 있습니다. 열람·정정 등은 아래 이메일로 요청할 수 있습니다.<br/><i>You can permanently delete your account and all data anytime in <b>Account → Delete account</b>. For access/correction requests, contact us below.</i></p>
      </Section>

      <Section title="7. 아동 (Children)">
        <p style={p}>본 서비스는 일반 이용자를 대상으로 하며, 민감정보를 의도적으로 수집하지 않습니다.<br/><i>The service is intended for general users and does not knowingly collect sensitive data.</i></p>
      </Section>

      <Section title="8. 문의 (Contact)">
        <p style={p}>개인정보 관련 문의: <a href={`mailto:${EMAIL}`} style={{ color: theme.primarySoft }}>{EMAIL}</a></p>
      </Section>

      <p style={{ fontSize: 11, color: theme.textFaint, marginTop: 28, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15.5, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
      {children}
    </section>
  );
}
const p: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.75, color: theme.text, margin: 0 };
const ul: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.8, color: theme.text, margin: 0, paddingInlineStart: 18 };
