import type { Bed, CropTemplate, GardenData, Planting, Settings } from './types';

const DB_NAME = 'season-gap-garden';
const STORE_NAME = 'garden';
const DATA_KEY = 'current';
const LAST_GOOD_KEY = 'last-known-good';

/**
 * Demo data deliberately lives in a different IndexedDB database.  Keeping
 * the namespace here, next to the storage boundary, makes it impossible for
 * the UI to accidentally save a sample action into a gardener's notebook.
 */
export const DEMO_STORAGE_NAMESPACE = 'demo:season-gap-garden';

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

function openDb(name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadData(namespace = DB_NAME, initialData?: GardenData): Promise<GardenData> {
  const db = await openDb(namespace);
  try {
    const current = await readRecord(db, DATA_KEY);
    if (!current) return initialData ? structuredClone(initialData) : defaultData();

    try {
      return validateGardenData(current);
    } catch (currentError) {
      // A save made by this version always retains the prior valid notebook.
      // Prefer it to leaving the application unusable if storage is interrupted
      // or an older version somehow wrote invalid data.
      const lastKnownGood = await readRecord(db, LAST_GOOD_KEY);
      if (lastKnownGood) {
        try {
          const recovered = validateGardenData(lastKnownGood);
          await writeCurrent(db, recovered);
          return recovered;
        } catch {
          // Keep the original error below; neither stored record is trustworthy.
        }
      }
      throw currentError;
    }
  } finally {
    db.close();
  }
}

export async function saveData(data: GardenData, namespace = DB_NAME): Promise<void> {
  const updatedAt = new Date().toISOString();
  const candidate = { ...data, updatedAt };
  validateGardenData(candidate);
  const db = await openDb(namespace);
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const current = store.get(DATA_KEY);
      current.onerror = () => reject(current.error);
      current.onsuccess = () => {
        // Snapshot only a complete, valid notebook. An invalid record must never
        // displace a known-good recovery point.
        if (current.result) {
          try { store.put(validateGardenData(current.result), LAST_GOOD_KEY); } catch { /* do not snapshot invalid data */ }
        }
        store.put(candidate, DATA_KEY);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  data.updatedAt = updatedAt;
}

export function clearData(namespace: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(namespace);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('The demo storage could not be cleared. Close other demo tabs and try again.'));
  });
}

export function validateGardenData(value: unknown): GardenData {
  if (!isRecord(value)) throw new Error('This backup is not a garden data file.');
  const data = value as Partial<GardenData>;
  if (data.version !== 1 || !Array.isArray(data.beds) || !Array.isArray(data.plantings) || !Array.isArray(data.templates)) {
    throw new Error('This backup format is not supported.');
  }
  validateSettings(data.settings);
  validateBeds(data.beds);
  validatePlantings(data.plantings, data.beds);
  validateTemplates(data.templates);
  requireTimestamp(data.updatedAt, 'backup update time');
  return data as GardenData;
}

function readRecord(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function writeCurrent(db: IDBDatabase, data: GardenData): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, DATA_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function invalid(message: string): never {
  throw new Error(`This backup has an invalid ${message}.`);
}

function requireId(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(value)) invalid(`${label} ID`);
}

function requireText(value: unknown, label: string, maximum: number): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) invalid(label);
}

function requireString(value: unknown, label: string, maximum: number): asserts value is string {
  if (typeof value !== 'string' || value.length > maximum) invalid(label);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function requireDate(value: unknown, label: string): asserts value is string {
  if (!isCalendarDate(value)) invalid(`${label} date`);
}

function optionalDate(value: unknown, label: string): asserts value is string | undefined {
  if (value !== undefined && !isCalendarDate(value)) invalid(`${label} date`);
}

function requireTimestamp(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value))) invalid(label);
}

function validateSettings(settings: unknown): asserts settings is Settings {
  if (!isRecord(settings)) invalid('season settings');
  requireDate(settings.seasonStart, 'season start');
  requireDate(settings.seasonEnd, 'season end');
  if (settings.seasonStart >= settings.seasonEnd) invalid('season date range');
}

function validateBeds(beds: unknown[]): asserts beds is Bed[] {
  const ids = new Set<string>();
  beds.forEach((bed, index) => {
    const label = `bed ${index + 1}`;
    if (!isRecord(bed)) invalid(label);
    requireId(bed.id, label);
    if (ids.has(bed.id)) invalid(`${label} ID (duplicate)`);
    ids.add(bed.id);
    requireText(bed.name, `${label} name`, 60);
    requireString(bed.notes, `${label} note`, 180);
    requireTimestamp(bed.createdAt, `${label} creation time`);
  });
}

function validatePlantings(plantings: unknown[], beds: Bed[]): asserts plantings is Planting[] {
  const ids = new Set<string>();
  const bedIds = new Set(beds.map((bed) => bed.id));
  plantings.forEach((planting, index) => {
    const label = `entry ${index + 1}`;
    if (!isRecord(planting)) invalid(label);
    requireId(planting.id, label);
    if (ids.has(planting.id)) invalid(`${label} ID (duplicate)`);
    ids.add(planting.id);
    requireId(planting.bedId, `${label} bed`);
    if (!bedIds.has(planting.bedId)) invalid(`${label} bed reference`);
    requireText(planting.name, `${label} name`, 60);
    if (planting.kind !== 'crop' && planting.kind !== 'rest') invalid(`${label} type`);
    optionalDate(planting.sowDate, `${label} sow`);
    optionalDate(planting.transplantDate, `${label} transplant`);
    requireDate(planting.clearDate, `${label} clear`);
    const start = planting.transplantDate || planting.sowDate;
    if (!start) invalid(`${label} start date`);
    if (planting.sowDate && planting.transplantDate && planting.transplantDate < planting.sowDate) invalid(`${label} date order`);
    if (planting.clearDate <= start) invalid(`${label} date order`);
    requireString(planting.notes, `${label} note`, 240);
    requireTimestamp(planting.createdAt, `${label} creation time`);
    requireTimestamp(planting.updatedAt, `${label} update time`);
  });
}

function validateTemplates(templates: unknown[]): asserts templates is CropTemplate[] {
  const ids = new Set<string>();
  templates.forEach((template, index) => {
    const label = `crop note ${index + 1}`;
    if (!isRecord(template)) invalid(label);
    requireId(template.id, label);
    if (ids.has(template.id)) invalid(`${label} ID (duplicate)`);
    ids.add(template.id);
    requireText(template.name, `${label} name`, 60);
    if (typeof template.durationDays !== 'number' || !Number.isInteger(template.durationDays) || template.durationDays < 1 || template.durationDays > 366) invalid(`${label} duration`);
    requireString(template.notes, `${label} note`, 180);
    requireTimestamp(template.createdAt, `${label} creation time`);
  });
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
