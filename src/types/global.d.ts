export {};

declare global {

  /* ======================
     WINDOW GLOBAL SNAP CACHE
  ====================== */
  interface Window {
    __BRAWNLY_SNAP__?: any[];
  }

  /* ======================
     BACKGROUND SYNC MANAGER
  ====================== */
  interface SyncManager {
    register(tag: string): Promise<void>;
  }

  /* ======================
     SERVICE WORKER REG
  ====================== */
  interface ServiceWorkerRegistration {
    sync?: SyncManager;
  }

}
