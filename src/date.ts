import type { Bed, Gap, Planting, Settings } from './types';

const DAY = 86_400_000;

export function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

export function daysBetween(start: string, end: string): number {
  return Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / DAY);
}

export function plantingStart(planting: Planting): string {
  return planting.transplantDate || planting.sowDate || planting.clearDate;
}

export function formatDate(value: string, withYear = false): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(parseDate(value));
}

export function findGaps(beds: Bed[], plantings: Planting[], settings: Settings): Gap[] {
  const gaps: Gap[] = [];
  for (const bed of beds) {
    const items = plantings
      .filter((item) => item.bedId === bed.id)
      .sort((a, b) => plantingStart(a).localeCompare(plantingStart(b)));
    let cursor = settings.seasonStart;
    let previousId: string | undefined;

    for (const item of items) {
      const start = plantingStart(item);
      if (daysBetween(cursor, start) > 0) {
        gaps.push({ bedId: bed.id, start: cursor, end: start, days: daysBetween(cursor, start), afterPlantingId: previousId });
      }
      if (item.clearDate > cursor) cursor = item.clearDate;
      previousId = item.id;
    }
    if (daysBetween(cursor, settings.seasonEnd) > 0) {
      gaps.push({ bedId: bed.id, start: cursor, end: settings.seasonEnd, days: daysBetween(cursor, settings.seasonEnd), afterPlantingId: previousId });
    }
  }
  return gaps;
}

export function percentAcross(date: string, settings: Settings): number {
  const total = Math.max(1, daysBetween(settings.seasonStart, settings.seasonEnd));
  return Math.min(100, Math.max(0, (daysBetween(settings.seasonStart, date) / total) * 100));
}

export function monthTicks(settings: Settings): Array<{ label: string; left: number }> {
  const start = parseDate(settings.seasonStart);
  const end = parseDate(settings.seasonEnd);
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1, 12);
  const ticks: Array<{ label: string; left: number }> = [];
  while (cursor <= end) {
    const value = toDateInput(cursor);
    if (cursor >= start) {
      ticks.push({ label: cursor.toLocaleDateString('en', { month: 'short' }), left: percentAcross(value, settings) });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
}
