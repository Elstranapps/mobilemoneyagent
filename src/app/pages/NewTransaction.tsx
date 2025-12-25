import React, { useState } from 'react';
import { Header } from '../components/Header';
import { NumericInput } from '../components/NumericInput';
import { Button } from '../components/Button';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';

export default function NewTransaction() {
  const { session } = useAuth();
  const [type, setType] = useState<'cash_in'|'cash_out'>('cash_in');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'MTN'|'Airtel'>('MTN');
  const [commission, setCommission] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  function updateCommission(val: string) {
    const amt = Number(val||0);
    setCommission(Math.round(amt * 0.005)); // 0.5% display estimate; authoritative calc in API
  }

  async function save() {
    if (!session) return;
    setSaving(true); setError(null);
    try {
      await MockApi.addTransaction(session.agentId, type, Number(amount||0), network);
      window.location.href = '/dashboard';
    } catch (e:any) {
      setError(e?.message || 'Failed to save');
    } finally { setSaving(false); }
  }

  return <div className="pb-20">
    <Header title="New Transaction" />
    <div className="p-4 flex flex-col gap-4">
      <label className="flex gap-3">
        <button className={`px-3 py-2 rounded border ${type==='cash_in'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={()=>setType('cash_in')}>Cash-in</button>
        <button className={`px-3 py-2 rounded border ${type==='cash_out'?'bg-blue-50 border-blue-300':'border-gray-300'}`} onClick={()=>setType('cash_out')}>Cash-out</button>
      </label>
      <NumericInput label="Amount (UGX)" value={amount} onChange={e=>{ setAmount(e.target.value); updateCommission(e.target.value); }} />
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Network</span>
        <select value={network} onChange={e=>setNetwork(e.target.value as any)} className="border rounded px-3 py-2">
          <option>MTN</option>
          <option>Airtel</option>
        </select>
      </label>
      <div className="text-sm text-gray-600">Estimated commission: UGX {commission.toLocaleString('en-UG')}</div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={save} loading={saving} disabled={!amount}>Save</Button>
        <Button variant="secondary" onClick={()=>window.history.back()}>Cancel</Button>
      </div>
    </div>
  </div>;
}
