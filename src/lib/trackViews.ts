import { supabase } from "@/lib/supabase";
import { enqueue, openDB } from "@/lib/idbQueue";
import { cookieHashQuarter as _chQ } from "@/lib/cookieHash";
import {
  setCookieHash,
  mirrorQuery as _mQ,
  warmupEnterpriseStorage,
} from "@/lib/enterpriseStorage";
import { registerSW } from "@/pwa/swRegister";

function _sC(n: string, v: string, d = 30) {
  const dt = new Date();
  dt.setTime(dt.getTime() + d * 864e5);
  document.cookie = `${n}=${v}; path=/; expires=${dt.toUTCString()}; SameSite=Lax`;
}

// ─── Offline queue helpers ────────────────────────────────────────────────────
async function _queueOfflineTrack(articleId: string) {
  try {
    await enqueue({ type: "TRACK_VIEW", articleId, timestamp: Date.now(), retryCount: 0 });
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if ("sync" in reg) {
        // @ts-ignore
        await reg.sync.register("brawnly-sync");
      }
    }
  } catch (e) {
    try {
      const q = JSON.parse(localStorage.getItem("brawnly_track_fallback") || "[]");
      q.push({ articleId, ts: Date.now() });
      localStorage.setItem("brawnly_track_fallback", JSON.stringify(q));
    } catch {}
  }
}

async function _queueOfflineMovieTrack(movieId: string, title: string) {
  try {
    await enqueue({ type: "TRACK_MOVIE_WATCH", movieId, title, timestamp: Date.now(), retryCount: 0 });
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if ("sync" in reg) {
        // @ts-ignore
        await reg.sync.register("brawnly-sync");
      }
    }
  } catch (e) {
    try {
      const q = JSON.parse(localStorage.getItem("brawnly_movie_track_fallback") || "[]");
      q.push({ movieId, title, ts: Date.now() });
      localStorage.setItem("brawnly_movie_track_fallback", JSON.stringify(q));
    } catch {}
  }
}

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
            const delTx = db.transaction("sync", "readwrite");
            delTx.objectStore("sync").delete(item.id || item.key);
          } catch (e) {}
        }
        if (item.type === "TRACK_MOVIE_WATCH") {
          try {
            await _sendMovieTrack(item.movieId, true);
            const delTx = db.transaction("sync", "readwrite");
            delTx.objectStore("sync").delete(item.id || item.key);
          } catch (e) {}
        }
      }
    };
  } catch (e) {}
}

function _reconnectLoop() {
  let a = 0;
  const run = async () => {
    if (!navigator.onLine) return;
    try { await _flushOfflineQueue(); a = 0; }
    catch { a++; const base = Math.min(30000, 1000 * 2 ** a); setTimeout(run, base + Math.random() * 500); }
  };
  run();
  window.addEventListener("online", run);
}

function _swTrackPush(articleId: string) {
  try {
    if (!navigator.serviceWorker?.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: "TRACK_VIEW", articleId });
  } catch {}
}

function _swMovieTrackPush(movieId: string) {
  try {
    if (!navigator.serviceWorker?.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: "TRACK_MOVIE_WATCH", movieId });
  } catch {}
}

async function _sendTrack(articleId: string, silent = false) {
  const { error } = await supabase.rpc("increment_views", { article_id: articleId });
  if (error) { if (!silent) console.error("RPC Track Failed:", error.message); throw error; }
}

// ─── Movie watch RPC — increments movie_views column ─────────────────────────
// Falls back gracefully if the RPC or column doesn't exist yet.
async function _sendMovieTrack(movieId: string, silent = false) {
  try {
    const { error } = await supabase.rpc("increment_movie_views", { movie_id: movieId });
    if (error && !silent) console.error("RPC Movie Track Failed:", error.message);
  } catch (e) {
    // Fallback: direct upsert into movie_views table if RPC not available
    try {
      await supabase
        .from("movie_views")
        .upsert({ movie_id: movieId, viewed_at: new Date().toISOString() }, { onConflict: "movie_id" });
    } catch {}
  }
}

// ─── Public: track article page view ─────────────────────────────────────────
export async function trackPageView(articleId: string) {
  try {
    if (!articleId) return;
    warmupEnterpriseStorage();
    await registerSW();
    _reconnectLoop();
    await setCookieHash(articleId);
    _mQ({ id: articleId, ts: Date.now(), type: "PAGE_VIEW" });
    _swTrackPush(articleId);
    if (!navigator.onLine) { await _queueOfflineTrack(articleId); return; }
    try { await _sendTrack(articleId); }
    catch (err) { await _queueOfflineTrack(articleId); }
  } catch (err) {
    _queueOfflineTrack(articleId);
  }
}

// ─── Public: track movie watch from Matchflik section ────────────────────────
// Called every time a user opens the MovieDetailModal in Home.tsx.
// Provides enterprise-grade tracking: cookie hash, query mirror, SW push,
// offline IDB queue with background sync, and automatic flush on reconnect.
export async function trackMovieWatch(movieId: string, title = "") {
  try {
    if (!movieId) return;
    warmupEnterpriseStorage();
    await registerSW();
    _reconnectLoop();

    // Cookie hash keyed to movie session
    await setCookieHash(`movie_${movieId}`);

    // Mirror to local query log (FB BigQuery style)
    _mQ({ id: movieId, title, ts: Date.now(), type: "MOVIE_WATCH" });

    // Notify service worker (for background analytics)
    _swMovieTrackPush(movieId);

    if (!navigator.onLine) {
      await _queueOfflineMovieTrack(movieId, title);
      return;
    }

    try { await _sendMovieTrack(movieId); }
    catch (err) { await _queueOfflineMovieTrack(movieId, title); }

  } catch (err) {
    _queueOfflineMovieTrack(movieId, title);
  }
}