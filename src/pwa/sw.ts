/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

/* ======================
   CACHE NAMESPACE
====================== */

const IMG_CACHE = "brawnly-img-v1";
const API_CACHE = "brawnly-api-v1";
const TTL_META = "brawnly-ttl-meta";

/* ======================
   INSTALL
====================== */

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting());
});

/* ======================
   ACTIVATE
====================== */

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

/* ======================
   FETCH ROUTER
====================== */

self.addEventListener("fetch", (event: FetchEvent) => {
  const req = event.request;

  // IMAGE → Cache First
  if (req.destination === "image") {
    event.respondWith(cacheFirst(req));
    return;
  }

  // SUPABASE / API → SWR
  if (req.url.includes("/rest/v1/")) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
});

/* ======================
   CACHE FIRST (Images)
====================== */

async function cacheFirst(req: Request): Promise<Response> {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(req);

  if (cached) return cached;

  try {
    const net = await fetch(req);
    cache.put(req, net.clone());
    return net;
  } catch {
    return new Response("", { status: 504 });
  }
}

/* ======================
   STALE WHILE REVALIDATE
====================== */

async function staleWhileRevalidate(req: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(req);

  const net = fetch(req)
    .then(res => {
      cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) return cached;

  const netRes = await net;
  return netRes ?? new Response("offline", { status: 503 });
}
