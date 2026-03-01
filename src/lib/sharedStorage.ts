import { openDB } from "./idbQueue";

const STORE_NAME = "sync"; 

export async function saveAssetToShared(id: string, blob: Blob) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.put(blob, `asset_${id}`);
}

export async function getAssetFromShared(id: string): Promise<Blob | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise((res) => {
    const req = store.get(`asset_${id}`);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => res(null);
  });
}