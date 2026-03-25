/// <reference lib="webworker" />
export {};
declare const self: ServiceWorkerGlobalScope;

// ── Cache names — harus identik dengan public/sw.js ─────────────────────────
const IMG_CACHE = "brawnly-img-v5";
const API_CACHE = "brawnly-api-v5";
const API_QUEUE = "brawnly-api-queue";
const NAV_CACHE = "brawnly-nav-v1";

// ── TTL: 1 jam ───────────────────────────────────────────────────────────────
const TTL = 60 * 60 * 1000;

// ── SPA routes yang ditangani oleh navigasi SW ───────────────────────────────
const SPA_ROUTES = [
  "/",
  "/articles",
  "/videos",
  "/library",
  "/profile",
  "/subscribe",
  "/about",
  "/contact",
  "/author",
  "/terms",
  "/privacy",
  "/ethics",
  "/license",
  "/signup",
  "/signin",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isSpaNavigation(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname !== self.location.hostname) return false;
    const p = u.pathname.replace(/\/$/, "") || "/";
    if (SPA_ROUTES.includes(p)) return true;
    if (p.startsWith("/article/")) return true;
    if (p.startsWith("/category/")) return true;
    if (p.startsWith("/auth/")) return true;
    return false;
  } catch {
    return false;
  }
}

function isLocalAsset(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname !== self.location.hostname) return false;
    return (
      u.pathname.startsWith("/assets/") ||
      u.pathname.startsWith("/favicon") ||
      u.pathname.startsWith("/Brawnly-favicon") ||
      u.pathname.startsWith("/sw") ||
      u.pathname.startsWith("/workbox") ||
      u.pathname.startsWith("/manifest") ||
      u.pathname.startsWith("/sw-reset") ||
      u.pathname.startsWith("/registerSW")
    );
  } catch {
    return false;
  }
}

function isExternalImage(url: string): boolean {
  return (
    url.includes("supabase.co") ||
    url.includes("cloudinary.com") ||
    url.includes("res.cloudinary") ||
    url.includes("pbs.twimg.com") ||
    url.includes("abs.twimg.com") ||
    url.includes("i.ytimg.com") ||
    url.includes("yt3.ggpht.com") ||
    url.includes("cdninstagram.com")
  );
}

// ── TTL helpers ───────────────────────────────────────────────────────────────

async function putTTL(
  cache: Cache,
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!res || !res.ok) return;
    const clone = res.clone();
    const headers = new Headers(clone.headers);
    headers.set("sw-cache-time", Date.now().toString());
    const body = await clone.blob();
    const newRes = new Response(body, {
      status: clone.status,
      statusText: clone.statusText,
      headers,
    });
    await cache.put(req, newRes);
  } catch {
    // silent
  }
}

function isFresh(res: Response | undefined): boolean {
  if (!res) return false;
  const t = res.headers.get("sw-cache-time");
  if (!t) return false;
  return Date.now() - Number(t) < TTL;
}

// ── Strategies ────────────────────────────────────────────────────────────────

async function navigationStrategy(req: Request): Promise<Response> {
  const cache = await caches.open(NAV_CACHE);
  try {
    const res = await fetch(req, { redirect: "follow" });
    if (res && res.ok) {
      await cache.put(new Request("/index.html"), res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(new Request("/index.html"));
    if (cached) return cached;
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

async function imageStrategy(req: Request): Promise<Response> {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(req);

  const netFetch = fetch(req, { redirect: "follow" })
    .then(async (res) => {
      if (res && res.ok) await putTTL(cache, req, res.clone());
      return res;
    })
    .catch(() => {
      if (cached) return cached;
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
        { headers: { "Content-Type": "image/svg+xml" }, status: 200 }
      );
    });

  // Stale-while-revalidate: sajikan cache jika fresh, fetch di background
  if (cached && isFresh(cached)) {
    netFetch.catch(() => {});
    return cached;
  }

  return cached || netFetch;
}

async function apiStrategy(req: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(req);

  const netFetch = fetch(req)
    .then((res) => {
      if (res && res.ok) putTTL(cache, req, res.clone());
      return res;
    })
    .catch((): Response | null => null);

  return cached || (await netFetch) || new Response("offline", { status: 503 });
}

// ── Queue helpers ─────────────────────────────────────────────────────────────

async function queueTrack(articleId: string): Promise<void> {
  try {
    const cache = await caches.open(API_QUEUE);
    await cache.put(
      `/track/${articleId}-${Date.now()}`,
      new Response(
        JSON.stringify({ id: articleId, ts: Date.now(), type: "view" }),
        { headers: { "content-type": "application/json" } }
      )
    );
  } catch {
    // silent
  }
}

async function flushQueue(): Promise<void> {
  try {
    const cache = await caches.open(API_QUEUE);
    const keys = await cache.keys();
    for (const req of keys) {
      try {
        const res = await cache.match(req);
        if (!res) continue;
        await res.json();
        await cache.delete(req);
      } catch {
        // silent
      }
    }
  } catch {
    // silent
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      // Disable navigation preload jika tersedia
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.disable();
      }

      // Hapus cache versi lama
      const keys = await caches.keys();
      const stale = keys.filter(
        (k) =>
          k.startsWith("workbox-") ||
          k.startsWith("navigate-cache") ||
          k.startsWith("html-cache") ||
          (k.startsWith("brawnly-img-v") && k !== IMG_CACHE) ||
          (k.startsWith("brawnly-api-v") && k !== API_CACHE) ||
          (k.startsWith("brawnly-nav-v") && k !== NAV_CACHE)
      );
      await Promise.all(stale.map((k) => caches.delete(k)));
      await self.clients.claim();

      // Beritahu semua window clients bahwa SW sudah aktif
      const allClients = await self.clients.matchAll({ type: "window" });
      allClients.forEach((client) =>
        client.postMessage({ type: "SW_ACTIVATED" })
      );
    })()
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  // Jangan intercept asset lokal (sw.js, manifest, dll.)
  if (isLocalAsset(req.url)) return;

  // Navigasi SPA → network-first, fallback ke /index.html
  if (req.mode === "navigate") {
    if (!isSpaNavigation(req.url)) return;
    e.respondWith(navigationStrategy(req));
    return;
  }

  // Gambar eksternal → stale-while-revalidate dengan TTL
  if (req.destination === "image" && isExternalImage(req.url)) {
    e.respondWith(imageStrategy(req));
    return;
  }

  // Supabase REST API → cache-with-network-fallback
  if (req.url.includes("/rest/v1/")) {
    e.respondWith(apiStrategy(req));
    return;
  }
});

// ── Message ───────────────────────────────────────────────────────────────────

self.addEventListener("message", (e) => {
  // Track article view ke queue (untuk sync offline)
  if (e.data?.type === "TRACK_VIEW") {
    queueTrack(String(e.data.articleId));
  }
  // Force skip waiting dari klien
  if (e.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Background Sync ───────────────────────────────────────────────────────────
// Tag "sync-articles" — harus identik dengan swRegister.ts dan ArticleDetail.tsx

self.addEventListener("sync", (e: any) => {
  if (e.tag === "sync-articles") {
    e.waitUntil(flushQueue());
  }
});