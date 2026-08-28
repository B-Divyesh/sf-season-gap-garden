import { describe, expect, it } from 'vitest';
import { csvCell, toCsv, validateGardenData } from '../src/storage';
import type { GardenData } from '../src/types';

const data: GardenData = {
  version: 1,
  beds: [{ id: 'b1', name: 'Patio, north', notes: '', createdAt: '2026-01-01T00:00:00.000Z' }],
  plantings: [{ id: 'p1', bedId: 'b1', name: 'Bean "Encore"', kind: 'crop', sowDate: '2026-04-01', clearDate: '2026-05-01', notes: 'saved', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }],
  templates: [],
  settings: { seasonStart: '2026-03-01', seasonEnd: '2026-11-01' },
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('portable garden data', () => {
  it('quotes commas and double quotes in CSV', () => {
    expect(csvCell('Bean "Encore", early')).toBe('"Bean ""Encore"", early"');
    expect(toCsv(data)).toContain('"Patio, north","crop","Bean ""Encore"""');
  });

  it('accepts a valid version 1 backup', () => {
    expect(validateGardenData(data)).toBe(data);
  });

  it('rejects unsupported or malformed backups', () => {
    expect(() => validateGardenData({ version: 2 })).toThrow('not supported');
    expect(() => validateGardenData({ ...data, settings: { seasonStart: '2026-12-01', seasonEnd: '2026-02-01' } })).toThrow('invalid season');
  });

  it('rejects malformed nested records before they can replace a notebook', () => {
    const malformedBackups: Array<[string, unknown, string]> = [
      ['a bed without required fields', { ...data, beds: [{}] }, 'bed 1 ID'],
      ['an entry with an unknown bed', { ...data, plantings: [{ ...data.plantings[0], bedId: 'missing-bed' }] }, 'bed reference'],
      ['an entry with an unsupported type', { ...data, plantings: [{ ...data.plantings[0], kind: 'compost' }] }, 'entry 1 type'],
      ['an impossible calendar date', { ...data, plantings: [{ ...data.plantings[0], clearDate: '2026-02-30' }] }, 'clear date'],
      ['an entry whose clear date is not after its start', { ...data, plantings: [{ ...data.plantings[0], clearDate: '2026-04-01' }] }, 'date order'],
      ['an out-of-range crop duration', { ...data, templates: [{ id: 't1', name: 'Salad leaves', durationDays: 367, notes: '', createdAt: '2026-01-01T00:00:00.000Z' }] }, 'duration'],
    ];

    for (const [description, backup, message] of malformedBackups) {
      expect(() => validateGardenData(backup), description).toThrow(message);
    }
  });
});
