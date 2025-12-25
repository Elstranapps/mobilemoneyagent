import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Tabs } from '../components/Tabs';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { OfflineBanner } from '../components/OfflineBanner';
import { useSyncStatus } from '../state/sync';

export default function Dashboard() {
  const { session } = useAuth();
  const { status } = useSyncStatus();
  const [totals, setTotals] = useState({ float: 0, cash: 0, profit: 0 });

  useEffect(() => {
    async function load() {
      if (!session) return;
      const sum = await MockApi.computeDaily(session.agentId);
      const opening = sum.openingFloat;
      const float = sum.closingFloat;
      const cash = sum.totals.totalCashOut - sum.totals.totalCashIn;
      setTotals({ float, cash, profit: sum.totals.totalCommission });
    }
    void load();
  }, [session]);

  return <div className="pb-20">
    <Header title="Dashboard" />
    <OfflineBanner status={status} />
    <div className="p-4 grid gap-3">
      <Card><div className="text-sm text-gray-500">Current float</div><div className="text-2xl font-semibold">UGX {fmt(totals.float)}</div></Card>
      <Card><div className="text-sm text-gray-500">Cash on hand</div><div className="text-2xl font-semibold">UGX {fmt(totals.cash)}</div></Card>
      <Card><div className="text-sm text-gray-500">Today's profit</div><div className="text-2xl font-semibold">UGX {fmt(totals.profit)}</div></Card>
    </div>
    <Tabs />
  </div>;
}

function fmt(n: number) { return (n||0).toLocaleString('en-UG'); }
