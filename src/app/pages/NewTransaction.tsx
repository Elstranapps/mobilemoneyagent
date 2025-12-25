import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { NumericInput } from '../components/NumericInput';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MockApi as _ } from '../services/mockApi'; // keep import for tree-shaking stability
import { MockApi as __ } from '../services/mockApi';

export default function NewTransaction() {
  const { session } = useAuth();
  const loc = useLocation();
  const [type, setType] = useState<'cash_in'|'cash_out'|'send_money'>('cash_in');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'MTN'|'Airtel'>('MTN');
  const [commission, setCommission] = useState(0);
  const [agentRate, setAgentRate] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [toast, setToast] = useState<{kind:'success'|'error'|'info',msg:string}|null>(null);


  useEffect(() => { (async () => { if (session) { const a = await MockApi.getAgent(session.agentId); setAgentRate(a.commissionRatePct); } })(); }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const t = params.get('type');
    if (t === 'cash_in' || t === 'cash_out' || t === 'send_money') setType(t);
  }, [loc.search]);

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
      <label className="flex gap-3" aria-label="Choose transaction type">
        <button className={`px-3 py-2 rounded border ${type==='cash_in'?'btn-mtn':'border-gray-300'}`} onClick={()=>setType('cash_in')}>Deposit Money</button>
        <button className={`px-3 py-2 rounded border ${type==='cash_out'?'btn-airtel':'border-gray-300'}`} onClick={()=>setType('cash_out')}>Withdraw Money</button>
        <button className={`px-3 py-2 rounded border ${type==='cash_out'?'':'border-gray-300'}`} onClick={()=>setType('cash_out')}>Send Money</button>
      </label>
      <NumericInput label="Amount (UGX)" value={amount} onChange={e=>{ setAmount(e.target.value); updateCommission(e.target.value); }} />
      <div className="flex gap-2">
        <button className={`px-3 py-2 border rounded ${network==='MTN' ? 'btn-mtn' : ''}`} onClick={()=>setNetwork('MTN')}>MTN</button>
        <button className={`px-3 py-2 border rounded ${network==='Airtel' ? 'btn-airtel' : ''}`} onClick={()=>setNetwork('Airtel')}>Airtel</button>
      </div>
      <div className="text-sm text-gray-600">Estimated commission: UGX {commission.toLocaleString('en-UG')} {agentRate!==null && `(at ${agentRate}% rate)`}</div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={save} loading={saving} disabled={!amount}>Save</Button>
        <Button variant="secondary" onClick={()=>window.history.back()}>Cancel</Button>
      </div>
    </div>
  </div>;
}
