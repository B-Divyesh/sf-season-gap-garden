import type { GardenData } from './types';

const SAMPLE_GARDEN: GardenData = {
  version: 1,
  beds: [
    { id: 'bed-patio', name: 'Patio salad bed', notes: 'Narrow raised bed by the kitchen door', createdAt: '2026-02-20T09:00:00.000Z' },
    { id: 'bed-south', name: 'South trough', notes: 'Sunny stock-tank planter', createdAt: '2026-02-20T09:05:00.000Z' },
    { id: 'bed-kitchen', name: 'Kitchen box', notes: 'Small box for quick cuts', createdAt: '2026-02-20T09:10:00.000Z' },
  ],
  plantings: [
    { id: 'entry-peas', bedId: 'bed-patio', name: 'Spring peas', kind: 'crop', sowDate: '2026-03-01', transplantDate: '2026-03-10', clearDate: '2026-05-10', notes: 'Picked twice a week', createdAt: '2026-03-01T09:00:00.000Z', updatedAt: '2026-03-01T09:00:00.000Z' },
    { id: 'entry-radishes', bedId: 'bed-patio', name: 'Radishes', kind: 'crop', sowDate: '2026-05-10', transplantDate: '2026-05-10', clearDate: '2026-06-07', notes: 'Follow-on from my usual 28-day note', createdAt: '2026-05-10T09:00:00.000Z', updatedAt: '2026-05-10T09:00:00.000Z' },
    { id: 'entry-lettuce', bedId: 'bed-south', name: 'Early lettuce', kind: 'crop', transplantDate: '2026-03-15', clearDate: '2026-05-20', notes: 'Cleared after warm days arrived', createdAt: '2026-03-15T09:00:00.000Z', updatedAt: '2026-03-15T09:00:00.000Z' },
    { id: 'entry-beans', bedId: 'bed-south', name: 'Bush beans', kind: 'crop', sowDate: '2026-06-01', clearDate: '2026-07-26', notes: 'My saved 55-day allowance', createdAt: '2026-06-01T09:00:00.000Z', updatedAt: '2026-06-01T09:00:00.000Z' },
    { id: 'entry-leaves', bedId: 'bed-kitchen', name: 'Cut-and-come lettuce', kind: 'crop', sowDate: '2026-04-01', clearDate: '2026-05-06', notes: 'One small spring sowing', createdAt: '2026-04-01T09:00:00.000Z', updatedAt: '2026-04-01T09:00:00.000Z' },
  ],
  templates: [
    { id: 'note-radishes', name: 'Radishes', durationDays: 28, notes: 'Duration from my own notes', createdAt: '2026-02-20T09:00:00.000Z' },
    { id: 'note-quick-leaves', name: 'Quick leaves', durationDays: 35, notes: 'My usual cut-and-come-again window', createdAt: '2026-02-20T09:00:00.000Z' },
    { id: 'note-bush-beans', name: 'Bush beans', durationDays: 55, notes: 'Time I allow in this trough', createdAt: '2026-02-20T09:00:00.000Z' },
    { id: 'note-rest', name: 'Short rest', durationDays: 14, notes: 'A two-week pause before the next crop', createdAt: '2026-02-20T09:00:00.000Z' },
  ],
  settings: { seasonStart: '2026-03-01', seasonEnd: '2026-11-01' },
  updatedAt: '2026-06-01T09:00:00.000Z',
};

/** A fresh copy ensures every new demo starts from the same realistic sample. */
export function sampleGardenData(): GardenData {
  return structuredClone(SAMPLE_GARDEN);
}
