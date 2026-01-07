import { Transaction } from './types';
import { computeTotals } from './compute';

export type DayBucket = { date: string; totals: ReturnType<typeof computeTotals> };
export type WeekReport = { start: string; end: string; days: DayBucket[]; totals: ReturnType<typeof computeTotals> };
export type MonthReport = { month: string; days: DayBucket[]; totals: ReturnType<typeof computeTotals> };

export function filterByRange(txs: Transaction[], start: string, endInclusive: string) {
  return txs.filter(t => {
    const d = t.timestamp.slice(0,10);
    return d >= start && d <= endInclusive;
  });
}

export function groupByDay(txs: Transaction[]): DayBucket[] {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    const d = t.timestamp.slice(0,10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(t);
  }
  const days = Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([date, list]) => ({ date, totals: computeTotals(list) }));
  return days;
}

export function buildWeekReport(txs: Transaction[], start: string): WeekReport {
  const startDate = new Date(start + 'T00:00:00Z');
  const end = new Date(startDate);
  end.setUTCDate(startDate.getUTCDate() + 6);
  const endStr = end.toISOString().slice(0,10);
  const inRange = filterByRange(txs, start, endStr);
  const days = groupByDay(inRange);
  const totals = computeTotals(inRange);
  return { start, end: endStr, days, totals };
}

export function buildMonthReport(txs: Transaction[], month: string): MonthReport {
  // month format: YYYY-MM
  const [y,m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m-1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);
  const inRange = filterByRange(txs, startStr, endStr);
  const days = groupByDay(inRange);
  const totals = computeTotals(inRange);
  return { month, days, totals };
}

export function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(cell => {
    const s = String(cell ?? '');
    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(',')).join('\n');
}
