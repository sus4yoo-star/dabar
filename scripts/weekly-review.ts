// 매주 월요일 오전 9시(KST)에 GitHub Actions로 자동 실행되는 주간 점검 스크립트.
// Claude API로 코드를 분석하고, 한국어 리포트를 reports/weekly-YYYY-MM-DD.md에 저장한 뒤
// PR을 자동으로 생성합니다.

import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const today = new Date().toISOString().slice(0, 10);
const branch = `review/weekly-${today}`;
const reportPath = `reports/weekly-${today}.md`;

function readFile(path: string): string {
  try { return readFileSync(path, "utf-8"); } catch { return ""; }
}

function collectSources(): string {
  const files = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/quiz/page.tsx",
    "app/result/page.tsx",
    "app/ranking/page.tsx",
    "app/history/page.tsx",
    "app/admin/page.tsx",
    "app/catechism/page.tsx",
    "app/catechism/quiz/page.tsx",
    "app/api/questions/route.ts",
    "lib/auth.tsx",
    "lib/AuthGate.tsx",
    "lib/supabase.ts",
    "lib/courses.ts",
    "lib/catechism.ts",
    "lib/resultImage.ts",
    "lib/progress.ts",
    "lib/share.ts",
    "lib/types.ts",
    "supabase/schema.sql",
    "scripts/generate-questions.ts",
    ".github/workflows/generate.yml",
    "package.json",
  ];
  return files
    .map(f => { const c = readFile(f); return c ? `\n\n=== ${f} ===\n${c}` : ""; })
    .filter(Boolean)
    .join("");
}

async function generateReport(): Promise<string> {
  const client = new Anthropic();

  const previousReports = existsSync("reports")
    ? readdirSync("reports")
        .filter(f => f.startsWith("weekly-") && f !== `weekly-${today}.md`)
        .sort()
        .slice(-2)
        .map(f => `\n\n=== ${f} ===\n${readFile(join("reports", f))}`)
        .join("")
    : "";

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `당신은 DABAR(다바르) 성경 퀴즈 앱의 주간 코드 점검 전문가입니다.

아래 소스 코드를 분석하여 **비개발자(목사님·운영진)도 이해할 수 있는 한국어**로 주간 점검 리포트를 작성해 주세요.

오늘 날짜: ${today}

## 이전 리포트 (중복 이슈는 "이전에 보고됨" 표시)
${previousReports || "없음"}

## 소스 코드
${collectSources()}

---

## 리포트 형식

아래 구조로 마크다운 파일 내용만 출력하세요 (설명·전문 불필요):

\`\`\`markdown
# DABAR 주간 점검 리포트 — ${today}

> 다바르(DABAR) 성경 퀴즈 앱의 코드를 한 주간 점검한 결과입니다.
> 개발 지식이 없어도 이해하실 수 있도록 풀어서 정리했습니다.
> **이 리포트는 점검 결과만 담고 있으며, 코드는 수정하지 않았습니다.**

---

## 1. 한눈에 보기
(표: 🔴꼭 고쳐야 할 / 🟡미완성·정리 필요 / 🟢더 좋게 만들 점 — 개수·한 줄 요약)
총평: 한 문장

---

## 2. 이번 주 새로 추가된 기능
(없으면 "이번 주 신규 기능 없음"으로 표기)

---

## 3. 발견된 문제 (우선순위 순)

### 🔴 즉시 해결 필요
### 🟡 미완성·개선 권장
### 🟢 더 좋게 만들 점

(각 항목: 무슨 일? / 그래서 뭐가 문제? / 권장 조치)

---

## 4. 이전 리포트 이슈 추적
(표: 이슈 / 이전 현황 / 이번 주 현황)

---

## 5. 출시·운영 관점 — 다음에 하면 좋은 일 (우선순위)
(표: 순위 / 할 일 / 이유 / 예상 난이도)

---

## 6. 잘 되어 있는 점

---

*점검일: ${today} · 점검 대상 브랜치: main 기준 · 본 리포트는 코드를 변경하지 않았습니다.*
\`\`\`

점검 항목: 새 기능 완성도·버그, 보안(인증·입력값 검증), 성능(대량 데이터), 미완성 기능, 데이터 저장 일관성, 운영 안정성.`,
    }],
  });

  return (message.content[0] as { text: string }).text;
}

async function main() {
  console.log(`주간 리포트 생성 시작: ${today}`);

  execSync("git config user.email 'github-actions[bot]@users.noreply.github.com'");
  execSync("git config user.name 'github-actions[bot]'");
  execSync("git fetch origin main");
  execSync(`git checkout -b ${branch} origin/main`);

  console.log("Claude API로 리포트 생성 중...");
  const report = await generateReport();

  execSync("mkdir -p reports");
  writeFileSync(reportPath, report, "utf-8");
  console.log(`리포트 작성 완료: ${reportPath}`);

  execSync(`git add ${reportPath}`);
  execSync(`git commit -m "docs: 주간 점검 리포트 ${today}"`);
  execSync(`git push -u origin ${branch}`);
  console.log(`브랜치 푸시 완료: ${branch}`);

  const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
  if (GITHUB_TOKEN && GITHUB_REPOSITORY) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls`, {
      method: "POST",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `📋 주간 점검 리포트 — ${today}`,
        body: `자동 생성된 주간 점검 리포트입니다.\n\n- 점검일: ${today}\n- 리포트: \`${reportPath}\`\n\n코드는 수정하지 않았습니다. 리포트 파일만 포함되어 있습니다.`,
        head: branch,
        base: "main",
      }),
    });
    const pr = await res.json() as { html_url?: string; message?: string };
    console.log(pr.html_url ? `PR 생성 완료: ${pr.html_url}` : `PR 생성 실패: ${pr.message}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
