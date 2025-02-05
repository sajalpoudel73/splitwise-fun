
interface StoredItem {
  name: string;
  unitPrice: number;
  lastUpdated: Date;
}

interface StoredBill {
  people: string[];
  items: any[];
  payer: string;
  paidAmount: number;
  date: Date;
}

const DB_NAME = 'BillSplitterDB';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('people')) {
        db.createObjectStore('people', { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains('latestBill')) {
        db.createObjectStore('latestBill', { keyPath: 'id' });
      }
    };
  });
};

export const saveItem = async (name: string, unitPrice: number): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  
  await store.put({
    name: capitalizeWords(name),
    unitPrice,
    lastUpdated: new Date()
  });
};

export const savePerson = async (name: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('people', 'readwrite');
  const store = tx.objectStore('people');
  
  await store.put({
    name: capitalizeWords(name),
    lastUpdated: new Date()
  });
};

export const saveLatestBill = async (billData: StoredBill): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('latestBill', 'readwrite');
  const store = tx.objectStore('latestBill');
  
  await store.clear(); // Remove old bill
  await store.add({
    id: 'latest',
    ...billData,
    date: new Date()
  });
};

export const getLatestBill = async (): Promise<StoredBill | null> => {
  const db = await openDB();
  const tx = db.transaction('latestBill', 'readonly');
  const store = tx.objectStore('latestBill');
  
  return new Promise((resolve, reject) => {
    const request = store.get('latest');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const bill = request.result;
      if (!bill) {
        resolve(null);
        return;
      }

      const daysDiff = (new Date().getTime() - new Date(bill.date).getTime()) / (1000 * 3600 * 24);
      if (daysDiff >= 1) {
        // If bill is a day or more old, clear it and return null
        const tx = db.transaction('latestBill', 'readwrite');
        const store = tx.objectStore('latestBill');
        store.clear();
        resolve(null);
      } else {
        resolve(bill);
      }
    };
  });
};

export const clearLatestBill = async (): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('latestBill', 'readwrite');
  const store = tx.objectStore('latestBill');
  await store.clear();
};

export const getSuggestions = async (type: 'items' | 'people', query: string): Promise<string[]> => {
  const db = await openDB();
  const tx = db.transaction(type, 'readonly');
  const store = tx.objectStore(type);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const items = request.result;
      const suggestions = items
        .map(item => item.name)
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      resolve(suggestions);
    };
  });
};

export const getItemPrice = async (name: string): Promise<number | null> => {
  const db = await openDB();
  const tx = db.transaction('items', 'readonly');
  const store = tx.objectStore('items');
  
  return new Promise((resolve, reject) => {
    const request = store.get(capitalizeWords(name));
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const item = request.result;
      resolve(item ? item.unitPrice : null);
    };
  });
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
