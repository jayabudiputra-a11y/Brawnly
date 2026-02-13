import { openDB } from "./idbQueue";

const STORE_ASSETS = "shared_assets";

/**
 * Menyimpan Blob ke IndexedDB agar bisa diakses Shared Storage/Extension
 */
export async function saveAssetToShared(id: string, blob: Blob) {
  const db = await openDB();
  // Pastikan store ada (handling upgrade manual jika diperlukan)
  const tx = db.transaction("sync", "readwrite");
  const store = tx.objectStore("sync");
  await store.put(blob, `asset_${id}`);
}

export async function getAssetFromShared(id: string): Promise<Blob | null> {
  const db = await openDB();
  const tx = db.transaction("sync", "readonly");
  const store = tx.objectStore("sync");
  return new Promise((res) => {
    const req = store.get(`asset_${id}`);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => res(null);
  });
}