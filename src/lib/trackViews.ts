/* ======================
   CORE TRACK LOGIC (UPDATED FOR RPC)
====================== */
import { supabase } from "@/lib/supabase";
import { enqueue, openDB } from "@/lib/idbQueue";

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
   OFFLINE QUEUE (IDB + BACKGROUND SYNC)
====================== */
async function _queueOfflineTrack(articleId: string) {
  try {
    // 1. Simpan ke IDB (Persistent Storage)
    await enqueue({
      type: "TRACK_VIEW",
      articleId,
      timestamp: Date.now(),
      retryCount: 0
    });

    // 2. Register Background Sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const reg = await navigator.serviceWorker.ready;
      // @ts-ignore
      await reg.sync.register("brawnly-sync");
    }
  } catch (e) {
    // Fallback LocalStorage
    try {
      const q = JSON.parse(localStorage.getItem("brawnly_track_fallback") || "[]");
      q.push({ articleId, ts: Date.now() });
      localStorage.setItem("brawnly_track_fallback", JSON.stringify(q));
    } catch {}
  }
}

/**
 * Flush Queue: Membaca IDB dan mengirim via RPC
 */
async function _flushOfflineQueue() {
  if (!navigator.onLine) return;

  try {
    const db = await openDB();
    const tx = db.transaction("sync", "readwrite");
    const store = tx.objectStore("sync");
    const req = store.getAll();

    req.onsuccess = async () => {
      const items = req.result;
      if (!items || items.length === 0) return;

      for (const item of items) {
        if (item.type === "TRACK_VIEW") {
          try {
            await _sendTrack(item.articleId, true);
            // Hapus jika sukses
            const delTx = db.transaction("sync", "readwrite");
            delTx.objectStore("sync").delete(item.id || item.key); 
          } catch (e) {
            // Biarkan jika gagal (akan dicoba lagi nanti)
          }
        }
      }
    };
  } catch (e) {
    console.warn("Queue Flush Error", e);
  }
}

/* ======================
   RECONNECT BACKOFF ENGINE
====================== */
function _reconnectLoop() {
  let a = 0;
  const run = async () => {
    if (!navigator.onLine) return;
    try {
      await _flushOfflineQueue();
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
   SERVICE WORKER MESSAGE
====================== */
function _swTrackPush(articleId: string) {
  try {
    if (!navigator.serviceWorker?.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: "TRACK_VIEW", articleId });
  } catch {}
}

/* ======================
   CORE TRACK SEND (RPC VERSION)
   Ini memperbaiki Error 500 dengan memanggil SQL Function langsung
====================== */
async function _sendTrack(articleId: string, silent = false) {
  // Panggil RPC 'increment_views' yang Anda buat di SQL Editor
  const { error } = await supabase.rpc('increment_views', { article_id: articleId });

  if (error) {
    if (!silent) console.error("RPC Track Failed:", error.message);
    throw error; // Lempar error agar masuk antrean offline jika gagal
  }
}

/* ======================
   PUBLIC API
====================== */
export async function trackPageView(articleId: string) {
  try {
    if (!articleId) return;

    _reconnectLoop();
    _sC("b_v", _hS(articleId), 7);
    _mirrorQuery({ id: articleId, ts: Date.now() });
    _swTrackPush(articleId);

    if (!navigator.onLine) {
      await _queueOfflineTrack(articleId);
      return;
    }

    try {
      await _sendTrack(articleId);
    } catch (err) {
      // Jika RPC gagal (misal koneksi putus tiba-tiba), queue lagi
      await _queueOfflineTrack(articleId);
    }

  } catch (err) {
    _queueOfflineTrack(articleId);
  }
}