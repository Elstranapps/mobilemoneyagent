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
  const [mtnVerified, setMtnVerified] = useState(false);
  const [airtelVerified, setAirtelVerified] = useState(false);

  async function submit() {
    if (!session) return;
    if (!mtnVerified || !airtelVerified) { alert('Please verify both MTN and Airtel before continuing.'); return; }
    setLoading(true);
    try {
      await MockApi.saveOnboarding(session.agentId, { name, network, openingFloat: Number(opening||0), mtnVerified: true, airtelVerified: true, onboarded: true });
      window.location.href = '/dashboard';
    } finally { setLoading(false); }
  }

  return <div className="pb-20">
    <Header title="Onboarding" />
    <div className="p-4 flex flex-col gap-4">
      <input placeholder="Agent name" value={name} onChange={e=>setName(e.target.value)} className="border rounded px-3 py-2" />
      <div className="border rounded p-3">
        <div className="text-sm text-gray-700 font-semibold">Connect networks (one-time)</div>
        <div className="flex gap-2 mt-2">
          <button className={`px-3 py-2 border rounded btn-mtn ${mtnVerified ? '' : ''}`} onClick={async ()=>{ if (!session) return; await MockApi.verifyNetwork(session.agentId,'MTN'); setMtnVerified(true); }}>Verify MTN</button>
          <button className={`px-3 py-2 border rounded btn-airtel ${airtelVerified ? '' : ''}`} onClick={async ()=>{ if (!session) return; await MockApi.verifyNetwork(session.agentId,'Airtel'); setAirtelVerified(true); }}>Verify Airtel</button>
        </div>
        <div className="text-sm text-gray-600 mt-1">Both must be verified before continuing.</div>
      </div>
      <NumericInput label="Opening float (UGX)" value={opening} onChange={e=>setOpening(e.target.value)} />
      <Button onClick={submit} loading={loading} disabled={!name || !mtnVerified || !airtelVerified}>Continue</Button>
    </div>
  </div>;
}
