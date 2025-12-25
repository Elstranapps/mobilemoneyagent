import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };
export function NumericInput({ label, ...rest }: Props) {
  return <label className="flex flex-col gap-1">
    {label && <span className="text-sm text-gray-700">{label}</span>}
    <input inputMode="numeric" pattern="[0-9]*" {...rest} className={`border rounded px-3 py-2 text-lg ${rest.className||''}`} />
  </label>;
}
