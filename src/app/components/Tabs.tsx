import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/transaction/new', label: 'New', icon: '➕' },
  { to: '/summary', label: 'Summary', icon: '📊' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

export function Tabs() {
  const loc = useLocation();
  return <nav className="fixed bottom-0 left-0 right-0 border-t bg-white flex items-center z-50" style={{height: '64px', background: 'linear-gradient(90deg, var(--brand-airtel) 0%, var(--brand-mtn) 100%)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))'}} >
    <div style={{display:'flex', gap: '28px', margin: '0 auto'}}>
    {items.map(it => {
      const active = loc.pathname === it.to;
      return (
        <Link
          key={it.to}
          to={it.to}
          aria-label={it.label}
          title={it.label}
          className={`p-3 text-center flex items-center justify-center ${active ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
        >
          <span style={{
            fontSize: '32px',
            lineHeight: '32px',
            background: active ? 'rgba(255,255,255,0.35)' : 'transparent',
            borderRadius: '12px',
            padding: active ? '6px' : '0'
          }}>{it.icon}</span>
        </Link>
      );
    })}
    </div>
  </nav>;
}
