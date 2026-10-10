import { openDB } from 'idb';

const DB_NAME = 'careto-query-cache-db';
const STORE_NAME = 'query-cache';
const DB_VERSION = 1;
export const CACHE_KEY = 'CARETO_QUERY_CACHE';

let idbSupported: boolean | null = null;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function isIDBSupported(): Promise<boolean> {
  if (idbSupported !== null) return idbSupported;
  try {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      idbSupported = false;
      return false;
    }
    const db = await getDB();
    db.close();
    idbSupported = true;
    return true;
  } catch {
    idbSupported = false;
    return false;
  }
}

export const customAsyncStorage = {
  getItem: async (key: string): Promise<string | null | undefined> => {
    if (await isIDBSupported()) {
      try {
        const db = await getDB();
        const value = await db.get(STORE_NAME, key);
        db.close();
        if (value !== undefined) {
          return value;
        }
      } catch (err) {
        console.warn(
          '[QueryPersister] IndexedDB getItem error, falling back to localStorage:',
          err,
        );
      }
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (await isIDBSupported()) {
      try {
        const db = await getDB();
        await db.put(STORE_NAME, value, key);
        db.close();
        return;
      } catch (err) {
        console.warn(
          '[QueryPersister] IndexedDB setItem error, falling back to localStorage:',
          err,
        );
      }
    }
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn('[QueryPersister] localStorage setItem error:', err);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (await isIDBSupported()) {
      try {
        const db = await getDB();
        await db.delete(STORE_NAME, key);
        db.close();
      } catch (err) {
        console.warn('[QueryPersister] IndexedDB removeItem error:', err);
      }
    }
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('[QueryPersister] localStorage removeItem error:', err);
    }
  },
};

export async function getQueryCacheStorageType(): Promise<'IndexedDB' | 'localStorage' | 'None'> {
  if (await isIDBSupported()) {
    return 'IndexedDB';
  }
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      return 'localStorage';
    }
  } catch {
    // ignore
  }
  return 'None';
}

export async function clearQueryCacheStorage(): Promise<void> {
  await customAsyncStorage.removeItem(CACHE_KEY);
}
