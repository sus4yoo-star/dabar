# AMOV 인프라 인벤토리

> ⚠️ **여기에 비밀번호·API 키·시크릿을 적지 마세요.** "무엇이 어디에 있는지"만 기록.
> 실제 시크릿은 Netlify/Supabase **환경변수**에만 둡니다.

## 계정 / 플랫폼
| 항목 | 위치 | 메모 |
|---|---|---|
| 도메인 | `theamov.com` (+ 서브도메인) | dabar.theamov.com 등 |
| 호스팅 | Netlify | 앱별 사이트, main 머지 시 자동 배포 |
| DB/인증 | Supabase (`dabar` 프로젝트) | besora 스키마, 앱별 분리 여부 `[확인]` |
| 노코드 빌더 | **Lovable** | 셀라·새빛교회 곁에 등 일부 사이트 |
| 모바일 출시 | Apple Developer (1개 계정으로 전 앱) | 멤버십 `[활성/대기]` |
| 번역 | Google Translate API | 런타임 자동번역 |
| 음성 | Azure Speech | TTS/STT |
| AI | Anthropic Claude API | 서버사이드만, 키는 env |

## 환경변수 (Netlify) — 키 이름만
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`, `GOOGLE_TRANSLATE_API_KEY`, `AZURE_SPEECH_KEY/REGION`
- `NEXT_PUBLIC_KAKAO_JS_KEY`, `NEXT_PUBLIC_SITE_URL`
- `VAPID_PRIVATE_KEY` (웹푸시) — `[설정 여부 앱별 확인]`

## Lovable ↔ GitHub
- Lovable로 만든 앱도 **GitHub 연결** 시 깃 레포가 생김 → 거기에 AMOV `CLAUDE.md`·`.claude/agents/` 넣으면 동일 팀이 관리.
- 연결: Lovable 프로젝트 → Settings → GitHub.

## 결제/구독 현황
| 항목 | 주기 | 메모 |
|---|---|---|
| Supabase Pro | 월 | `[금액]` |
| Apple Developer | 연 ₩129,000 | |
| `[그 외]` | | |
