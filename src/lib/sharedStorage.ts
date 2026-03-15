import { openDB } from "./idbQueue";

const _SN = "sync";

export async function saveAssetToShared(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(_SN, "readwrite");
      const store = tx.objectStore(_SN);
      const req   = store.put(blob, `asset_${id}`);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
      tx.onerror    = () => reject(tx.error);
      tx.onabort    = () => reject(new Error("tx aborted"));
    });
  } catch {}
}

export async function getAssetFromShared(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise<Blob | null>((resolve) => {
      const tx    = db.transaction(_SN, "readonly");
      const store = tx.objectStore(_SN);
      const req   = store.get(`asset_${id}`);
      req.onsuccess = () => {
        const r = req.result;
        if (!r || !(r instanceof Blob) || r.size === 0) resolve(null);
        else resolve(r);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteAssetFromShared(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(_SN, "readwrite");
      const store = tx.objectStore(_SN);
      const req   = store.delete(`asset_${id}`);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch {}
}