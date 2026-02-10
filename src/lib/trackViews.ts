/* ======================
   CORE TRACK CONST (DO NOT BREAK SOURCE LOGIC)
====================== */
const _0xtrk = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "/functions/v1/track-view",
  "POST",
  "application/json",
  "Authorization",
  "Bearer "
] as const;

const _t = (i: number) => _0xtrk[i] as string;

/* ======================
   ULTRA HASH (¼ MEMORY COOKIE STYLE)
====================== */
function _hS(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function _sC(n: string, v: string, d = 30) {
  const dt = new Date();
  dt.setTime(dt.getTime() + d * 864e5);
  document.cookie = `${n}=${v}; path=/; expires=${dt.toUTCString()}; SameSite=Lax`;
}

/* ======================
   LOCAL QUERY MIRROR (FB BIGQUERY STYLE LOCAL)
====================== */
const _LQK = "brawnly_local_query_mirror";

function _mirrorQuery(d: any) {
  try {
    const q = JSON.parse(localStorage.getItem(_LQK) || "[]");
    q.unshift(d);
    if (q.length > 50) q.length = 50;
    localStorage.setItem(_LQK, JSON.stringify(q));
  } catch {}
}

/* ======================
   VIEW SNAPSHOT STORAGE (TEXT INSTANT LOAD 0s)
====================== */
const _VSK = "brawnly_view_snapshot";

export function saveViewSnapshot(meta: {
  id: string;
  title?: string;
  slug?: string;
  image?: string;
}) {
  try {
    const db = JSON.parse(localStorage.getItem(_VSK) || "{}");
    db[meta.id] = {
      t: meta.title || "",
      s: meta.slug || "",
      i: meta.image || "",
      ts: Date.now()
    };
    localStorage.setItem(_VSK, JSON.stringify(db));
  } catch {}
}

/* ======================
   OFFLINE QUEUE
====================== */
const _QK = "brawnly_track_queue";

function _pushQ(job: any) {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    q.push(job);
    localStorage.setItem(_QK, JSON.stringify(q));
  } catch {}
}

async function _flushQ() {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    if (!q.length) return;

    const next: any[] = [];

    for (const j of q) {
      try {
        await _sendTrack(j.articleId, true);
      } catch {
        next.push(j);
      }
    }

    localStorage.setItem(_QK, JSON.stringify(next));
  } catch {}
}

/* ======================
   RECONNECT BACKOFF
====================== */
function _reconnectLoop() {
  let a = 0;

  const run = async () => {
    if (!navigator.onLine) return;
    try {
      await _flushQ();
      a = 0;
    } catch {
      a++;
      const base = Math.min(30000, 1000 * 2 ** a);
      setTimeout(run, base + Math.random() * 500);
    }
  };

  run();
  window.addEventListener("online", run);
}

/* ======================
   SERVICE WORKER MESSAGE (TRACK + CACHE IMAGE)
====================== */
function _swTrackPush(articleId: string) {
  try {
    if (!navigator.serviceWorker?.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: "TRACK_VIEW",
      articleId
    });
  } catch {}
}

/* ======================
   WASM SLOT FUTURE READY
====================== */
async function _initWASM() {
  try {
    // future transcoding / compression / crypto
    return true;
  } catch {
    return false;
  }
}

/* ======================
   CORE TRACK SEND
====================== */
async function _sendTrack(articleId: string, silent = false) {
  const _B = import.meta.env[_t(0)];
  const _K = import.meta.env[_t(1)];

  if (!_B || !_K) return;

  const _E = `${_B.replace(/\/$/, "")}${_t(2)}`;

  const res = await fetch(
    `${_E}?article_id=${encodeURIComponent(articleId)}`,
    {
      method: _t(3),
      headers: {
        "Content-Type": _t(4),
        "x-article-id": articleId,
        [_t(5)]: `${_t(6)}${_K}`
      },
      body: JSON.stringify({ article_id: articleId })
    }
  );

  if (!res.ok && import.meta.env.DEV && !silent) {
    const txt = await res.text();
    console.error("SYS_TRACK_FAULT:", res.status, txt);
  }
}

/* ======================
   PUBLIC API
====================== */
export async function trackPageView(articleId: string) {
  try {
    if (!articleId) return;

    /* INIT */
    _initWASM();
    _reconnectLoop();

    /* COOKIE HASH (¼ MEMORY) */
    _sC("b_v", _hS(articleId), 7);

    /* LOCAL QUERY MIRROR */
    _mirrorQuery({
      id: articleId,
      ts: Date.now()
    });

    /* SERVICE WORKER TRACK PUSH */
    _swTrackPush(articleId);

    /* NETWORK SEND */
    if (!navigator.onLine) {
      _pushQ({ articleId });
      return;
    }

    await _sendTrack(articleId);

  } catch (err) {
    if (import.meta.env.DEV) console.error("NET_SIGNAL_LOST:", err);
    _pushQ({ articleId });
  }
}
