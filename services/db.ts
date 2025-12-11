import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Reservation, Expense, AppSettings } from '../types';

interface RestoDB extends DBSchema {
  reservations: {
    key: number;
    value: Reservation;
    indexes: { 'by-date': string };
  };
  expenses: {
    key: number;
    value: Expense;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'resto-manager-db';
const DB_VERSION = 2; // Incremented version for new store

let dbPromise: Promise<IDBPDatabase<RestoDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<RestoDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        if (!db.objectStoreNames.contains('reservations')) {
          const store = db.createObjectStore('reservations', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Reservation Operations
export const getReservations = async (): Promise<Reservation[]> => {
  const db = await initDB();
  return db.getAll('reservations');
};

export const addReservation = async (item: Reservation): Promise<number> => {
  const db = await initDB();
  return db.add('reservations', item);
};

export const updateReservationStatus = async (id: number, status: Reservation['status']): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction('reservations', 'readwrite');
  const store = tx.objectStore('reservations');
  const item = await store.get(id);
  if (item) {
    item.status = status;
    await store.put(item);
  }
  await tx.done;
};

export const deleteReservation = async (id: number): Promise<void> => {
  const db = await initDB();
  await db.delete('reservations', id);
};

// Expense Operations
export const getExpenses = async (): Promise<Expense[]> => {
  const db = await initDB();
  return db.getAll('expenses');
};

export const addExpense = async (item: Expense): Promise<number> => {
  const db = await initDB();
  return db.add('expenses', item);
};

export const deleteExpense = async (id: number): Promise<void> => {
  const db = await initDB();
  await db.delete('expenses', id);
};

// Settings Operations
export const getSettings = async (): Promise<AppSettings | undefined> => {
  const db = await initDB();
  return db.get('settings', 'config');
};

export const saveSettings = async (settings: AppSettings): Promise<string> => {
  const db = await initDB();
  return db.put('settings', { ...settings, id: 'config' });
};
