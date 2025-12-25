import React from 'react';

export function Toast({ kind='success', message, onClose }: { kind?: 'success'|'error'|'info'; message: string; onClose?: ()=>void }) {
  const color = kind==='success' ? 'bg-green-100 text-green-800' : kind==='error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow ${color}`} role="status">
      <span>{message}</span>
      {onClose && <button className="ml-3 underline" onClick={onClose}>Dismiss</button>}
    </div>
  );
}
