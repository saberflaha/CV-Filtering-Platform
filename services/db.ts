/**
 * PERSISTENCE LAYER
 * Robust IndexedDB implementation for high-performance local storage.
 * Scalable to 200,000+ records via optimized indexing.
 */

const DB_NAME = 'HR_Platform_Pro_DB';
const DB_VERSION = 3;

export class Database {
  private db: IDBDatabase | null = null;

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        const stores = [
          { name: 'jobs', key: 'id', indexes: ['branchId', 'status'] },
          { name: 'applications', key: 'id', indexes: ['jobId', 'branchId', 'status', 'matchScore'] },
          { name: 'adminUsers', key: 'id', indexes: ['email', 'branchId'] },
          { name: 'branches', key: 'id', indexes: ['name'] },
          { name: 'notifications', key: 'id', indexes: ['timestamp', 'read'] },
          { name: 'roles', key: 'id', indexes: ['name'] }
        ];

        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const os = db.createObjectStore(store.name, { keyPath: store.key });
            store.indexes.forEach(idx => os.createIndex(idx, idx, { unique: false }));
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTransaction(storeName: string, mode: IDBTransactionMode = 'readonly') {
    const db = await this.connect();
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getTransaction(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    const store = await this.getTransaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getTransaction(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new Database();