"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const EMAIL = "hello@theamov.com";
const UPDATED = "2026-06-15";

type Sec = { t: string; body: string };
type Doc = { back: string; heading: string; effective: string; sections: Sec[]; note?: string };

// 선택 언어로 표시 (지원: ko/en/th). 그 외 언어(라오 등)는 영어로 폴백 —
// 법적 텍스트라 정확 번역을 보장할 수 있는 언어만 제공한다.
const DOC: Record<string, Doc> = {
  ko: {
    back: "← 뒤로",
    heading: "개인정보 처리방침",
    effective: `시행일: ${UPDATED}`,
    sections: [
      { t: "1. 수집하는 정보", body: "• 계정: 소셜 로그인(구글·카카오·Apple) 식별자, 이메일(제공 시), 닉네임·프로필 사진\n• 이용 기록: 성경 퀴즈 점수·진도·오답, 학습 진행\n• 소그룹·전도: 모임 정보, 그룹 채팅 메시지, 업로드한 사진, 동행 연결·메시지\n• 교회 연결 요청 시(선택): 이름·연락처·지역 — 교회 소개 목적에만 사용하고 완료 후 파기" },
      { t: "2. 이용 목적", body: "로그인·서비스 제공, 학습·전도·양육 기능 운영, 랭킹·진도 표시, 알림 발송. 광고 목적의 사용은 하지 않습니다." },
      { t: "3. 보관·처리 위탁", body: "데이터는 Supabase(인증·데이터베이스·저장소)와 Netlify(호스팅) 인프라에 저장·처리됩니다. 소셜 로그인은 각 제공자(구글·카카오·Apple)의 정책을 따릅니다." },
      { t: "4. 제3자 제공", body: "법령에 따른 경우를 제외하고 개인정보를 제3자에게 판매·제공하지 않습니다." },
      { t: "5. 보유 기간", body: "회원 탈퇴(계정 삭제) 시 계정과 관련 데이터는 지체 없이 삭제됩니다." },
      { t: "6. 이용자 권리·계정 삭제", body: "앱 내 [계정 → 계정 삭제]에서 언제든 직접 계정과 모든 데이터를 영구 삭제할 수 있습니다. 열람·정정 등은 아래 이메일로 요청할 수 있습니다." },
      { t: "7. 아동", body: "본 서비스는 일반 이용자를 대상으로 하며, 민감정보를 의도적으로 수집하지 않습니다." },
      { t: "8. 문의", body: "개인정보 관련 문의:" },
    ],
  },
  en: {
    back: "← Back",
    heading: "Privacy Policy",
    effective: `Effective: ${UPDATED}`,
    sections: [
      { t: "1. Information we collect", body: "• Account: social login (Google/Kakao/Apple) identifier, email (if provided), nickname, profile image.\n• Usage: Bible quiz scores/progress/wrong answers, lesson progress.\n• Groups/evangelism: group info, group chat messages, uploaded photos, companion connections & messages.\n• Church-connection requests (optional): name, contact, area — used only to introduce a church, then deleted." },
      { t: "2. How we use it", body: "To provide login and the service, run study/evangelism/discipleship features, show ranking/progress, and send notifications. We do not use your data for advertising." },
      { t: "3. Processing & sub-processors", body: "Data is stored and processed on Supabase (auth/database/storage) and Netlify (hosting). Social login follows each provider’s policy (Google/Kakao/Apple)." },
      { t: "4. Sharing", body: "We do not sell or share personal data with third parties, except as required by law." },
      { t: "5. Retention", body: "When you delete your account, your account and related data are deleted without undue delay." },
      { t: "6. Your rights & account deletion", body: "You can permanently delete your account and all data anytime in [Account → Delete account]. For access/correction requests, contact us below." },
      { t: "7. Children", body: "The service is intended for general users and does not knowingly collect sensitive data." },
      { t: "8. Contact", body: "Privacy inquiries:" },
    ],
  },
  th: {
    back: "← กลับ",
    heading: "นโยบายความเป็นส่วนตัว",
    effective: `มีผลบังคับใช้: ${UPDATED}`,
    note: "ฉบับภาษาอังกฤษ/เกาหลีเป็นฉบับอ้างอิงหลัก",
    sections: [
      { t: "1. ข้อมูลที่เราเก็บ", body: "• บัญชี: ตัวระบุการเข้าสู่ระบบผ่านโซเชียล (Google/Kakao/Apple), อีเมล (ถ้ามี), ชื่อเล่น, รูปโปรไฟล์\n• การใช้งาน: คะแนน/ความคืบหน้า/ข้อที่ตอบผิดของควิซพระคัมภีร์, ความคืบหน้าบทเรียน\n• กลุ่ม/การประกาศ: ข้อมูลกลุ่ม, ข้อความแชทกลุ่ม, รูปที่อัปโหลด, การเชื่อมต่อและข้อความกับเพื่อนร่วมทาง\n• คำขอเชื่อมต่อคริสตจักร (ไม่บังคับ): ชื่อ ช่องทางติดต่อ พื้นที่ — ใช้เพื่อแนะนำคริสตจักรเท่านั้น แล้วลบทิ้ง" },
      { t: "2. วิธีที่เราใช้ข้อมูล", body: "เพื่อให้บริการเข้าสู่ระบบและบริการต่าง ๆ ใช้งานฟีเจอร์การเรียนรู้/ประกาศ/เสริมสร้าง แสดงอันดับ/ความคืบหน้า และส่งการแจ้งเตือน เราไม่ใช้ข้อมูลของคุณเพื่อการโฆษณา" },
      { t: "3. การจัดเก็บและผู้ประมวลผล", body: "ข้อมูลถูกจัดเก็บและประมวลผลบน Supabase (การยืนยันตัวตน/ฐานข้อมูล/ที่จัดเก็บ) และ Netlify (โฮสติ้ง) การเข้าสู่ระบบผ่านโซเชียลเป็นไปตามนโยบายของผู้ให้บริการแต่ละราย (Google/Kakao/Apple)" },
      { t: "4. การเปิดเผยต่อบุคคลที่สาม", body: "เราไม่ขายหรือแบ่งปันข้อมูลส่วนบุคคลกับบุคคลที่สาม ยกเว้นที่กฎหมายกำหนด" },
      { t: "5. ระยะเวลาเก็บรักษา", body: "เมื่อคุณลบบัญชี บัญชีและข้อมูลที่เกี่ยวข้องจะถูกลบโดยไม่ชักช้า" },
      { t: "6. สิทธิของคุณและการลบบัญชี", body: "คุณสามารถลบบัญชีและข้อมูลทั้งหมดอย่างถาวรได้ตลอดเวลาที่ [บัญชี → ลบบัญชี] สำหรับคำขอเข้าถึง/แก้ไข โปรดติดต่อเราด้านล่าง" },
      { t: "7. เด็ก", body: "บริการนี้มีไว้สำหรับผู้ใช้ทั่วไป และไม่เก็บข้อมูลอ่อนไหวโดยเจตนา" },
      { t: "8. ติดต่อ", body: "สอบถามเรื่องความเป็นส่วนตัว:" },
    ],
  },
};

export default function PrivacyPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const doc = DOC[lang] ?? DOC.en;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "1rem 1.2rem 3rem", minHeight: "100dvh", color: theme.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button onClick={() => (history.length > 1 ? history.back() : router.push("/"))} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{doc.back}</button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{doc.heading}</h1>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: doc.note ? 6 : 22 }}>DABAR (다바르) · AMOV · {doc.effective}</p>
      {doc.note && <p style={{ fontSize: 11.5, color: theme.textFaint, marginBottom: 22, fontStyle: "italic" }}>{doc.note}</p>}

      {doc.sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15.5, fontWeight: 800, margin: "0 0 8px" }}>{s.t}</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: theme.text, margin: 0, whiteSpace: "pre-line" }}>
            {s.body}
            {i === doc.sections.length - 1 && <> <a href={`mailto:${EMAIL}`} style={{ color: theme.primarySoft }}>{EMAIL}</a></>}
          </p>
        </section>
      ))}

      <p style={{ fontSize: 11, color: theme.textFaint, marginTop: 28, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
