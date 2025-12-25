import React from 'react';
import { SyncStatus } from '../domain/types';

export function OfflineBanner({ status }: { status: SyncStatus }) {
  if (status.isOnline && !status.hasUnsynced) return null;
  const msg = !status.isOnline ? 'Offline: changes will sync when back online' : 'Pending sync…';
  return <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">{msg}</div>;
}
