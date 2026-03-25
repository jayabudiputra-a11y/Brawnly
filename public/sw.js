const IMG_CACHE = "brawnly-img-v5";
const API_CACHE = "brawnly-api-v5";
const API_QUEUE = "brawnly-api-queue";
const NAV_CACHE = "brawnly-nav-v1";

const TTL = 60 * 60 * 1000;

const SPA_ROUTES = [
  '/',
  '/articles',
  '/videos',
  '/library',
  '/profile',
  '/subscribe',
  '/about',
  '/contact',
  '/author',
  '/terms',
  '/privacy',
  '/ethics',
  '/license',
  '/signup',
  '/signin',
];

function isSpaNavigation(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== self.location.hostname) return false;
    const p = u.pathname.replace(/\/$/, '') || '/';
    if (SPA_ROUTES.includes(p)) return true;
    if (p.startsWith('/article/')) return true;
    if (p.startsWith('/category/')) return true;
    if (p.startsWith('/auth/')) return true;
    return false;
  } catch {
    return false;
  }
}

function isLocalAsset(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== self.location.hostname) return false;
    return (
      u.pathname.startsWith('/assets/') ||
      u.pathname.startsWith('/favicon') ||
      u.pathname.startsWith('/Brawnly-favicon') ||
      u.pathname.startsWith('/sw') ||
      u.pathname.startsWith('/workbox') ||
      u.pathname.startsWith('/manifest') ||
      u.pathname.startsWith('/sw-reset') ||
      u.pathname.startsWith('/registerSW')
    );
  } catch {
    return false;
  }
}

function isExternalImage(url) {
  return (
    url.includes('supabase.co') ||
    url.includes('cloudinary.com') ||
    url.includes('res.cloudinary') ||
    url.includes('pbs.twimg.com') ||
    url.includes('abs.twimg.com') ||
    url.includes('i.ytimg.com') ||
    url.includes('yt3.ggpht.com') ||
    url.includes('cdninstagram.com')
  );
}

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.disable();
    }
    const keys = await caches.keys();
    const stale = keys.filter(k =>
      k.startsWith('workbox-') ||
      k.startsWith('navigate-cache') ||
      k.startsWith('html-cache') ||
      (k.startsWith('brawnly-img-v') && k !== IMG_CACHE) ||
      (k.startsWith('brawnly-api-v') && k !== API_CACHE) ||
      (k.startsWith('brawnly-nav-v') && k !== NAV_CACHE)
    );
    await Promise.all(stale.map(k => caches.delete(k)));
    await self.clients.claim();
    const allClients = await self.clients.matchAll({ type: 'window' });
    allClients.forEach(client => client.postMessage({ type: 'SW_ACTIVATED' }));
  })());
});

async function putTTL(cache, req, res) {
  try {
    if (!res || !res.ok) return;
    const clone = res.clone();
    const headers = new Headers(clone.headers);
    headers.set("sw-cache-time", Date.now().toString());
    const body = await clone.blob();
    const newRes = new Response(body, {
      status: clone.status,
      statusText: clone.statusText,
      headers
    });
    await cache.put(req, newRes);
  } catch {}
}

function isFresh(res) {
  if (!res) return false;
  const t = res.headers.get("sw-cache-time");
  if (!t) return false;
  return (Date.now() - Number(t)) < TTL;
}

async function navigationStrategy(req) {
  const cache = await caches.open(NAV_CACHE);
  try {
    const res = await fetch(req, { redirect: 'follow' });
    if (res && res.ok) {
      await cache.put(new Request('/index.html'), res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(new Request('/index.html'));
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function imageStrategy(req) {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(req);
  const netFetch = fetch(req, { redirect: 'follow' })
    .then(async res => {
      if (res && res.ok) await putTTL(cache, req, res.clone());
      return res;
    })
    .catch(() => {
      if (cached) return cached;
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' }, status: 200 }
      );
    });
  if (cached && isFresh(cached)) {
    netFetch.catch(() => {});
    return cached;
  }
  return cached || netFetch;
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  if (isLocalAsset(req.url)) return;

  if (req.mode === "navigate") {
    if (!isSpaNavigation(req.url)) return;
    event.respondWith(navigationStrategy(req));
    return;
  }

  if (req.destination === "image" && isExternalImage(req.url)) {
    event.respondWith(imageStrategy(req));
    return;
  }
});

self.addEventListener("message", e => {
  if (e.data?.type === "TRACK_VIEW") queueTrack(e.data.articleId);
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function queueTrack(articleId) {
  try {
    const cache = await caches.open(API_QUEUE);
    await cache.put(
      `/track/${articleId}-${Date.now()}`,
      new Response(JSON.stringify({ id: articleId, ts: Date.now(), type: "view" }), {
        headers: { "content-type": "application/json" }
      })
    );
  } catch {}
}

self.addEventListener("sync", event => {
  if (event.tag === "sync-articles") event.waitUntil(flushQueue());
});

async function flushQueue() {
  try {
    const cache = await caches.open(API_QUEUE);
    const keys = await cache.keys();
    for (const req of keys) {
      try {
        const res = await cache.match(req);
        if (!res) continue;
        await res.json();
        await cache.delete(req);
      } catch {}
    }
  } catch {}
}