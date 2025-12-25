import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { MockApi } from '../services/mockApi';
import { useAuth } from '../state/auth';

export default function Settings() {
  const { session } = useAuth();
  const [rate, setRate] = useState('0.5');
  const [opening, setOpening] = useState('0');

  useEffect(() => { (async () => {
    if (!session) return;
    const a = await MockApi.getAgent(session.agentId);
    setRate(String(a.commissionRatePct));
    setOpening(String(a.openingFloat));
  })(); }, [session]);

  async function save() {
    if (!session) return;
    await MockApi.updateAgent(session.agentId, { commissionRatePct: Number(rate||0), openingFloat: Number(opening||0) });
    alert('Saved');
  }

  return <div className="pb-20">
    <Header title="Settings" />
    <div className="p-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Commission rate (%)</span>
        <input value={rate} onChange={e=>setRate(e.target.value)} className="border rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Opening float (UGX)</span>
        <input value={opening} onChange={e=>setOpening(e.target.value)} className="border rounded px-3 py-2" />
      </label>
      <button className="px-3 py-2 border rounded" onClick={save}>Save</button>
      <div className="text-sm text-gray-500">Language: English (more coming soon)</div>
    </div>
  </div>;
}
