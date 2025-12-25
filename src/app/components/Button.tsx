import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary'|'secondary'|'mtn'|'airtel' };
export function Button({ loading, variant='primary', children, ...rest }: Props) {
  const base = 'px-4 py-3 rounded text-white text-base disabled:opacity-50';
  let color = variant==='primary' ? 'bg-blue-600' : variant==='secondary' ? 'bg-gray-600' : '';
  if (variant==='mtn') color = 'btn-mtn btn-rounded';
  if (variant==='airtel') color = 'btn-airtel btn-rounded';
  return <button {...rest} disabled={loading || rest.disabled} className={`${base} ${color} ${rest.className||''}`}>
    {loading ? 'Please wait…' : children}
  </button>;
}
