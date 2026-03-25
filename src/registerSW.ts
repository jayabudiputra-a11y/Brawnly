export function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  // Di dev mode: unregister semua SW yang mungkin tertinggal dari sesi sebelumnya.
  // Ini mencegah error "Not found" karena browser mencoba auto-update /sw.js
  // yang tidak di-serve Vite di localhost.
  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "activated") {
              navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 1000);
      })
      .catch(() => {});

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}