import { EmergencyRequest, ResourceUnit } from '../types';

class Database {
  private dbName = 'DPI4_Emergency_DB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('requests')) {
          const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
          requestStore.createIndex('status', 'status', { unique: false });
          requestStore.createIndex('severity', 'severity', { unique: false });
          requestStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('resources')) {
          const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
          resourceStore.createIndex('type', 'type', { unique: false });
          resourceStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  async saveRequests(requests: EmergencyRequest[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    
    requests.forEach(req => store.put(req));
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getRequests(): Promise<EmergencyRequest[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['requests'], 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveResources(resources: ResourceUnit[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['resources'], 'readwrite');
    const store = transaction.objectStore('resources');
    
    resources.forEach(res => store.put(res));
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getResources(): Promise<ResourceUnit[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['resources'], 'readonly');
    const store = transaction.objectStore('resources');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const database = new Database();
