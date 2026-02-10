/* ===============================
   BRAWNLY ENTERPRISE SERVICE WORKER
   =============================== */

/* VERSIONED CACHE */
const IMG_CACHE = "brawnly-img-v4";
const API_CACHE = "brawnly-api-v4";
const API_QUEUE = "brawnly-api-queue";

/* SMART TTL (60 MINUTES) */
const TTL = 60 * 60 * 1000;

/* ===============================
   LIFECYCLE
   =============================== */

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => {
        if (
          k !== IMG_CACHE &&
          k !== API_CACHE &&
          k !== API_QUEUE
        ) return caches.delete(k);
      })
    );
    self.clients.claim();
  })());
});

/* ===============================
   TTL PUT HELPER
   =============================== */

async function putTTL(cache, req, res) {

  try {
    const clone = res.clone();

    const headers = new Headers(clone.headers);
    headers.set("sw-cache-time", Date.now().toString());

    const body = await clone.blob();

    const newRes = new Response(body, { headers });

    await cache.put(req, newRes);

  } catch {}

}

/* ===============================
   CHECK TTL VALID
   =============================== */

function isFresh(res) {
  if (!res) return false;

  const t = res.headers.get("sw-cache-time");
  if (!t) return false;

  return (Date.now() - Number(t)) < TTL;
}

/* ===============================
   IMAGE STRATEGY
   STALE WHILE REVALIDATE + TTL
   =============================== */

async function imageStrategy(req) {

  const cache = await caches.open(IMG_CACHE);

  const cached = await cache.match(req);

  const netFetch = fetch(req)
    .then(async res => {
      if (res && res.ok) {
        await putTTL(cache, req, res.clone());
      }
      return res;
    })
    .catch(() => cached);

  if (cached && isFresh(cached)) {
    netFetch.catch(()=>{});
    return cached;
  }

  return cached || netFetch;
}

/* ===============================
   FETCH HANDLER
   =============================== */

self.addEventListener("fetch", event => {

  const req = event.request;

  /* IMAGE CACHE */
  if (req.destination === "image") {
    event.respondWith(imageStrategy(req));
    return;
  }

});

/* ===============================
   MESSAGE CHANNEL (TRACKING / QUEUE)
   =============================== */

self.addEventListener("message", e => {

  if (e.data?.type === "TRACK_VIEW") {
    queueTrack(e.data.articleId);
  }

});

/* ===============================
   OFFLINE TRACK QUEUE
   =============================== */

async function queueTrack(articleId) {

  try {

    const cache = await caches.open(API_QUEUE);

    await cache.put(
      `/track/${articleId}-${Date.now()}`,
      new Response(JSON.stringify({
        id: articleId,
        ts: Date.now(),
        type: "view"
      }), {
        headers: { "content-type": "application/json" }
      })
    );

  } catch {}

}

/* ===============================
   BACKGROUND SYNC SLOT
   =============================== */

self.addEventListener("sync", event => {

  if (event.tag === "sync-articles") {
    event.waitUntil(flushQueue());
  }

});

/* ===============================
   FLUSH OFFLINE QUEUE
   =============================== */

async function flushQueue() {

  try {

    const cache = await caches.open(API_QUEUE);

    const keys = await cache.keys();

    for (const req of keys) {

      try {

        const res = await cache.match(req);
        if (!res) continue;

        const body = await res.json();

        /* FUTURE:
           Kirim ke Supabase / Analytics endpoint
        */

        // await fetch("/api/track", {
        //   method:"POST",
        //   body: JSON.stringify(body),
        //   headers:{ "content-type":"application/json" }
        // });

        await cache.delete(req);

      } catch {}

    }

  } catch {}

}
