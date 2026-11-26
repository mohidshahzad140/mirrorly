import type { Category, ModelId } from "./tryon";

/**
 * Try-on history saved only in this browser (IndexedDB).
 * Stores the result image only, never the original photos.
 */
export type HistoryItem = { id: string; image: Blob; category: Category; model: ModelId; createdAt: number };

export const HISTORY_EVENT = "mirrorly:history";
const DB = "mirrorly";
const STORE = "history";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function saveLocal(item: Omit<HistoryItem, "id" | "createdAt">): Promise<HistoryItem> {
  const full: HistoryItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
  await tx("readwrite", (s) => s.put(full));
  window.dispatchEvent(new Event(HISTORY_EVENT));
  return full;
}

export async function listLocal(): Promise<HistoryItem[]> {
  const all = await tx<HistoryItem[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteLocal(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}
