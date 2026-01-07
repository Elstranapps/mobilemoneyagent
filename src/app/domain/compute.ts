import { DailySummaryTotals, TxType, Transaction } from './types';

export function computeTotals(transactions: Transaction[]): DailySummaryTotals {
  const totals: DailySummaryTotals = { totalCashIn: 0, totalCashOut: 0, totalWithdraw: 0, totalSendMoney: 0, totalCommission: 0, netProfit: 0 };
  for (const t of transactions) {
    if (t.type === 'cash_in') {
      totals.totalCashIn += t.amount;
    } else if (t.type === 'cash_out') {
      totals.totalWithdraw += t.amount;
    } else if (t.type === 'send_money') {
      totals.totalSendMoney += t.amount;
    }
    totals.totalCommission += t.commission;
  }
  totals.totalCashOut = totals.totalWithdraw + totals.totalSendMoney;
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
