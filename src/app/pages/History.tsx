import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { Transaction } from '../domain/types';

export default function History() {
  const { session } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { (async () => { if (session) setTxs(await MockApi.listTransactions(session.agentId)); })(); }, [session]);

  const filtered = txs.filter(t => t.timestamp.startsWith(query || t.timestamp.slice(0,10)) || t.network.toLowerCase().includes(query.toLowerCase()));

  return <div className="pb-20">
    <Header title="History" />
    <div className="p-4 flex flex-col gap-3">
      <input placeholder="Filter by date (YYYY-MM-DD) or network" value={query} onChange={e=>setQuery(e.target.value)} className="border rounded px-3 py-2" />
      <div className="flex flex-col gap-2">
        {filtered.map(t => (
          <div key={t.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">{new Date(t.timestamp).toLocaleString()}</div>
            <div className="font-semibold">{t.type === 'cash_in' ? 'Cash-in' : 'Cash-out'} — UGX {t.amount.toLocaleString('en-UG')}</div>
            <div className="text-sm">{t.network} • Commission: UGX {t.commission.toLocaleString('en-UG')}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
