import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { NumericInput } from '../components/NumericInput';
import { useAuth } from '../state/auth';
import { Header } from '../components/Header';
import { normalizeUgPhone, isLikelyUgMobile } from '../services/phone';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { requestOtp, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone'|'otp'>('phone');
  // Normalize to E.164-like form for Uganda (e.g., +2567XXXXXXXX)
  const normalized = normalizeUgPhone(phone);
  const phoneValid = !!normalized && isLikelyUgMobile(phone);

  async function handleRequest() {
    if (!normalized) return;
    await requestOtp(normalized);
    setStage('otp');
  }
  async function handleVerify() {
    if (!normalized) return;
    await verifyOtp(normalized, otp);
    // After verify, navigate out of login
    setStage('phone');
    navigate('/dashboard');
  }

  return <div className="pb-20">
    <Header title="Login" />
    {stage==='phone' ? (
      <div className="p-4 flex flex-col gap-4">
        <input placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)} className="border rounded px-3 py-2" />
        {!phoneValid && phone.length>0 && (
          <div className="text-sm text-red-600">
            Enter a valid Airtel or MTN UG number (e.g., 070xxxxxxx, 075xxxxxxx, 077/078/076xxxxxxx). +256 accepted.
          </div>
        )}
        <Button onClick={handleRequest} loading={loading} disabled={!phoneValid}> {loading ? 'Requesting…' : 'Request OTP'} </Button>
      </div>
    ) : (
      <div className="p-4 flex flex-col gap-4">
        <NumericInput label="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
        <Button onClick={handleVerify} loading={loading} disabled={otp.length<4}>Verify</Button>
      </div>
    )}
  </div>;
}
