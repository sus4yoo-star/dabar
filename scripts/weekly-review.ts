/**
 * 주간 코드 점검 리포트 자동 생성 스크립트
 *
 * GitHub Actions에서 매주 월요일 자동 실행됩니다.
 * 사용법 (수동 실행): npx tsx scripts/weekly-review.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FILES_TO_REVIEW = [
  "app/api/questions/route.ts",
  "app/page.tsx",
  "app/quiz/page.tsx",
  "app/result/page.tsx",
  "app/layout.tsx",
  "lib/types.ts",
  "lib/supabase.ts",
  "lib/theme.ts",
  "scripts/generate-questions.ts",
  ".github/workflows/generate.yml",
  "supabase/schema.sql",
  "public/manifest.json",
  "package.json",
];

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), "utf-8");
  } catch {
    return `[파일 없음: ${filePath}]`;
  }
}

function checkPublicDir(): string[] {
  const issues: string[] = [];
  const iconsDir = path.join(process.cwd(), "public", "icons");
  if (!fs.existsSync(iconsDir)) issues.push("public/icons/ 디렉토리 없음 (PWA 아이콘 누락)");
  else {
    if (!fs.existsSync(path.join(iconsDir, "icon-192.png"))) issues.push("public/icons/icon-192.png 없음");
    if (!fs.existsSync(path.join(iconsDir, "icon-512.png"))) issues.push("public/icons/icon-512.png 없음");
  }
  return issues;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const reportDir = path.join(process.cwd(), "reports");
  const reportPath = path.join(reportDir, `weekly-${today}.md`);

  fs.mkdirSync(reportDir, { recursive: true });

  const codeContext = FILES_TO_REVIEW
    .map(f => `### ${f}\n\`\`\`\n${readFile(f)}\n\`\`\``)
    .join("\n\n");

  const extraChecks = checkPublicDir();
  const extraSection = extraChecks.length
    ? `\n추가 파일 점검 결과:\n${extraChecks.map(i => `- ⚠️ ${i}`).join("\n")}`
    : "\n추가 파일 점검: 이슈 없음";

  const prompt = `당신은 시니어 풀스택 개발자이자 출시 관리자입니다.
아래 성경 퀴즈 웹 앱(DABAR)의 전체 코드를 꼼꼼히 검토하고,
비개발자(기획자, 목사님, 일반 사용자)도 이해할 수 있는 한국어 주간 점검 리포트를 작성해 주세요.
전문 용어는 반드시 쉬운 말로 설명하고, 각 항목에 사용자 영향을 명시하세요.

오늘 날짜: ${today}

아래 마크다운 형식을 정확히 지켜서 작성하세요:

---
# 다바르(DABAR) 주간 코드 점검 리포트

**날짜:** ${today}
**점검자:** 자동화 AI 점검 시스템
**대상:** 다바르 성경 퀴즈 웹 앱

---

## 요약
(전체 상태를 2~3줄로 요약)

## 1. 발견된 버그 및 오류
(각 항목: **[심각도: 높음/중간/낮음]** 제목, 설명, 사용자 영향)

## 2. 미완성 또는 작동하지 않는 기능
(각 항목: 설명, 사용자 영향)

## 3. 보안 취약점
(각 항목: **[심각도: 높음/중간/낮음]** 제목, 쉬운 설명, 권고 사항)

## 4. 성능 개선 포인트
(각 항목: 설명, 절약 효과 예상)

## 5. 출시/운영 관점 우선순위 제안
(표 형식으로 우선순위 5개: 순위, 항목, 이유, 예상 작업 규모)

## 6. 전체 평가
**점수: X / 10**
> 한 줄 총평

---
*이 리포트는 자동화 AI 시스템이 매주 월요일 생성합니다.*

=== 검토 코드 ===

${codeContext}

=== 추가 환경 점검 ===
${extraSection}`;

  console.log("🔍 코드 분석 중...");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content.find(b => b.type === "text");
  const report = block?.type === "text" ? block.text : "## 오류\n리포트 생성에 실패했습니다.";

  fs.writeFileSync(reportPath, report, "utf-8");
  console.log(`✅ 리포트 생성 완료: reports/weekly-${today}.md`);
}

main().catch(e => {
  console.error("❌ 오류:", e);
  process.exit(1);
});
