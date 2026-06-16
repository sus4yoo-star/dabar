// 다바르 서비스워커 — 푸시 알림 + "최신성"과 "오프라인 견고함"을 함께.
//  · 페이지(HTML): 네트워크 우선이되, 성공하면 캐시에 저장하고 실패하면 캐시로 폴백
//    → 배포 후 최신 화면이 바로 뜨면서도, 신호가 약한 선교 현장에서 오프라인에도 앱이 열린다.
//  · 정적 자원(JS/CSS/이미지/폰트): stale-while-revalidate (즉시 캐시 + 백그라운드 갱신)
//  · API(/api/*): 절대 캐시하지 않음 (항상 네트워크)
const SW_VERSION = "2026-06-16-1";
const CACHE = `dabar-rt-${SW_VERSION}`;
const APP_SHELL = "/"; // 오프라인 시 최후 폴백으로 보여줄 셸

self.addEventListener("install", (event) => {
  // 새 서비스워커를 즉시 활성화 (대기 없이)
  self.skipWaiting();
  // 앱 셸을 미리 한 장 받아둔다 (실패해도 무시 — 설치를 막지 않음)
  event.waitUntil(
    caches.open(CACHE).then((c) => c.add(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // 이전 버전 캐시만 제거 (현재 버전 런타임 캐시는 유지 → 오프라인 능력 보존)
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    } catch (e) { /* ignore */ }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // API는 캐시 금지 — 항상 네트워크 (오프라인이면 그대로 실패시켜 클라이언트가 처리)
  if (url.pathname.startsWith("/api/")) return;
  // 외부 도메인(번역 등)은 건드리지 않음
  if (url.origin !== self.location.origin) return;

  // 페이지 이동: 항상 네트워크 우선(최신 보장). 오프라인이면 미리 받아둔 앱 셸로만 폴백
  // → 개인화된 HTML을 URL별로 저장하지 않아 "stale 로그인 화면" 노출 위험이 없다.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(APP_SHELL)) ||
          new Response("오프라인입니다. 네트워크를 확인해 주세요.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // 정적 자원: stale-while-revalidate
  if (/\.(?:js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => null);
      return cached || (await network) ||
        new Response("", { status: 504 });
    })());
  }
});

// ── 푸시 알림 ───────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || "다바르";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "/share/me" },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/share/me";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate(url); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
