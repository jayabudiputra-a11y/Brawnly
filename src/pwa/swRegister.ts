/**
 * PWA Service Worker Registration
 * Mengelola registrasi SW dan Background Sync untuk antrean luring (offline queue).
 */
export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  try {
    // 1. Registrasi Service Worker
    const reg = await navigator.serviceWorker.register("/sw.js");

    // 2. Tunggu sampai Service Worker benar-benar aktif (Ready)
    // Ini krusial agar SyncManager tidak gagal (mencegah InvalidStateError)
    await navigator.serviceWorker.ready;

    // 3. Registrasi Background Sync
    if ("sync" in reg) {
      try {
        // @ts-ignore - Background Sync API
        await reg.sync.register("brawnly-sync");
        // @ts-ignore
        await reg.sync.register("sync-tag");
        
        console.log("PWA: Background Sync Registered");
      } catch (syncErr) {
        console.warn("PWA: Sync registration failed (likely unsupported)", syncErr);
      }
    }

    return reg;
  } catch (err) {
    console.error("PWA: SW Registration failed: ", err);
  }
}