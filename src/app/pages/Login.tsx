import React, { useState } from 'react';
import { Button } from '../components/Button';
import { NumericInput } from '../components/NumericInput';
import { useAuth } from '../state/auth';
import { Header } from '../components/Header';

export default function Login() {
  const { requestOtp, verifyOtp, loading } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone'|'otp'>('phone');

  async function handleRequest() { await requestOtp(phone); setStage('otp'); }
  async function handleVerify() { await verifyOtp(phone, otp); }

  return <div className="pb-20">
    <Header title="Login" />
    {stage==='phone' ? (
      <div className="p-4 flex flex-col gap-4">
        <input placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)} className="border rounded px-3 py-2" />
        <Button onClick={handleRequest} loading={loading} disabled={!/^\\d{9,15}$/.test(phone)}>Request OTP</Button>
      </div>
    ) : (
      <div className="p-4 flex flex-col gap-4">
        <NumericInput label="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
        <Button onClick={handleVerify} loading={loading} disabled={otp.length<4}>Verify</Button>
      </div>
    )}
  </div>;
}
