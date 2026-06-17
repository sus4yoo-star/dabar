# DABAR — 안드로이드(Google Play) 출시 가이드

DABAR는 배포된 PWA(`https://dabar.theamov.com`)를 **TWA(Trusted Web Activity)** 로 감싸 출시합니다.
앱은 Chrome 엔진으로 사이트를 전체화면 렌더하며, 아래 `assetlinks.json` 인증으로 주소창이 사라집니다.

---

## 0. 준비물 (대부분 완료)
- [x] HTTPS 배포 (`dabar.theamov.com`)
- [x] PWA 매니페스트 (`public/manifest.json` — 아이콘 192/512·maskable·shortcuts·standalone)
- [x] 개인정보처리방침 (`/privacy`)
- [x] 계정 삭제 기능 (계정 화면)
- [x] Google Play 개발자 계정 생성
- [ ] (권장) **조직(Organization) 계정 + D-U-N-S** → "테스터 20명·14일" 테스트 의무 면제

---

## 1. 앱 패키지(.aab) 생성 — PWABuilder (Mac 불필요)
1. https://www.pwabuilder.com 접속 → `https://dabar.theamov.com` 입력 → **Start**
2. 점수 확인 후 **Package For Stores → Android** 선택
3. 패키지 옵션:
   - **Package ID(패키지명)**: `com.theamov.dabar` ← 이 값으로 고정 (assetlinks와 반드시 일치)
   - App name: `DABAR · 다바르`
   - Launcher name: `DABAR`
   - 나머지는 기본값
4. **Download** → `.aab`(업로드용), `.apk`(테스트용), 그리고 **`signing.keystore` + 비밀번호**가 들어옵니다.
   - ⚠️ keystore와 비밀번호는 **분실 시 앱 업데이트가 불가**하니 안전하게 보관하세요.
   - (Play App Signing을 쓰면 구글이 키를 관리하므로 더 안전 — 아래 3번 참고)

## 2. Play Console에서 앱 만들기
1. https://play.google.com/console → **앱 만들기**
2. 앱 이름 `DABAR · 다바르`, 언어 한국어, **앱/무료** 선택
3. 좌측 **앱 콘텐츠**에서 순서대로 작성:
   - 개인정보처리방침 URL: `https://dabar.theamov.com/privacy`
   - 데이터 보안(Data safety): 수집 항목 선언 (예: 이메일/계정 — 로그인용, 소그룹 사진 등)
   - 광고 여부: 없음
   - 콘텐츠 등급 설문
   - 대상 연령(타깃층): 본 앱은 전 연령/종교 콘텐츠
   - 계정 삭제: 앱 내 삭제 지원 + 안내 URL

## 3. Play App Signing → SHA-256 지문으로 assetlinks 채우기 ⭐
1. .aab 업로드 후(내부 테스트 트랙 권장), Play Console → **테스트 및 출시 → 앱 무결성 → 앱 서명**
2. **"앱 서명 키 인증서"의 SHA-256 인증서 지문** 복사 (형식: `AB:CD:...:EF`)
3. 이 저장소의 **`public/.well-known/assetlinks.json`** 의
   `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT` 를 그 지문으로 교체
   - 여러 키(업로드 키 + 앱 서명 키)가 있으면 둘 다 배열에 넣어도 됩니다.
4. 커밋·배포 → `https://dabar.theamov.com/.well-known/assetlinks.json` 가 열리는지 확인
5. 검증: https://developers.google.com/digital-asset-links/tools/generator 로 확인 가능

> assetlinks가 맞아야 앱 실행 시 **주소창이 사라집니다**. 안 맞으면 앱은 동작하되 상단에 URL 바가 보입니다.

## 4. 출시 트랙
- **내부 테스트(Internal testing)**: 즉시, 본인/소수 확인용 → 먼저 여기서 동작 검증
- **비공개 테스트(Closed testing)**: 개인 계정이면 **테스터 20명·14일** 필수 (조직 계정은 면제)
- **프로덕션(Production)**: 정식 출시 (스토어 심사 보통 며칠)

## 5. 스토어 등록 정보 자료
- [ ] 앱 아이콘 512×512 (PNG)
- [ ] 피처 그래픽 1024×500 (PNG/JPG)
- [ ] 휴대폰 스크린샷 최소 2장 (홈·복음전하기·퀴즈 등)
- [ ] 짧은 설명(80자) / 자세한 설명
- [ ] 카테고리: 교육 또는 라이프스타일

---

## 메모
- 패키지명 `com.theamov.dabar` 는 출시 후 **변경 불가** — 처음에 확정.
- iOS(App Store)는 별도: Apple 개발자 계정 활성화 후 Sign in with Apple 추가 → Capacitor 또는 PWABuilder로 진행.
