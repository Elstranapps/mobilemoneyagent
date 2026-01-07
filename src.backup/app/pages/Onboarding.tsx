import React, { useState } from 'react';
import { Header } from '../components/Header';
import { NumericInput } from '../components/NumericInput';
import { Button } from '../components/Button';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';

export default function Onboarding() {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [network, setNetwork] = useState<'MTN'|'Airtel'|'Both'>('Both');
  const [opening, setOpening] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!session) return;
    setLoading(true);
    try {
      await MockApi.saveOnboarding(session.agentId, { name, network, openingFloat: Number(opening||0) });
      window.location.href = '/dashboard';
    } finally { setLoading(false); }
  }

  return <div className="pb-20">
    <Header title="Onboarding" />
    <div className="p-4 flex flex-col gap-4">
      <input placeholder="Agent name" value={name} onChange={e=>setName(e.target.value)} className="border rounded px-3 py-2" />
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Network</span>
        <select value={network} onChange={e=>setNetwork(e.target.value as any)} className="border rounded px-3 py-2">
          <option>MTN</option>
          <option>Airtel</option>
          <option>Both</option>
        </select>
      </label>
      <NumericInput label="Opening float (UGX)" value={opening} onChange={e=>setOpening(e.target.value)} />
      <Button onClick={submit} loading={loading} disabled={!name || !network}>Continue</Button>
    </div>
  </div>;
}
