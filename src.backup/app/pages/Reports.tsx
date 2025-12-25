import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { buildWeekReport, buildMonthReport, toCsv } from '../domain/report';

export default function Reports() {
  const { session } = useAuth();
  const today = new Date().toISOString().slice(0,10);
  const monthNow = new Date().toISOString().slice(0,7);
  const [mode, setMode] = useState<'weekly'|'monthly'>('weekly');
  const [weekStart, setWeekStart] = useState<string>(today);
  const [month, setMonth] = useState<string>(monthNow);
  const [txs, setTxs] = useState([]);

  useEffect(() => { (async () => {
    if (!session) return;
    // load all tx for demo simplicity; could filter server-side later
    const all = await MockApi.listTransactions(session.agentId);
    setTxs(all);
  })(); }, [session]);

  const report = useMemo(() => {
    if (mode === 'weekly') return buildWeekReport(txs as any, weekStart);
    return buildMonthReport(txs as any, month);
  }, [mode, txs, weekStart, month]);

  function exportCsv() {
    if (mode === 'weekly') {
      const rows = [
        ['Date','Cash In','Cash Out','Commission','Net Profit'],
        ...report.days.map(d => [d.date, String(d.totals.totalCashIn), String(d.totals.totalCashOut), String(d.totals.totalCommission), String(d.totals.netProfit)])
      ];
      downloadCsv(`weekly_${report.start}_to_${report.end}.csv`, toCsv(rows));
    } else {
      const rows = [
        ['Date','Cash In','Cash Out','Commission','Net Profit'],
        ...report.days.map(d => [d.date, String(d.totals.totalCashIn), String(d.totals.totalCashOut), String(d.totals.totalCommission), String(d.totals.netProfit)])
      ];
      downloadCsv(`monthly_${report.month}.csv`, toCsv(rows));
    }
  }

  return <div className="pb-20">
    <Header title="Reports" />
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <button className={`px-3 py-2 border rounded ${mode==='weekly'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={()=>setMode('weekly')}>Weekly</button>
        <button className={`px-3 py-2 border rounded ${mode==='monthly'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={()=>setMode('monthly')}>Monthly</button>
      </div>

      {mode==='weekly' ? (
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Week start (YYYY-MM-DD)</span>
          <input value={weekStart} onChange={e=>setWeekStart(e.target.value)} className="border rounded px-3 py-2" placeholder="YYYY-MM-DD" />
        </label>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Month (YYYY-MM)</span>
          <input value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2" placeholder="YYYY-MM" />
        </label>
      )}

      <Card>
        <div className="text-sm text-gray-500">Totals</div>
        <div>Cash In: UGX {fmt(report.totals.totalCashIn)}</div>
        <div>Cash Out: UGX {fmt(report.totals.totalCashOut)}</div>
        <div>Commission: UGX {fmt(report.totals.totalCommission)}</div>
        <div>Net Profit: UGX {fmt(report.totals.netProfit)}</div>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">{mode==='weekly' ? `${report.start} → ${report.end}` : report.month}</div>
        <button className="px-3 py-2 border rounded" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="flex flex-col gap-2">
        {report.days.map((d:any) => (
          <div key={d.date} className="border rounded p-3">
            <div className="text-sm text-gray-500">{d.date}</div>
            <div>In: UGX {fmt(d.totals.totalCashIn)} | Out: UGX {fmt(d.totals.totalCashOut)} | Comm: UGX {fmt(d.totals.totalCommission)} | Profit: UGX {fmt(d.totals.netProfit)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function fmt(n: number) { return (n||0).toLocaleString('en-UG'); }
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
