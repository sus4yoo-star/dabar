// 다바르 서비스워커 — 푸시 알림 + 페이지 항상 최신(network-first)
// iOS에 앱으로 설치하면 옛 HTML이 캐시되어 새 화면이 안 뜨는 문제를 막는다.
const SW_VERSION = "2026-06-15-1";

self.addEventListener("install", () => {
  // 새 서비스워커를 즉시 활성화 (대기 없이)
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // 혹시 남아있는 옛 캐시 모두 제거
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) { /* ignore */ }
    await self.clients.claim();
  })());
});

// 페이지(HTML) 이동 요청은 항상 네트워크 우선 → 배포 후 최신 화면이 바로 뜨도록.
// (API·정적자원은 건드리지 않음)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
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
