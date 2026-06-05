# 로그인 · 점수 · 랭킹 · 공유 설정 가이드

이번 변경으로 **카카오/구글 로그인, 점수 저장, 랭킹, 결과 이미지 저장, 카카오 공유** 기능의
*코드*가 모두 추가되었습니다. 다만 로그인과 카카오 공유는 **외부 서비스 키 발급·설정**이 있어야
실제로 동작합니다. 아래 순서대로 진행해 주세요. (개발 지식이 많지 않아도 따라 할 수 있게 적었습니다.)

> ✅ = 코드로 이미 끝남 / 🔧 = 사용자가 대시보드에서 해줘야 함

---

## 0. 한눈에 — 무엇을 해야 하나
| 기능 | 코드 | 사용자가 할 일 |
|------|:---:|------|
| 점수 저장 · 랭킹 | ✅ | 🔧 Supabase에 표(table) 만들기 (SQL 한 번 실행) |
| 결과 이미지 저장 | ✅ | (없음 — 바로 동작) |
| 구글 로그인 | ✅ | 🔧 구글 OAuth 키 발급 → Supabase에 입력 |
| 카카오 로그인 | ✅ | 🔧 카카오 OAuth 키 발급 → Supabase에 입력 |
| 카카오 공유 | ✅ | 🔧 카카오 JavaScript 키를 환경변수에 입력 |

---

## 1. 🔧 데이터베이스 표 만들기 (점수·랭킹·프로필)
1. Supabase 대시보드 → **SQL Editor** 접속
2. 이 저장소의 **`supabase/schema.sql`** 파일 내용을 복사해 붙여넣고 **Run**
   - 이미 `questions` 표가 있어도 `if not exists` 라서 안전합니다.
   - 새로 `profiles`(프로필), `scores`(점수 기록), `leaderboard`(랭킹 뷰)가 생성됩니다.
3. 보안 규칙(RLS)도 함께 적용됩니다:
   - 점수/프로필은 **누구나 읽기**(랭킹 표시용), **본인 것만 저장/수정** 가능

이것만 하면 **점수 저장·랭킹**은 동작합니다. (로그인은 아래에서)

---

## 2. 🔧 구글 로그인 켜기
1. **Google Cloud Console** → "API 및 서비스" → "사용자 인증 정보"
2. **OAuth 클라이언트 ID** 만들기 (애플리케이션 유형: 웹)
3. **승인된 리디렉션 URI** 에 아래 주소 추가
   ```
   https://<프로젝트>.supabase.co/auth/v1/callback
   ```
   (정확한 주소는 Supabase → Authentication → Providers → Google 화면에 표시됩니다)
4. 발급된 **클라이언트 ID / 시크릿** 을 Supabase → **Authentication → Providers → Google** 에 입력하고 **켜기(Enable)**

---

## 3. 🔧 카카오 로그인 켜기
1. **카카오 개발자센터(developers.kakao.com)** → 애플리케이션 만들기
2. **카카오 로그인** 활성화, **Redirect URI** 에 아래 추가
   ```
   https://<프로젝트>.supabase.co/auth/v1/callback
   ```
3. **동의 항목**에서 닉네임/프로필 사진을 받도록 설정(랭킹 이름 표시에 사용)
4. **REST API 키**(+ 필요 시 Client Secret)를 Supabase → **Authentication → Providers → Kakao** 에 입력하고 **켜기**

> 참고: 카카오 *로그인*은 Supabase를 통해 처리되고, 카카오 *공유*는 아래의 JavaScript 키를 따로 씁니다. 둘은 다릅니다.

---

## 4. 🔧 카카오 공유 켜기
1. 같은 카카오 앱에서 **JavaScript 키** 복사
2. **플랫폼 → Web** 에 우리 서비스 도메인 등록 (예: `https://dabar.app`, 개발 중이면 `http://localhost:3000`)
3. 환경변수 `NEXT_PUBLIC_KAKAO_JS_KEY` 에 그 키를 넣기 (아래 5번)
   - 키가 없으면 공유 버튼을 눌렀을 때 "아직 설정되지 않았어요" 안내가 뜹니다(앱은 정상 동작).

---

## 5. 🔧 환경변수 정리 (`.env.local` / 배포 환경)
```bash
# 이미 쓰던 것
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 이번에 추가
NEXT_PUBLIC_SITE_URL=https://dabar.app   # 로그인 후 돌아올 우리 서비스 주소 (개발 중엔 http://localhost:3000)
NEXT_PUBLIC_KAKAO_JS_KEY=...             # 카카오 공유용 JavaScript 키
```
- 배포 플랫폼(예: Vercel)에도 같은 값을 등록하세요.
- **로그인 리디렉션**: Supabase → Authentication → **URL Configuration** 의 *Redirect URLs* 에
  `https://dabar.app/auth/callback` (+ 개발용 `http://localhost:3000/auth/callback`) 를 추가해야
  로그인 후 앱으로 정상 복귀합니다.

---

## 6. 동작 확인 체크리스트
- [ ] `supabase/schema.sql` 실행함
- [ ] 구글/카카오 Provider 를 Supabase 에서 켰음
- [ ] Supabase Redirect URLs 에 `/auth/callback` 추가함
- [ ] `.env.local` / 배포 환경에 4개 환경변수 모두 넣음
- [ ] 로그인 → 퀴즈 풀기 → 결과 화면에 "점수가 저장되었어요" 표시
- [ ] 랭킹 화면에 내 순위가 보임
- [ ] 이미지 저장 버튼으로 PNG 가 받아짐
- [ ] (키 설정 후) 카카오 공유가 열림

---

## 참고 — 랭킹 기준
현재 랭킹은 **누적 정답 수(total_score)** 가 높은 순서이고, 동점이면 **최고 정답률**이 높은 사람이
앞섭니다. "최고 점수 기준" 등 다른 방식을 원하시면 `supabase/schema.sql` 의 `leaderboard` 뷰와
`app/ranking/page.tsx` 의 정렬 기준만 바꾸면 됩니다.
