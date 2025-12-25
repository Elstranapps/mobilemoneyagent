import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';

export default function FloatStatus() {
  const { session } = useAuth();
  const [data, setData] = useState({ opening: 0, currentFloat: 0, cash: 0, diff: 0, updated: '' });

  useEffect(() => { (async () => {
    if (!session) return;
    const sum = await MockApi.computeDaily(session.agentId);
    const opening = 0; // TODO: load agent.openingFloat
    const currentFloat = opening + sum.totals.totalCashIn - sum.totals.totalCashOut;
    const cash = sum.totals.totalCashOut - sum.totals.totalCashIn;
    const diff = currentFloat - opening; // simplistic diff
    setData({ opening, currentFloat, cash, diff, updated: new Date().toLocaleTimeString() });
  })(); }, [session]);

  return <div className="pb-20">
    <Header title="Float Status" />
    <div className="p-4 grid gap-3">
      <Card><div className="text-sm text-gray-500">Opening float</div><div className="text-xl">UGX {fmt(data.opening)}</div></Card>
      <Card><div className="text-sm text-gray-500">Current float</div><div className="text-xl">UGX {fmt(data.currentFloat)}</div></Card>
      <Card><div className="text-sm text-gray-500">Cash balance</div><div className="text-xl">UGX {fmt(data.cash)}</div></Card>
      <Card><div className="text-sm text-gray-500">Difference</div><div className="text-xl">UGX {fmt(data.diff)}</div></Card>
      <div className="text-sm text-gray-500">Last updated: {data.updated}</div>
      <button className="px-3 py-2 border rounded" onClick={()=>window.location.reload()}>Refresh</button>
    </div>
  </div>;
}

function fmt(n: number) { return (n||0).toLocaleString('en-UG'); }
