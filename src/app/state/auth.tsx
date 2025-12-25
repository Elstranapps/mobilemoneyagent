import { createContext, useContext, useEffect, useState } from 'react';
import { AuthSession } from '../domain/types';
import { Storage } from '../services/storage';
import { MockApi } from '../services/mockApi';

interface AuthCtx {
  session: AuthSession | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: any }) {
  const [session, setSession] = useState<AuthSession | null>(Storage.getSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => { Storage.saveSession(session); }, [session]);

  async function requestOtp(phone: string) {
    setLoading(true);
    try { await MockApi.requestOtp(phone); } finally { setLoading(false); }
  }
  async function verifyOtp(phone: string, otp: string) {
    setLoading(true);
    try { const s = await MockApi.verifyOtp(phone, otp); setSession(s); } finally { setLoading(false); }
  }
  function logout() { setSession(null); Storage.saveSession(null); }

  return <Ctx.Provider value={{ session, loading, requestOtp, verifyOtp, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
