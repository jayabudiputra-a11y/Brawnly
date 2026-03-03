import { saveArticlesSnap, isTTLExpired } from "./enterpriseStorage";

const Q = "brawnly_sync_q";

let _syncLock = false;
let _syncRaf: number | null = null;

function pushQ(j: any) {
  try {
    const _idle = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    _idle(() => {
      try {
        const q = JSON.parse(localStorage.getItem(Q) || "[]");
        q.push(j);
        localStorage.setItem(Q, JSON.stringify(q));
      } catch {}
    });
  } catch {}
}

export async function syncArticles(fetcher: () => Promise<any[]>) {
  try {
    if (!navigator.onLine) {
      return false;
    }

    if (!isTTLExpired()) {
      return false;
    }

    if (_syncLock) {
      return false;
    }

    _syncLock = true;

    try {
      const data = await fetcher();

      if (_syncRaf !== null) cancelAnimationFrame(_syncRaf);
      _syncRaf = requestAnimationFrame(() => {
        saveArticlesSnap(data);
        _syncRaf = null;
      });

      return true;
    } finally {
      _syncLock = false;
    }
  } catch {
    _syncLock = false;
    pushQ({ t: Date.now() });
    return false;
  }
}