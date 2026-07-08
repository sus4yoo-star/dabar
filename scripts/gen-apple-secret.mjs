// Apple "Sign in with Apple" 클라이언트 시크릿(JWT) 생성기.
// Supabase Authentication → Providers → Apple → "Secret Key (for OAuth)" 에 넣는 값.
// 이 시크릿은 애플 정책상 최대 6개월이면 만료되므로 주기적으로 재생성해야 한다.
//
// 사용법:
//   node scripts/gen-apple-secret.mjs /path/to/AuthKey_XXXXXXXXXX.p8 [KEY_ID]
//   (KEY_ID 를 생략하면 파일명 AuthKey_<KEYID>.p8 에서 자동 추출)
//
// 고정값(우리 앱):
const TEAM_ID   = "5R6884JLHK";                 // Apple Developer Team ID
const CLIENT_ID = "com.theamov.dabar.signin";   // Services ID (Supabase Client ID)
const DAYS      = 180;                            // 만료(최대 ~6개월)

import crypto from "crypto";
import { readFileSync } from "fs";
import { basename } from "path";

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("사용법: node scripts/gen-apple-secret.mjs <AuthKey_XXXX.p8 경로> [KEY_ID]");
  process.exit(1);
}
const keyId = process.argv[3] || (basename(keyPath).match(/AuthKey_([A-Z0-9]+)\.p8/i)?.[1]);
if (!keyId) {
  console.error("KEY_ID 를 찾을 수 없습니다. 두 번째 인자로 직접 넣어주세요.");
  process.exit(1);
}

const key = readFileSync(keyPath, "utf8");
const now = Math.floor(Date.now() / 1000);
const exp = now + 60 * 60 * 24 * DAYS;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const header = { alg: "ES256", kid: keyId };
const payload = { iss: TEAM_ID, iat: now, exp, aud: "https://appleid.apple.com", sub: CLIENT_ID };
const input = b64(header) + "." + b64(payload);
const sig = crypto.createSign("SHA256").update(input).sign({ key, dsaEncoding: "ieee-p1363" }).toString("base64url");

console.log("=== CLIENT SECRET (JWT) — Supabase Apple provider 에 붙여넣기 ===");
console.log(input + "." + sig);
console.log("");
console.log("발급:", new Date(now * 1000).toISOString());
console.log("만료:", new Date(exp * 1000).toISOString(), `(이 전에 재생성)`);
