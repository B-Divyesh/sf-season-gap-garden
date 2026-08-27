export type PlantingKind = 'crop' | 'rest';

export interface Bed {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
}

export interface Planting {
  id: string;
  bedId: string;
  name: string;
  kind: PlantingKind;
  sowDate?: string;
  transplantDate?: string;
  clearDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropTemplate {
  id: string;
  name: string;
  durationDays: number;
  notes: string;
  createdAt: string;
}

export interface Settings {
  seasonStart: string;
  seasonEnd: string;
}

export interface GardenData {
  version: 1;
  beds: Bed[];
  plantings: Planting[];
  templates: CropTemplate[];
  settings: Settings;
  updatedAt: string;
}

export interface Gap {
  bedId: string;
  start: string;
  end: string;
  days: number;
  afterPlantingId?: string;
}
