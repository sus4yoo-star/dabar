# DABAR 안드로이드 출시 — 아주 자세한 단계별 가이드 (비개발자용)

> 맥에서 진행. 조직 계정(AMOV)이라 14일 테스트 없이 바로 정식 출시 가능.
> 막히면 그 화면을 캡처해서 물어보세요.

---

## 0. 준비물 (처음 한 번만 설치)
- **Android Studio** — https://developer.android.com/studio → 다운로드 → 설치. 설치 마법사에서 **"Standard"** 선택(필요 SDK 자동 설치).
- **Node.js (LTS)** — https://nodejs.org → 왼쪽 "LTS" 버튼으로 설치.
- **Git** — 터미널에서 `git --version` 입력. 없으면 뜨는 안내로 "Command Line Tools" 설치.

설치 확인 (터미널 = 응용프로그램 > 유틸리티 > 터미널):
```bash
node -v      # v20 / v22 처럼 숫자 나오면 OK
git --version
```

---

## 1. 코드 내려받기 (내 맥으로)
```bash
cd ~/Desktop
git clone https://github.com/sus4yoo-star/dabar.git
cd dabar
```
- GitHub 로그인 요청 시 **sus4yoo-star** 계정으로.
- 이미 받아둔 적 있으면: `cd ~/Desktop/dabar && git pull`

✅ 정상: `dabar` 폴더가 생기고 파일이 받아짐.

---

## 2. 준비 명령 2개
```bash
npm install
npm run cap:android
```
- `npm install` — 패키지 설치(몇 분).
- `npm run cap:android` — 웹 동기화 후 **Android Studio가 자동으로 열림**.

---

## 3. Android Studio 첫 실행 (자동 세팅 대기)
- 오른쪽 아래 **"Gradle sync"** 진행바가 돕니다 — **몇 분~십여 분** 걸릴 수 있어요(SDK 다운로드). 그냥 기다리세요.
- **"Install missing SDK / Accept license"** 팝업 → **Accept → 설치**.
- 아래에 **"Gradle sync finished"** (에러 없음) 나오면 준비 완료.

⚠️ SDK/Gradle 에러가 뜨면 캡처해서 물어보세요.

---

## 4. 서명 키스토어 만들기 + AAB 빌드
> 키스토어 = 앱의 **인감도장**. **절대 잃어버리면 안 됩니다** (잃으면 앱 업데이트 영구 불가).

1. 상단 메뉴 **Build → Generate Signed App Bundle / APK…**
2. **Android App Bundle** 선택 → **Next**
3. **Create new…** 클릭 후 입력:
   - Key store path: 예 `~/Desktop/dabar-keystore.jks`
   - Password / Confirm: 키스토어 비밀번호 **(기록!)**
   - Alias: 예 `dabar`
   - Key Password: **(기록!)**
   - Validity(years): `25` 이상
   - Certificate: 이름/조직(AMOV) 대충 입력 → **OK**
4. 🔐 **키스토어 파일 + 비밀번호 2개 + alias 를 안전하게 백업** (비밀번호 관리자/클라우드).
5. **Next** → 빌드 종류 **release** 선택 → **Finish**
6. 완료 알림의 **locate** 클릭 → `dabar/android/app/release/app-release.aab` 확인.

✅ 정상: `app-release.aab` 파일 생성 = 업로드할 파일.

---

## 5. Play Console 에서 앱 만들기
1. https://play.google.com/console (AMOV 계정)
2. **앱 만들기**:
   - 앱 이름: **DABAR**
   - 기본 언어: 한국어
   - 앱/게임: **앱** · 무료/유료: **무료**
   - 선언 체크 → **앱 만들기**

---

## 6. 출시 전 필수 항목 (대시보드 체크리스트 따라가기)
왼쪽 대시보드가 순서대로 안내합니다. 주요 항목:
- **앱 액세스**: "특별한 접근 권한 없이 모든 기능 사용 가능" (게스트로 복음 전하기 가능). 로그인 필요한 기능 있으면 테스트 계정 제공.
- **광고**: 광고 **없음**
- **콘텐츠 등급**: 설문 작성 → 전체 이용가
- **타겟층·어린이**: 성인 대상(종교)
- **데이터 안전**: `STORE_LISTING.md` §5 답안 그대로 입력
- **개인정보처리방침**: `https://dabar.theamov.com/privacy`
- **스토어 등록정보**:
  - 앱 이름 / 짧은 설명 / 전체 설명 → `STORE_LISTING.md` §2,§3
  - 앱 아이콘 512: `public/icons/icon-512.png`
  - **그래픽 이미지 1024×500** (필수) — 간단한 배너, 필요하면 제가 만들어 드림
  - **스크린샷** (필수, 최소 2장): 폰에서 `dabar.theamov.com` 접속해 홈·복음전하기·퀴즈·선교여정 화면 캡처 4~8장

---

## 7. 프로덕션 출시
1. 왼쪽 **프로덕션 → 새 버전 만들기**
2. **App Bundle 업로드** → `app-release.aab` 끌어다 놓기
3. 출시명/출시 노트 입력 → 저장
4. **검토를 위해 출시 시작** → 구글 심사(몇 시간~며칠)

---

## 8. 끝나면 저에게 주실 것
1. **앱 무결성 → 앱 서명 → SHA-256 인증서 지문** 복사 → `assetlinks.json` 마무리(STEP ⑤)
2. 막히는 화면 캡처

---

## iOS 는? (안드로이드 다음)
맥에서:
```bash
npx cap add ios
npm run cap:ios     # Xcode 열림
```
그 다음 `STORE_LISTING.md` §7 의 Info.plist 4줄 추가 → Xcode에서 Archive → App Store Connect 업로드. (자세한 iOS 가이드는 안드로이드 끝나고 이어서 안내)
