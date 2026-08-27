import type { GardenData } from './types';

const DB_NAME = 'season-gap-garden';
const STORE_NAME = 'garden';
const DATA_KEY = 'current';

export function defaultData(now = new Date()): GardenData {
  const year = now.getFullYear();
  const stamp = now.toISOString();
  return {
    version: 1,
    beds: [],
    plantings: [],
    templates: [
      { id: crypto.randomUUID(), name: 'Quick leaves', durationDays: 35, notes: 'My usual cut-and-come-again window', createdAt: stamp },
      { id: crypto.randomUUID(), name: 'Radishes', durationDays: 28, notes: 'Duration from my own notes', createdAt: stamp },
    ],
    settings: { seasonStart: `${year}-03-01`, seasonEnd: `${year}-11-01` },
    updatedAt: stamp,
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadData(): Promise<GardenData> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(DATA_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ? validateGardenData(request.result) : defaultData());
  });
}

export async function saveData(data: GardenData): Promise<void> {
  data.updatedAt = new Date().toISOString();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, DATA_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function validateGardenData(value: unknown): GardenData {
  if (!value || typeof value !== 'object') throw new Error('This backup is not a garden data file.');
  const data = value as Partial<GardenData>;
  if (data.version !== 1 || !Array.isArray(data.beds) || !Array.isArray(data.plantings) || !Array.isArray(data.templates)) {
    throw new Error('This backup format is not supported.');
  }
  if (!data.settings?.seasonStart || !data.settings?.seasonEnd || data.settings.seasonStart >= data.settings.seasonEnd) {
    throw new Error('The backup has an invalid season date range.');
  }
  return data as GardenData;
}

export function downloadFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function csvCell(value: string | number | undefined): string {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(data: GardenData): string {
  const header = ['bed', 'entry_type', 'crop_or_rest', 'sow_date', 'transplant_date', 'expected_clear_date', 'notes'];
  const rows = data.plantings
    .slice()
    .sort((a, b) => (a.bedId + (a.transplantDate || a.sowDate || '')).localeCompare(b.bedId + (b.transplantDate || b.sowDate || '')))
    .map((item) => {
      const bed = data.beds.find((candidate) => candidate.id === item.bedId);
      return [bed?.name || 'Deleted bed', item.kind, item.name, item.sowDate, item.transplantDate, item.clearDate, item.notes].map(csvCell).join(',');
    });
  return [header.join(','), ...rows].join('\n');
}
