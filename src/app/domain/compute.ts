import { DailySummaryTotals, TxType, Transaction } from './types';

export function computeTotals(transactions: Transaction[]): DailySummaryTotals {
  const totals: DailySummaryTotals = { totalCashIn: 0, totalCashOut: 0, totalCommission: 0, netProfit: 0 };
  for (const t of transactions) {
    if (t.type === 'cash_in') totals.totalCashIn += t.amount; else totals.totalCashOut += t.amount;
    totals.totalCommission += t.commission;
  }
  totals.netProfit = totals.totalCommission; // MVP rule
  return totals;
}

export function computeClosingFloat(openingFloat: number, totals: DailySummaryTotals): number {
  return openingFloat + totals.totalCashIn - totals.totalCashOut;
}

export function canCashOut(openingFloat: number, todaysTx: Transaction[], requestedAmount: number): boolean {
  const totals = computeTotals(todaysTx);
  const currentFloat = computeClosingFloat(openingFloat, totals);
  return requestedAmount <= currentFloat;
}
