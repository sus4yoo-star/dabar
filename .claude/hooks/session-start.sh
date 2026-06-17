#!/bin/bash
# DABAR — Claude Code on the web 세션 시작 시 의존성 설치.
# 설치가 끝난 뒤 세션이 시작되므로 테스트/타입체크가 바로 동작한다.
set -euo pipefail

# 웹(원격) 세션에서만 실행 — 로컬 개발 환경은 건드리지 않음
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# package-lock.json 기준 설치 (컨테이너 캐시 활용 위해 ci 대신 install)
npm install
