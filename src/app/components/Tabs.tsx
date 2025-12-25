import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transaction/new', label: 'New Tx' },
  { to: '/summary', label: 'Summary' },
  { to: '/reports', label: 'Reports' },
];

export function Tabs() {
  const loc = useLocation();
  return <nav className="fixed bottom-0 left-0 right-0 border-t bg-white grid grid-cols-4">
    {items.map(it => {
      const active = loc.pathname === it.to;
      return <Link key={it.to} to={it.to} className={`p-3 text-center ${active ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>{it.label}</Link>;
    })}
  </nav>;
}
