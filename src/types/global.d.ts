import { SnapArticle } from "@/lib/storageSnap";

export {};

declare global {

  /* ======================
      WINDOW GLOBAL SNAP CACHE
     ====================== */
  interface Window {
    /** * Snapshot cache untuk loading artikel instan.
     * Menggunakan tipe data SnapArticle dari storageSnap.
     */
    __BRAWNLY_SNAP__?: SnapArticle[];
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
    readonly sync?: SyncManager;
  }

}