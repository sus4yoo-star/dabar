// 가벼운 IP 기반 레이트리밋 — 외부 의존성 없음(메모리 슬라이딩 윈도우).
// 목적: 공개 AI/번역 엔드포인트의 남용·비용 폭주 방지.
// 주의: 서버리스(Netlify Functions)에선 인스턴스마다 메모리가 분리되므로 "완벽한" 전역 제한은
//       아니지만, 인스턴스별 폭주를 막아 비용/abuse를 크게 줄인다. 정상 사용은 절대 막지 않게
//       한도를 넉넉히 둔다(SOS 실시간 번역 등이 끊기면 안 됨).
import type { NextRequest } from "next/server";

type Hit = { count: number; reset: number };
const buckets = new Map<string, Hit>();

export function clientIp(req: NextRequest): string {
  // 플랫폼(Netlify)이 설정해 위조 불가능한 헤더를 우선. x-forwarded-for 는 클라이언트가
  // 조작할 수 있어 마지막 폴백으로만 사용 (스푸핑으로 한도 우회 방지).
  const nf = req.headers.get("x-nf-client-connection-ip");
  if (nf) return nf.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

/**
 * @returns { ok, remaining, retryAfter } — ok=false면 한도 초과.
 * windowMs 동안 limit회 허용.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || now >= hit.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    // 가끔 오래된 버킷 정리 (메모리 누수 방지)
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now >= v.reset) buckets.delete(k);
    }
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (hit.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.reset - now) / 1000) };
  }
  hit.count++;
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

/** 요청에 대해 IP+버킷명으로 제한을 적용하는 헬퍼. */
export function limitByIp(req: NextRequest, bucket: string, limit: number, windowMs: number) {
  return rateLimit(`${bucket}:${clientIp(req)}`, limit, windowMs);
}
