# DABAR 앱스토어 배포 가이드 (Capacitor)

DABAR은 Next.js 서버·API가 필요한 앱이라, **네이티브 셸이 `https://dabar.theamov.com` 을 로드**하는 방식으로 패키징한다(오프라인/첫 로딩 시 `capacitor/www/index.html` 골드 로딩 화면이 폴백).

## 계정 (확인 완료)
| | 상태 | 값 |
|---|---|---|
| 🍎 Apple Developer | 활성(개인) | Team ID `5R6884JLHK` · 갱신 2027-06-20 |
| 🤖 Google Play | 활성(**조직 계정** AMOV) | **개인 계정 14일 테스트 요건 면제** |

## 앱 식별자 (공통)
- Bundle / Application ID: **`com.theamov.dabar`**
- 앱 이름: **DABAR**

---

## 이미 세팅된 것 (이 저장소)
- Capacitor 7 설치(`@capacitor/core|cli|ios|android` + splash-screen/status-bar/app)
- `capacitor.config.json` — 원격 URL 로드 + 스플래시(흰 배경) 설정
- `capacitor/www/index.html` — 브랜드 로딩/오프라인 폴백 화면
- **`android/` 네이티브 프로젝트 생성 완료** (Android Studio로 바로 열기 가능)
- npm 스크립트: `cap:sync` · `cap:ios` · `cap:android`

---

## 맥에서 할 일 (빌드·업로드)

> 저장소를 맥에 clone/pull 한 뒤 진행.

### 0) 의존성 설치
```bash
npm install
```

### 1) 앱 아이콘·스플래시 생성 (권장)
```bash
npm i -D @capacitor/assets
# assets/icon.png (1024x1024), assets/splash.png (2732x2732) 준비 후:
npx capacitor-assets generate
```
(※ 소스 1024 아이콘이 필요하면 담당 개발자에게 요청 — 로고 SVG로 생성 가능)

### 2) 🤖 Android (Play Console — 조직 계정이라 테스트 요건 없음)
```bash
npm run cap:android      # = cap sync android && Android Studio 열기
```
Android Studio에서:
1. `Build > Generate Signed Bundle / APK > Android App Bundle`
2. 업로드 키스토어 생성(잘 보관!) → **서명된 `.aab`** 빌드
3. [Play Console](https://play.google.com/console) → 앱 만들기(`com.theamov.dabar`) → 프로덕션에 `.aab` 업로드
4. 스토어 등록정보(설명·스크린샷·개인정보처리방침 URL) 작성 → 심사 제출

**업로드 후**: Play Console → 앱 무결성 → **앱 서명 SHA-256** 복사 → 이 저장소 `public/.well-known/assetlinks.json` 의 `REPLACE_WITH_...` 자리에 붙여넣고 배포(딥링크/도메인 검증용).

### 3) 🍎 iOS (App Store Connect — Mac + Xcode 필수)
```bash
npx cap add ios          # 맥에서 최초 1회 (ios/ 프로젝트 생성)
npm run cap:ios          # = cap sync ios && Xcode 열기
```
사전 준비:
1. [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/identifiers/list) → **App ID `com.theamov.dabar` 등록**
2. [App Store Connect](https://appstoreconnect.apple.com) → 신규 앱 → 플랫폼 iOS · 이름 DABAR · 번들 ID `com.theamov.dabar` · SKU(예: `dabar-ios-001`)

Xcode에서:
1. Signing & Capabilities → Team `5R6884JLHK` 선택(자동 서명)
2. `Product > Archive` → Organizer → **Distribute App** → App Store Connect 업로드
3. App Store Connect에서 스크린샷·설명·개인정보(App Privacy) 작성 → 심사 제출

> ⚠️ **Apple 심사 4.2**: "웹사이트만 감싼 앱"은 반려될 수 있음. DABAR의 **네이티브 기능**(카메라 번역·음성 통역·오프라인·푸시)을 심사 노트에 명시할 것.

---

## 스토어 제출 자료 체크리스트 (공통)
- [ ] 앱 아이콘 1024px
- [ ] 스크린샷(기기별 — iPhone 6.7"/6.5", Android phone 등)
- [ ] 앱 설명·키워드 (한/영/태/라오 권장)
- [ ] 개인정보처리방침 URL → `https://dabar.theamov.com/privacy`
- [ ] 데이터 안전(Google) / App Privacy(Apple) 설문
- [ ] 콘텐츠 등급 · 카테고리(교육/라이프스타일)
