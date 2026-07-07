"use client";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const EMAIL = "easyonline0323@gmail.com";

type Sec = { t: string; body: string };
type Doc = { back: string; heading: string; intro: string; sections: Sec[]; contact: string; note?: string };

// 구글/애플 요구사항: 앱·개발자 이름, 삭제 절차, 삭제/보관 데이터 유형·기간을 명시한 공개 페이지.
// 법적 텍스트라 정확 번역을 보장할 수 있는 언어(ko/en/th)만 제공, 그 외는 영어 폴백.
const DOC: Record<string, Doc> = {
  ko: {
    back: "← 뒤로",
    heading: "계정 삭제 안내",
    intro: "DABAR 계정과 계정에 연결된 모든 데이터를 삭제하는 방법입니다.",
    sections: [
      { t: "1. 앱에서 직접 삭제 (권장)", body: "DABAR 앱 실행 → 홈 하단 [내 계정] → [계정 삭제] → 확인. 계정과 모든 데이터가 즉시 영구 삭제됩니다." },
      { t: "2. 이메일로 요청", body: `직접 삭제가 어려우면 가입에 사용한 이메일과 함께 ${EMAIL} 로 "계정 삭제"를 요청해 주세요. 본인 확인 후 처리합니다.` },
      { t: "3. 삭제되는 데이터", body: "프로필(이름·이메일·닉네임·프로필 사진), 성경 퀴즈 점수·진도·오답, 소그룹 정보·그룹 채팅·업로드한 사진, 동행 연결·메시지, 전도 기록 등 계정에 연결된 모든 데이터." },
      { t: "4. 보관 기간", body: "삭제 요청 시 지체 없이 영구 삭제되며 별도로 보관하지 않습니다. (관련 법령상 보관 의무가 있는 경우에 한해 해당 기간 동안만 보관 후 파기)" },
    ],
    contact: "문의:",
  },
  en: {
    back: "← Back",
    heading: "Delete your account",
    intro: "How to delete your DABAR account and all data linked to it.",
    sections: [
      { t: "1. Delete in the app (recommended)", body: "Open the DABAR app → [My Account] at the bottom of Home → [Delete account] → confirm. Your account and all data are permanently deleted immediately." },
      { t: "2. Request by email", body: `If you can't delete it yourself, email ${EMAIL} with the address you signed up with, requesting "account deletion". We process it after verifying your identity.` },
      { t: "3. Data that is deleted", body: "Profile (name, email, nickname, profile photo), Bible-quiz scores/progress/wrong answers, group info/group chat/uploaded photos, companion connections & messages, evangelism records — all data linked to your account." },
      { t: "4. Retention", body: "Upon request, data is permanently deleted without undue delay and is not otherwise retained (kept only for the period required by applicable law, if any, then destroyed)." },
    ],
    contact: "Contact:",
  },
  th: {
    back: "← กลับ",
    heading: "การลบบัญชี",
    intro: "วิธีลบบัญชี DABAR และข้อมูลทั้งหมดที่เชื่อมโยงกับบัญชีของคุณ",
    note: "ฉบับภาษาอังกฤษ/เกาหลีเป็นฉบับอ้างอิงหลัก",
    sections: [
      { t: "1. ลบในแอป (แนะนำ)", body: "เปิดแอป DABAR → [บัญชีของฉัน] ด้านล่างหน้าแรก → [ลบบัญชี] → ยืนยัน บัญชีและข้อมูลทั้งหมดจะถูกลบอย่างถาวรทันที" },
      { t: "2. ขอทางอีเมล", body: `หากลบเองไม่ได้ ส่งอีเมลถึง ${EMAIL} พร้อมอีเมลที่ใช้สมัคร เพื่อขอ "ลบบัญชี" เราจะดำเนินการหลังยืนยันตัวตน` },
      { t: "3. ข้อมูลที่ถูกลบ", body: "โปรไฟล์ (ชื่อ อีเมล ชื่อเล่น รูปโปรไฟล์), คะแนน/ความคืบหน้า/ข้อที่ตอบผิดของควิซ, ข้อมูลกลุ่ม/แชทกลุ่ม/รูปที่อัปโหลด, การเชื่อมต่อและข้อความกับเพื่อนร่วมทาง, บันทึกการประกาศ — ข้อมูลทั้งหมดที่เชื่อมโยงกับบัญชี" },
      { t: "4. ระยะเวลาเก็บรักษา", body: "เมื่อมีคำขอ ข้อมูลจะถูกลบอย่างถาวรโดยไม่ชักช้าและไม่ถูกเก็บไว้ (เก็บเฉพาะตามที่กฎหมายกำหนดเท่านั้น หากมี แล้วทำลาย)" },
    ],
    contact: "ติดต่อ:",
  },
};

export default function DeleteAccountPage() {
  const router = useRouter();
  const { lang } = useI18n();
  const doc = DOC[lang] ?? DOC.en;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "1rem 1.2rem 3rem", minHeight: "100dvh", color: theme.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => (history.length > 1 ? history.back() : router.push("/"))} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{doc.back}</button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{doc.heading}</h1>
      </div>
      <p style={{ fontSize: 12.5, color: theme.textMuted, margin: "0 0 6px" }}>DABAR (다바르) · AMOV</p>
      <p style={{ fontSize: 13.5, color: theme.text, margin: "0 0 20px", lineHeight: 1.6 }}>{doc.intro}</p>
      {doc.note && <p style={{ fontSize: 11.5, color: theme.textFaint, margin: "-12px 0 20px", fontStyle: "italic" }}>{doc.note}</p>}

      {doc.sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15.5, fontWeight: 800, margin: "0 0 8px" }}>{s.t}</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: theme.text, margin: 0, whiteSpace: "pre-line" }}>{s.body}</p>
        </section>
      ))}

      <p style={{ fontSize: 13.5, color: theme.text, margin: "0 0 4px" }}>
        {doc.contact} <a href={`mailto:${EMAIL}`} style={{ color: theme.primarySoft }}>{EMAIL}</a>
      </p>
      <p style={{ fontSize: 11, color: theme.textFaint, marginTop: 28, letterSpacing: 1 }}>DABAR by AMOV · Love Creates Value</p>
    </main>
  );
}
