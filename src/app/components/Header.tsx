import React from 'react';
export function Header({ title }: { title: string }) {
  return <div className="p-4 border-b text-lg font-semibold header-bg">{title}</div>;
}
