#!/usr/bin/env bash
#
# DABAR 문제 생성을 GitHub 클라우드(Actions)에서 돌리기 위한 1회용 셋업 스크립트.
#
#   - GitHub CLI(gh) 설치 확인 (없으면 brew로 설치)
#   - 새 토큰으로 gh 로그인 (토큰은 화면에 표시되지 않습니다)
#   - .env.local 의 API 키 3개를 GitHub Secrets 에 등록
#   - 워크플로 파일을 푸시하고, 클라우드 작업을 즉시 시작
#
# 실행:  bash scripts/setup-cloud-generate.sh
#
set -euo pipefail

REPO="sus4yoo-star/dabar"
cd "$(dirname "$0")/.."

echo "▶ 1/6  GitHub CLI 확인..."
if ! command -v gh >/dev/null 2>&1; then
  echo "   gh 가 없어 설치합니다 (brew install gh — 1~2분)..."
  brew install gh
fi
echo "   ✔ gh 준비됨"

echo
echo "▶ 2/6  GitHub 로그인"
echo "   아래에 새로 발급한 토큰을 붙여넣고 Enter 하세요 (입력은 화면에 안 보입니다):"
printf "   Token: "
read -rs TOKEN
echo
# gh auth login --with-token 은 read:org scope 까지 요구하므로 쓰지 않고,
# GH_TOKEN 환경변수로 직접 인증한다 (repo + workflow scope 만으로 충분).
export GH_TOKEN="$TOKEN"
LOGIN="$(gh api user -q .login 2>/dev/null || true)"
if [ -z "$LOGIN" ]; then
  echo "   ✖ 토큰이 유효하지 않습니다. 붙여넣기를 다시 확인하세요 (공백 없이 ghp_ 전체)."
  exit 1
fi
echo "   ✔ 로그인 완료 ($LOGIN)"

echo
echo "▶ 3/6  API 키를 GitHub Secrets 에 등록 (.env.local 에서 읽음)..."
get_env() { grep -E "^$1=" .env.local | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//'; }
for KEY in ANTHROPIC_API_KEY NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_KEY; do
  VAL="$(get_env "$KEY")"
  if [ -z "$VAL" ]; then
    echo "   ✖ .env.local 에서 $KEY 를 찾지 못했습니다. 중단합니다."
    exit 1
  fi
  printf '%s' "$VAL" | gh secret set "$KEY" -R "$REPO"
  echo "   ✔ $KEY 등록됨"
done

echo
echo "▶ 4/6  워크플로 파일 커밋/푸시..."
git add .github/workflows/generate.yml scripts/setup-cloud-generate.sh
if ! git diff --cached --quiet; then
  git commit -m "ci: 클라우드(GitHub Actions) 문제 생성 워크플로 추가" >/dev/null
fi
git push "https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git" HEAD:main
echo "   ✔ 푸시 완료"

echo
echo "▶ 5/6  클라우드 작업 시작..."
gh workflow run generate.yml -R "$REPO"
sleep 4

echo
echo "▶ 6/6  실행 상태:"
gh run list --workflow generate.yml -R "$REPO" --limit 1
echo
echo "✅ 끝! 노트북 꺼도 클라우드에서 계속 생성됩니다."
echo "   진행 상황 보기:  https://github.com/$REPO/actions"
echo "   터미널에서 보기:  gh run watch -R $REPO"
