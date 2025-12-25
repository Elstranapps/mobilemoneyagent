import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import FloatStatus from './pages/FloatStatus';
import Summary from './pages/Summary';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import { AuthProvider, useAuth } from './state/auth';
import { isDespiaEnv } from '../native/despia';
import { Tabs } from './components/Tabs';

function Guarded({ children }: { children: any }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function WithTabs({ children }: { children: any }) {
  const loc = useLocation();
  const hideTabs = loc.pathname.startsWith('/login') || loc.pathname.startsWith('/onboarding');
  return (
    <>
      {children}
      {!hideTabs && <Tabs />}
    </>
  );
}

export default function App() {
  void isDespiaEnv; // ensure tree-shaken import keeps env helper
  return (
    <AuthProvider>
      <BrowserRouter>
        <WithTabs>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Guarded><Onboarding /></Guarded>} />
            <Route path="/dashboard" element={<Guarded><Dashboard /></Guarded>} />
            <Route path="/transaction/new" element={<Guarded><NewTransaction /></Guarded>} />
            <Route path="/float" element={<Guarded><FloatStatus /></Guarded>} />
            <Route path="/summary" element={<Guarded><Summary /></Guarded>} />
            <Route path="/history" element={<Guarded><History /></Guarded>} />
          <Route path="/reports" element={<Guarded><Reports /></Guarded>} />
            <Route path="/settings" element={<Guarded><Settings /></Guarded>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WithTabs>
      </BrowserRouter>
    </AuthProvider>
  );
}
