import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary'|'secondary' };
export function Button({ loading, variant='primary', children, ...rest }: Props) {
  const base = 'px-4 py-3 rounded text-white text-base disabled:opacity-50';
  const color = variant==='primary' ? 'bg-blue-600' : 'bg-gray-600';
  return <button {...rest} disabled={loading || rest.disabled} className={`${base} ${color} ${rest.className||''}`}>
    {loading ? 'Please wait…' : children}
  </button>;
}
