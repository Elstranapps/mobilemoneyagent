import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { NumericInput } from '../components/NumericInput';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { useLocation } from 'react-router-dom';

function formatAmountInput(raw: string) {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return { display: '', value: 0 };
  const value = Number(digits);
  // Format with commas
  const display = value.toLocaleString('en-UG');
  return { display, value };
}

export default function NewTransaction() {
  const { session } = useAuth();
  const loc = useLocation();
  const [type, setType] = useState<'cash_in'|'cash_out'|'send_money'>('cash_in');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountValue, setAmountValue] = useState(0);
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

  function onAmountChange(raw: string) {
    const { display, value } = formatAmountInput(raw);
    setAmountDisplay(display);
    setAmountValue(value);
    // estimate commission live
    const rate = agentRate ?? 0.5;
    setCommission(Math.round((value * rate) / 100));
  }

  const validationError = (() => {
    if (!amountDisplay) return 'Amount is required';
    if (amountValue <= 0) return 'Enter a valid amount';
    return null;
  })();

  function saveBtnClass() {
    if (type === 'cash_in') return 'btn-action btn-mtn';
    if (type === 'cash_out') return 'btn-action btn-airtel';
    return 'btn-action btn-send';
  }

  async function save() {
    if (!session) return;
    setSaving(true); setError(null);
    try {
      await MockApi.addTransaction(session.agentId, type, amountValue, network);
      const verb = type === 'cash_in' ? 'Deposit' : (type === 'cash_out' ? 'Withdrawal' : 'Send Money');
      setToast({ kind: 'success', msg: `${verb} of UGX ${amountValue.toLocaleString('en-UG')} saved` });
      setTimeout(()=> window.location.href = '/dashboard', 700);
    } catch (e:any) {
      const msg = e?.message || 'Failed to save';
      setError(msg);
      setToast({ kind: 'error', msg });
    } finally { setSaving(false); }
  }

  return <div className="pb-20">
    <Header title="New Transaction" />
    <div className="p-4 flex flex-col gap-4">
      {/* Helper: what is the customer doing? */}
      <div className="text-sm text-gray-700">What is the customer doing?</div>
      <div className="flex gap-3" aria-label="Choose transaction type">
        <button className={`px-3 py-2 rounded border ${type==='cash_in'?'btn-mtn':'border-gray-300'}`} onClick={()=>setType('cash_in')}>Deposit Money</button>
        <button className={`px-3 py-2 rounded border ${type==='cash_out'?'btn-airtel':'border-gray-300'}`} onClick={()=>setType('cash_out')}>Withdraw Money</button>
        <button className={`px-3 py-2 rounded border ${type==='send_money'?'btn-send':'border-gray-300'}`} onClick={()=>setType('send_money')}>Send Money</button>
      </div>

      {/* Amount input */}
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Amount (UGX)</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={amountDisplay}
          placeholder="Enter amount given by customer"
          onChange={e=>onAmountChange(e.target.value)}
          className="border rounded px-3 py-2 text-lg"
        />
        {validationError && <span className="text-sm" style={{color:'#b91c1c'}}>{validationError}</span>}
      </label>

      {/* Network selection */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-700">Customer network</span>
        <div className="flex gap-2">
          <button className={`px-3 py-2 border ${network==='MTN' ? 'btn-mtn' : ''}`} onClick={()=>setNetwork('MTN')}>MTN</button>
          <button className={`px-3 py-2 border ${network==='Airtel' ? 'btn-airtel' : ''}`} onClick={()=>setNetwork('Airtel')}>Airtel</button>
        </div>
        <span className="text-sm text-gray-600">Select the customer’s mobile money network</span>
      </div>

      {/* Commission section */}
      <div className="border rounded p-3">
        <div className="text-sm text-gray-700 font-semibold">Estimated Commission</div>
        <div className="font-semibold" style={{fontSize:'20px'}}>UGX {commission.toLocaleString('en-UG')}</div>
        <div className="text-sm text-gray-600">Based on your rate of {agentRate ?? 0.5}%</div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Primary/secondary actions */}
      <div className="flex flex-col gap-2">
        <button className={saveBtnClass()} style={{ width: '100%', textDecoration:'none' }} onClick={save} disabled={!!validationError || saving || !network}>
          {saving ? 'Saving…' : 'Save Transaction'}
        </button>
        <button className="px-3 py-2 text-gray-700" onClick={()=>window.history.back()} style={{ background:'transparent', border:'none', textDecoration:'underline', width:'fit-content' }}>Cancel</button>
      </div>

      {toast && <Toast kind={toast.kind} message={toast.msg} onClose={()=>setToast(null)} />}
    </div>
  </div>;
}
