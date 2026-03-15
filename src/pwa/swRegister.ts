export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");

    await navigator.serviceWorker.ready;

    if ("sync" in reg) {
      try {
        if (reg.sync) {
          await reg.sync.register("brawnly-sync");
          await reg.sync.register("sync-tag");
          
          console.log("PWA: Background Sync Registered");
        } else {
          console.warn("PWA: Sync manager is not available on this registration.");
        }
      } catch (syncErr) {
        console.warn("PWA: Sync registration failed (likely unsupported)", syncErr);
      }
    }

    return reg;
  } catch (err) {
    console.error("PWA: SW Registration failed: ", err);
  }
}