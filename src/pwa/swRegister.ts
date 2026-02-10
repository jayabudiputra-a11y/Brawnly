export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.register("/sw.js");

  if ("sync" in reg) {
    reg.sync?.register("brawnly-sync");
  }

  return reg;
}
