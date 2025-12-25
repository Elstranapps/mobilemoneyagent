import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { NumericInput } from '../components/NumericInput';
import { Card } from '../components/Card';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { Toast } from '../components/Toast';
import { Info } from '../components/Info';

export default function Summary() {
  const { session } = useAuth();
  const [data, setData] = useState({ in: 0, out: 0, withdraw: 0, send: 0, comm: 0, profit: 0, opening: 0, closing: 0, closed: false });
  const [toast, setToast] = useState<{kind:'success'|'error'|'info',msg:string}|null>(null);

  async function load() {
    if (!session) return;
    const sum = await MockApi.computeDaily(session.agentId);
    setData({ in: sum.totals.totalCashIn, out: sum.totals.totalCashOut, withdraw: sum.totals.totalWithdraw, send: sum.totals.totalSendMoney, comm: sum.totals.totalCommission, profit: sum.totals.netProfit, opening: sum.openingFloat, closing: sum.closingFloat, closed: sum.closed });
  }

  useEffect(() => { void load(); }, [session]);

  async function closeDay() { if (!session) return; await MockApi.closeDay(session.agentId); await load(); setToast({ kind:'success', msg:'Day closed successfully' }); }
  async function setOpening(val: string) { if (!session) return; await MockApi.updateAgent(session.agentId, { openingFloat: Number(val||0) }); await load(); setToast({ kind:'success', msg:'Opening float updated' }); }
  function share() { setToast({ kind:'info', msg:'Share/export not implemented in MVP' }); }

  return <div className="pb-20">
    <Header title="Daily Summary" />
    <div className="p-4 grid gap-3">
      <Card>
        <div className="text-sm text-gray-500">Opening float <Info text="Starting float at the beginning of the day" /></div>
        <div className="flex items-center gap-2">
          <div className="text-xl">UGX {fmt(data.opening)}</div>
          <NumericInput aria-label="Set opening float" value={String(data.opening)} onChange={e=>setOpening(e.target.value)} />
        </div>
      </Card>
      <Card><div className="text-sm" style={{color:'#14532d'}}>Total commission <Info text="Earnings from today’s transactions" /></div><div className="text-xl" style={{color:'var(--brand-earn)'}}>UGX {fmt(data.comm)}</div></Card>
      <Card><div className="text-sm" style={{color:'#5a4b00'}}>Total cash-in <Info text="Deposits recorded today" /></div><div className="text-xl">UGX {fmt(data.in)}</div></Card>
      <Card><div className="text-sm" style={{color:'#7a1216'}}>Total withdraw <Info text="Cash given to customers" /></div><div className="text-xl">UGX {fmt(data.withdraw)}</div></Card>
      <Card><div className="text-sm" style={{color:'#7a1216'}}>Total send money <Info text="Transfers sent for customers" /></div><div className="text-xl">UGX {fmt(data.send)}</div></Card>
      <Card><div className="text-sm text-gray-500">Total cash-out</div><div className="text-xl">UGX {fmt(data.out)}</div></Card>
      <Card><div className="text-sm text-gray-500">Closing float <Info text="Float after today’s activity" /></div><div className="text-xl">UGX {fmt(data.closing)}</div></Card>
      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={closeDay} disabled={data.closed}>Close day</button>
        <button className="px-3 py-2 border rounded" onClick={share}>Share / export</button>
      </div>
    </div>
  </div>;
}

function fmt(n: number) { return (n||0).toLocaleString('en-UG'); }
