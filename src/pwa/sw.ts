/// <reference lib="webworker" />
export {};
declare const self: ServiceWorkerGlobalScope;

const _0x1a2b = "brawnly-img-v1";
const _0x3c4d = "brawnly-api-v1";

self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ⚡ Background Sync Logic (FB Style Offline)
self.addEventListener("sync", (event: any) => {
  if (event.tag === "brawnly-sync" || event.tag === "sync-tag") {
    // Logika pengiriman data antrean ke API dilakukan di sini
    console.log("PWA: Background Sync triggering...");
  }
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.destination === "image") {
    e.respondWith((async () => {
      const c = await caches.open(_0x1a2b);
      const m = await c.match(r);
      if (m) return m;
      try {
        const n = await fetch(r);
        if (n.status === 200) c.put(r, n.clone());
        return n;
      } catch { return new Response("", { status: 504 }); }
    })());
    return;
  }
  if (r.url.includes("/rest/v1/")) {
    e.respondWith((async () => {
      const c = await caches.open(_0x3c4d);
      const m = await c.match(r);
      const n = fetch(r).then((res) => {
        if (res.status === 200) c.put(r, res.clone());
        return res;
      }).catch(() => null);
      return m || (await n) || new Response("offline", { status: 503 });
    })());
    return;
  }
});