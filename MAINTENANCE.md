# DABAR 유지보수 알림 (정기 작업)

## 🍎 Apple 로그인 시크릿 재생성 — ⏰ 2027-01-03 만료

"Sign in with Apple"의 클라이언트 시크릿(JWT)은 애플 정책상 **최대 6개월**이면 만료됩니다.
만료되면 **웹에서 Apple 로그인이 안 됩니다.** 만료 전에 새 시크릿으로 교체하세요.

- **현재 시크릿 발급:** 2026-07-07
- **만료:** **2027-01-03** → 늦어도 **2026년 12월 중순**까지 교체 권장

### 재생성 방법 (1분)
1. 애플에서 받은 키 파일 `AuthKey_73CDD7VMTS.p8` 준비 (최초 발급 시 다운로드한 파일, 안전하게 보관)
2. 새 시크릿 생성:
   ```
   node scripts/gen-apple-secret.mjs /path/to/AuthKey_73CDD7VMTS.p8
   ```
3. 출력된 JWT를 복사 → **Supabase → Authentication → Providers → Apple → "Secret Key (for OAuth)"** 에 붙여넣기 → Save

### 관련 고정값
| 항목 | 값 |
|------|-----|
| Apple Team ID | `5R6884JLHK` |
| Services ID (Supabase Client ID) | `com.theamov.dabar.signin` |
| App Bundle ID | `com.theamov.dabar` |
| Key ID | `73CDD7VMTS` |
| Supabase Callback URL | `https://qniuzcetvyychnmjwtmq.supabase.co/auth/v1/callback` |

> ⚠️ `.p8` 개인키는 저장소에 커밋하지 않습니다. 로컬(내 Mac)에 안전하게 보관하세요.
> 분실 시 애플 개발자 콘솔 Keys 에서 새 키를 발급하고 Key ID 를 갱신해야 합니다.
