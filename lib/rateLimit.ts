/**
 * 간단한 메모리 기반 요청 제한 (IP 기준 슬라이딩 윈도우)
 *
 * 주의: 서버리스(Vercel) 환경에서는 인스턴스가 여러 개이고 수시로 재생성되므로
 * 완벽한 차단은 아니며 "1차 방어선" 역할입니다. 강한 보장이 필요하면
 * Upstash Redis 등 외부 저장소 기반으로 교체하세요.
 */
const hits = new Map<string, number[]>();

export function rateLimit(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(ip, recent);
    return false; // 한도 초과
  }
  recent.push(now);
  hits.set(ip, recent);

  // 메모리 누수 방지: 가끔 오래된 IP 정리
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every(t => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
