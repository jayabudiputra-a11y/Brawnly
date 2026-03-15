import { SnapArticle } from "@/lib/storageSnap";

export {};

declare global {
  interface Window {
    __BRAWNLY_SNAP__?: SnapArticle[];
  }

  interface SyncManager {
    register(tag: string): Promise<void>;
  }

  interface ServiceWorkerRegistration {
    readonly sync?: SyncManager;
  }
}