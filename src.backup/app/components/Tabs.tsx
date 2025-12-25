import React from 'react';\nimport { Link, useLocation } from 'react-router-dom';\n\nconst items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transaction/new', label: 'New Tx' },
  { to: '/summary', label: 'Summary' },
  { to: '/reports', label: 'Reports' },
];\n\nexport function Tabs() {\n  const loc = useLocation();\n  return <nav className="fixed bottom-0 left-0 right-0 border-t bg-white grid grid-cols-4">\n    {items.map(it => {\n      const active = loc.pathname === it.to;\n      return <Link key={it.to} to={it.to} className={`p-3 text-center ${active ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>{it.label}</Link>;\n    })}\n  </nav>;\n}\n