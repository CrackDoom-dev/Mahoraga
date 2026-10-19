import { Profile, FinanceTargets, WeeklyRecord, DailyRecord, AppSettings } from '../types';

const DB_NAME = 'cuanminggu_indexed_db';
const DB_VERSION = 1;
const STORE_BG = 'custom_background';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_BG)) {
        db.createObjectStore(STORE_BG, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBackgroundBlob(blob: Blob, type: 'image' | 'video'): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BG, 'readwrite');
      const store = tx.objectStore(STORE_BG);
      const req = store.put({ id: 'active_bg', blob, type, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save background blob in IndexedDB:', err);
  }
}

export async function getBackgroundBlob(): Promise<{ blob: Blob; type: 'image' | 'video' } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BG, 'readonly');
      const store = tx.objectStore(STORE_BG);
      const req = store.get('active_bg');
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve({ blob: req.result.blob, type: req.result.type || 'image' });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve background from IndexedDB:', err);
    return null;
  }
}

export async function deleteBackgroundBlob(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BG, 'readwrite');
      const store = tx.objectStore(STORE_BG);
      const req = store.delete('active_bg');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete background blob:', err);
  }
}

// LocalStorage helpers
const KEYS = {
  PROFILE: 'cuanminggu_profil',
  TARGETS: 'cuanminggu_targets',
  RECORDS: 'cuanminggu_mingguan',
  DAILY_RECORDS: 'cuanminggu_harian',
  SETTINGS: 'cuanminggu_settings',
};

export const DEFAULT_TARGETS: FinanceTargets = {
  incomePerHari: 100000,
  kebutuhanPerMinggu: 500000,
  totalUtang: 0,
  targetTabungan: 10000000,
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  overlayOpacity: 45,
  cardBlur: 12,
  hasCustomBg: false,
  customBgType: 'none',
};

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadTargets(): FinanceTargets {
  try {
    const raw = localStorage.getItem(KEYS.TARGETS);
    if (!raw) return DEFAULT_TARGETS;
    return { ...DEFAULT_TARGETS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TARGETS;
  }
}

export function saveTargets(targets: FinanceTargets): void {
  try {
    localStorage.setItem(KEYS.TARGETS, JSON.stringify(targets));
  } catch (e) {
    console.error('Failed to save targets', e);
  }
}

export function loadRecords(): WeeklyRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: WeeklyRecord[]): void {
  try {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function loadDailyRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.DAILY_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDailyRecords(dailyRecords: DailyRecord[]): void {
  try {
    localStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(dailyRecords));
  } catch (e) {
    console.error('Failed to save daily records', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function clearAllData(): void {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.TARGETS);
  localStorage.removeItem(KEYS.RECORDS);
  localStorage.removeItem(KEYS.DAILY_RECORDS);
  localStorage.removeItem(KEYS.SETTINGS);
  deleteBackgroundBlob();
}
