import { describe, expect, it } from 'vitest';
import { csvCell, toCsv, validateGardenData } from '../src/storage';
import type { GardenData } from '../src/types';

const data: GardenData = {
  version: 1,
  beds: [{ id: 'b1', name: 'Patio, north', notes: '', createdAt: '' }],
  plantings: [{ id: 'p1', bedId: 'b1', name: 'Bean "Encore"', kind: 'crop', sowDate: '2026-04-01', clearDate: '2026-05-01', notes: 'saved', createdAt: '', updatedAt: '' }],
  templates: [],
  settings: { seasonStart: '2026-03-01', seasonEnd: '2026-11-01' },
  updatedAt: '',
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
});
