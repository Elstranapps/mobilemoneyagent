import React from 'react';
export function Info({ text }: { text: string }) {
  // Simple (i) with native title tooltip; long-press on mobile shows system tooltip
  return (
    <span
      title={text}
      aria-label={text}
      style={{
        display: 'inline-block',
        marginLeft: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        background: 'rgba(0,0,0,0.08)',
        color: '#333',
        fontSize: 12,
        lineHeight: '16px',
        textAlign: 'center',
        cursor: 'help'
      }}
    >
      i
    </span>
  );
}
