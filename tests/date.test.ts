import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, findGaps } from '../src/date';
import type { Bed, Planting, Settings } from '../src/types';

const bed: Bed = { id: 'bed-1', name: 'North bed', notes: '', createdAt: '2026-01-01T00:00:00Z' };
const settings: Settings = { seasonStart: '2026-03-01', seasonEnd: '2026-06-01' };

describe('garden date arithmetic', () => {
  it('adds a user-defined duration across month boundaries', () => {
    expect(addDays('2026-03-20', 28)).toBe('2026-04-17');
  });

  it('counts open days without including the end date', () => {
    expect(daysBetween('2026-04-01', '2026-04-15')).toBe(14);
  });

  it('finds gaps before, between, and after dated entries', () => {
    const plantings: Planting[] = [
      { id: 'p1', bedId: bed.id, name: 'Peas', kind: 'crop', transplantDate: '2026-03-10', clearDate: '2026-04-10', notes: '', createdAt: '', updatedAt: '' },
      { id: 'p2', bedId: bed.id, name: 'Beans', kind: 'crop', transplantDate: '2026-04-20', clearDate: '2026-05-20', notes: '', createdAt: '', updatedAt: '' },
    ];
    expect(findGaps([bed], plantings, settings).map(({ start, end, days }) => ({ start, end, days }))).toEqual([
      { start: '2026-03-01', end: '2026-03-10', days: 9 },
      { start: '2026-04-10', end: '2026-04-20', days: 10 },
      { start: '2026-05-20', end: '2026-06-01', days: 12 },
    ]);
  });

  it('treats intentional rest as occupied time', () => {
    const rest: Planting = { id: 'r1', bedId: bed.id, name: 'Bed rest', kind: 'rest', transplantDate: settings.seasonStart, clearDate: settings.seasonEnd, notes: '', createdAt: '', updatedAt: '' };
    expect(findGaps([bed], [rest], settings)).toEqual([]);
  });
});
