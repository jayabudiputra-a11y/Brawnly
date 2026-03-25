/**
 * swRegister.ts — Brawnly PWA Service Worker Registration
 *
 * Mendaftarkan /sw.js dan Background Sync tag "sync-articles".
 * Tag ini HARUS identik di tiga tempat:
 *   1. swRegister.ts          → reg.sync.register("sync-articles")
 *   2. sw.ts / public/sw.js   → event.tag === "sync-articles"
 *   3. ArticleDetail.tsx      → reg.sync.register("sync-articles")
 */
export async function registerSW(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) return;

  // Skip SW di dev mode — Vite HMR dan stub SW akan konflik.
  // Di production tetap berjalan normal.
  if (!import.meta.env.PROD) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      // updateViaCache: "none" memastikan SW selalu dicek versi terbaru
      updateViaCache: "none",
    });

    // Tunggu SW ready sebelum mendaftarkan sync
    await navigator.serviceWorker.ready;

    // Background Sync — satu tag terpusat: "sync-articles"
    if ("sync" in reg && reg.sync) {
      try {
        await reg.sync.register("sync-articles");
        console.log("[Brawnly PWA] Background Sync registered: sync-articles");
      } catch (syncErr) {
        // SyncManager tidak tersedia di semua browser (mis. Firefox, Safari)
        console.warn("[Brawnly PWA] Sync registration failed (mungkin tidak didukung browser ini)", syncErr);
      }
    } else {
      console.warn("[Brawnly PWA] SyncManager tidak tersedia pada registration ini.");
    }

    // Dengarkan pesan SW_ACTIVATED dari service worker
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data?.type === "SW_ACTIVATED") {
        console.log("[Brawnly PWA] Service Worker aktif dan siap.");
      }
    });

    return reg;
  } catch (err) {
    console.error("[Brawnly PWA] SW Registration failed:", err);
  }
}