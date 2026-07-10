# DABAR — iOS 앱스토어 출시 가이드

DABAR는 Next.js 웹앱입니다. 애플 앱스토어에는 **Capacitor로 네이티브 래핑**해서 올립니다.
이 앱은 라이브 사이트(`https://dabar.theamov.com`)를 네이티브 WebView로 로드하는 방식이라,
**웹을 배포하면 앱 내용도 자동 갱신**됩니다. (`capacitor.config.json`의 `server.url`)

> ⚠️ 아래 **A. 코드/문서**는 이미 저장소에 준비됨. **B~E는 Mac + Xcode + 애플 개발자 계정**이 필요(직접 진행).

---

## A. 이미 준비된 것 (저장소)
- `capacitor.config.json` — appId `com.theamov.dabar`, server.url = 라이브 사이트
- 개인정보 처리방침 `/privacy` (한/영)
- 앱 내 **계정 삭제** `/account` (애플 필수)
- **애플 로그인** 버튼 (`/login`)
- PWA 매니페스트 보강

## B. 사전 준비 (1회)
1. **Mac + Xcode**(App Store에서 설치) + Command Line Tools
2. **Apple Developer Program** 가입 ($99/년) — https://developer.apple.com/programs/
3. CocoaPods: `sudo gem install cocoapods` (또는 `brew install cocoapods`)

## C. Capacitor iOS 프로젝트 생성 (Mac에서, 저장소 루트)
```bash
# 1) Capacitor 설치
npm i @capacitor/core
npm i -D @capacitor/cli
npm i @capacitor/ios

# 2) iOS 네이티브 프로젝트 생성 (capacitor.config.json 을 사용함)
npx cap add ios

# 3) 동기화 (설정/플러그인 반영)
npx cap sync ios

# 4) Xcode 열기
npx cap open ios
```
> `ios/` 폴더가 생성됩니다. 이 폴더는 커밋해도 되고(권장) `.gitignore` 해도 됩니다.

## D. Xcode 설정
1. **Signing & Capabilities**
   - Team 선택(개발자 계정), Bundle Identifier = `com.theamov.dabar`
   - **+ Capability → Sign in with Apple** 추가 (애플 로그인 쓰므로 필수)
   - **+ Capability → Push Notifications** (푸시 알림 쓸 경우)
2. **앱 아이콘 / 런치 스크린**
   - `Assets.xcassets`에 1024×1024 앱 아이콘 등록 (로고: `public/icons/icon-512.png` 기반으로 1024 제작)
   - 런치 스크린 배경 흰색(#ffffff)
3. **Info.plist**
   - `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` — 모임 사진 업로드 시 갤러리/카메라 접근 문구(한국어) 추가
   - 디스플레이 이름(Display Name): `다바르`
4. 실기기/시뮬레이터로 빌드 → 로그인·소그룹·사진·전도까지 동작 확인

## E. 애플/Supabase 연동 (로그인·삭제가 실제로 되려면)
1. **Sign in with Apple (Supabase)**
   - Apple Developer: App ID(Sign in with Apple 체크) + **Service ID** + Key(.p8) 생성
   - Supabase → Authentication → Providers → **Apple** 활성화: Service ID, Team ID, Key ID, .p8 입력
   - Redirect URL: `https://<프로젝트>.supabase.co/auth/v1/callback` 등록
   - ⚠️ **iOS 네이티브 로그인 필수 설정**: Apple provider 의 **Authorized Client IDs**(허용 클라이언트 ID)에
     Services ID(`com.theamov.dabar.signin`)뿐 아니라 **앱 번들 ID `com.theamov.dabar` 도 함께** 넣는다.
     네이티브 시트가 발급하는 identity token 의 audience 는 번들 ID 라서, 이게 빠지면
     `signInWithIdToken` 이 "unauthorized client" 로 거절된다. (2.1 반려의 핵심 원인)

> **Apple 로그인 방식 (2.1 반려 대응, 2026-07 변경)**
> iOS 앱에서는 웹 팝업(SFSafariViewController)이 아니라 **네이티브 Sign in with Apple 시트**로 로그인한다.
> (`@capacitor-community/apple-sign-in` → Supabase `signInWithIdToken`). iPad 에서 인앱 브라우저가
> 빈 화면으로 떠 로그인이 안 되던 반려 문제를 근본 해결. 재빌드 시:
> ```bash
> npm i @capacitor-community/apple-sign-in   # package.json 에 이미 추가됨
> npx cap sync ios                            # 플러그인 pod 반영
> ```
> Xcode 에서 **Signing & Capabilities → Sign in with Apple** capability 가 켜져 있어야 한다(D-1).
> 플러그인이 없는 옛 빌드/안드로이드/웹에서는 자동으로 기존 웹 OAuth 방식으로 폴백한다.
2. **계정 삭제 RPC** — Supabase SQL Editor에서 `supabase/account-delete.sql` 실행
3. (소그룹/사진 쓰면) `supabase/besora-groups.sql`, `supabase/besora-group-photos.sql`도 적용

## F. App Store Connect 제출
1. https://appstoreconnect.apple.com → 앱 생성 (Bundle ID `com.theamov.dabar`)
2. **개인정보 처리방침 URL**: `https://dabar.theamov.com/privacy`
3. **App Privacy(데이터 수집 라벨)**: 계정(이메일·식별자), 사용자 콘텐츠(사진·메시지), 사용 데이터 → "앱 기능"용, 추적 안 함
4. **스크린샷**: 6.7"/6.5"/5.5" (홈·소그룹·전도·성경읽기 등)
5. **심사 메모(App Review Notes)**: 테스트 계정 제공, "복음 전도·양육·소그룹 커뮤니티 앱" 설명
6. Xcode → Product → Archive → Distribute App → App Store Connect 업로드 → 심사 제출

## G. 심사에서 자주 막히는 포인트 (대비됨/주의)
- **4.2 최소 기능**: 단순 웹뷰 반려 방지 → 네이티브 푸시/공유/사진 등 "앱다움" 강조. (DABAR는 푸시·사진 있음)
- **4.8 애플 로그인 필수**: 구글/카카오 쓰므로 **Sign in with Apple 필수** → 준비됨(E-1 설정 필요)
- **2.1(a) Sign in with Apple 동작 불가(iPad 반려)**: 원인은 인앱 웹 팝업이 iPad 에서 빈 화면으로
  뜬 것 → **네이티브 Apple 시트로 전환해 해결**(E-1 박스). 재빌드 + Supabase Authorized Client IDs 에
  번들 ID 추가가 반드시 함께 되어야 실제로 통과된다.
- **5.1.1(v) 계정 삭제 필수**: `/account`에 있음 → E-2 SQL 적용 필요
- **개역개정 본문**: 라이선스 전엔 절대 포함 금지(현재 "준비 중"이라 안전)
- 결제 없음(무료) → IAP 이슈 없음

---

## 대안 (더 빠른 배포 경로)
- **iOS PWA**: 지금도 Safari에서 "홈 화면에 추가"로 앱처럼 설치 가능(스토어 불필요)
- **Android Play 스토어**: PWA를 **TWA**(Bubblewrap / PWABuilder)로 더 쉽게 등록 가능
