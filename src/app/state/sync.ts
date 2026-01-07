import { useEffect, useState } from 'react';
import { SyncStatus } from '../domain/types';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({ isOnline: navigator.onLine, hasUnsynced: false, lastSyncAt: undefined });

  useEffect(() => {
    function on() { setStatus(s => ({ ...s, isOnline: true })); }
    function off() { setStatus(s => ({ ...s, isOnline: false })); }
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return { status, markUnsynced(has: boolean) { setStatus(s => ({ ...s, hasUnsynced: has })); }, markSynced() { setStatus(s => ({ ...s, hasUnsynced: false, lastSyncAt: new Date().toISOString() })); } };
}
