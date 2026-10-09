import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'careto-share-target-db';
const STORE_NAME = 'shared_payloads';

export interface SharedPayload {
  id: string;
  title?: string;
  text?: string;
  url?: string;
  file?: File;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db: IDBPDatabase) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSharedPayload(
  payload: Omit<SharedPayload, 'id' | 'timestamp'>,
): Promise<string> {
  const db = await getDB();
  const id = `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fullPayload: SharedPayload = {
    ...payload,
    id,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, fullPayload);
  return id;
}

export async function getLatestSharedPayload(): Promise<SharedPayload | null> {
  const db = await getDB();
  const allKeys = await db.getAllKeys(STORE_NAME);
  if (allKeys.length === 0) return null;

  const items: SharedPayload[] = await db.getAll(STORE_NAME);
  items.sort((a, b) => b.timestamp - a.timestamp);
  return items[0] || null;
}

export async function clearSharedPayload(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllSharedPayloads(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
