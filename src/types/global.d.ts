import { SnapArticle } from "@/lib/storageSnap";
import type { SWMessageType } from "./index";

export {};

declare global {
  // ── Window extensions ───────────────────────────────────────────────────────

  interface Window {
    // Snap cache untuk artikel (storageSnap.ts)
    __BRAWNLY_SNAP__?: SnapArticle[];

    // Flag PWA — mencegah registerSW() + warmupEnterpriseStorage()
    // dipanggil lebih dari sekali per session (ArticleDetail.tsx)
    __brawnly_pwa_active?: boolean;
  }

  // ── Service Worker — SyncManager ────────────────────────────────────────────
  // Tag yang valid: "sync-articles"
  // Harus konsisten di sw.ts, swRegister.ts, dan ArticleDetail.tsx.

  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }

  interface ServiceWorkerRegistration {
    readonly sync?: SyncManager;
  }

  // ── Service Worker — MessageEvent payload ────────────────────────────────────
  // Mengetik pesan postMessage antara SW ↔ klien.
  // Digunakan di sw.ts (self.clients.forEach) dan swRegister.ts (addEventListener).

  interface ServiceWorkerMessageEvent extends MessageEvent {
    data: SWMessageType;
  }

  // ── iframe postMessage (FullHtmlBlock di ArticleDetail.tsx) ─────────────────
  // Pesan tinggi iframe dikirim dari dalam srcdoc ke parent window.
  interface IframeHeightMessage {
    type: "iframeHeight";
    scopeId: string;
    height: number;
  }
}