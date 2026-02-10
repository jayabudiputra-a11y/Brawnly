const DB = "brawnly_queue";
const STORE = "sync";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { autoIncrement: true });
    };

    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function enqueue(data: any) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add(data);
}
