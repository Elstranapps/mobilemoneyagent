// Minimal tests for compute functions
import { computeTotals, computeClosingFloat, canCashOut } from '../domain/compute';
import { Transaction } from '../domain/types';

function assert(name: string, condition: boolean) {
  if (!condition) throw new Error('Assertion failed: ' + name);
  // eslint-disable-next-line no-console
  console.log('✓', name);
}

(function testTotalsAndClosing() {
  const opening = 100_000;
  const txs: Transaction[] = [
    { id: '1', agentId: 'a', type: 'cash_in', amount: 50_000, commission: 250, network: 'MTN', timestamp: new Date().toISOString(), synced: false },
    { id: '2', agentId: 'a', type: 'cash_out', amount: 20_000, commission: 100, network: 'Airtel', timestamp: new Date().toISOString(), synced: false },
    { id: '3', agentId: 'a', type: 'send_money', amount: 10_000, commission: 50, network: 'MTN', timestamp: new Date().toISOString(), synced: false },
  ];
  const totals = computeTotals(txs);
  assert('totalCashIn', totals.totalCashIn === 50_000);
  assert('totalWithdraw', totals.totalWithdraw === 20_000);
  assert('totalSendMoney', totals.totalSendMoney === 10_000);
  assert('totalCashOut (sum)', totals.totalCashOut === 30_000);
  assert('totalCommission', totals.totalCommission === 400);
  assert('netProfit', totals.netProfit === 400);
  const closing = computeClosingFloat(opening, totals);
  assert('closingFloat', closing === 130_000);
})();

(function testCanCashOut() {
  const opening = 10_000;
  const txs: Transaction[] = [
    { id: '1', agentId: 'a', type: 'cash_in', amount: 5_000, commission: 25, network: 'MTN', timestamp: new Date().toISOString(), synced: false },
  ];
  assert('can cash out within float', canCashOut(opening, txs, 12_000) === true);
  assert('cannot cash out beyond float', canCashOut(opening, txs, 20_000) === false);
})();

// Note: To run these, execute with ts-node or transpile via your build setup.
