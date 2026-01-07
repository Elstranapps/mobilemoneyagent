import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Tabs } from '../components/Tabs';
import { useAuth } from '../state/auth';
import { MockApi } from '../services/mockApi';
import { OfflineBanner } from '../components/OfflineBanner';
import { useSyncStatus } from '../state/sync';
import { Info } from '../components/Info';
import { Link } from 'react-router-dom';

function todayLabel() {
  try {
    return new Date().toLocaleDateString('en-UG', { day: '2-digit', month: 'short' });
  } catch { return ''; }
}

export default function Dashboard() {
  const { session } = useAuth();
  const { status } = useSyncStatus();
  const [totals, setTotals] = useState({ float: 0, cash: 0, commission: 0 });
  const [closed, setClosed] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!session) return;
      const sum = await MockApi.computeDaily(session.agentId);
      const float = sum.closingFloat;
      const cash = sum.totals.totalCashOut - sum.totals.totalCashIn;
      const commission = sum.totals.totalCommission;
      setTotals({ float, cash, commission });
      setClosed(!!sum.closed);
      const txs = await MockApi.listTransactions(session.agentId);
      if (txs.length) {
        const last = [...txs].sort((a,b)=>b.timestamp.localeCompare(a.timestamp))[0];
        const label = last.type === 'cash_in' ? 'Deposit' : (last.type === 'cash_out' ? 'Withdraw' : 'Send');
        const when = timeAgo(last.timestamp);
        setLastTx(`${label} UGX ${fmt(last.amount)} (${when})`);
      } else {
        setLastTx(null);
      }
    }
    void load();
  }, [session]);

  const isEmpty = totals.float === 0 && totals.cash === 0 && totals.commission === 0;

  return <div className="pb-20">
    <Header title="Dashboard" />

    {/* Date + day status + online chip */}
    <div className="p-4 flex items-center justify-between text-sm">
      <div>
        <div className="font-semibold">Today • {todayLabel()}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded-full" style={{background: closed ? 'rgba(0,0,0,0.08)' : 'rgba(22, 163, 74, 0.15)', color: closed ? '#333' : '#14532d'}}>{closed ? '🔒 Day Closed' : '🟢 Day Open'}</span>
          <span className="px-2 py-0.5 rounded-full" style={{background: status.isOnline ? 'rgba(22, 163, 74, 0.15)' : 'rgba(0,0,0,0.08)', color: status.isOnline ? '#14532d' : '#333'}}>{status.isOnline ? '🟢 Online' : '📴 Offline — saved locally'}</span>
        </div>
      </div>
    </div>

    <OfflineBanner status={status} />

    <div className="p-4 grid gap-3">
      <Card>
        <div className="text-sm" style={{color:'#5a4b00'}}>Current Float <Info text="Money in your mobile wallet" /></div>
        <div className="font-semibold" style={{fontSize:'28px'}}>UGX {fmt(totals.float)}</div>
        <div style={{height:4, background:'var(--brand-mtn)', borderRadius:2, marginTop:6}}/>
      </Card>
      <Card>
        <div className="text-sm" style={{color:'#7a1216'}}>Cash on Hand <Info text="Physical cash in your shop" /></div>
        <div className="font-semibold" style={{fontSize:'28px'}}>UGX {fmt(totals.cash)}</div>
        <div style={{height:4, background:'var(--brand-airtel)', borderRadius:2, marginTop:6}}/>
      </Card>
      <Card>
        <div className="text-sm" style={{color:'#14532d'}}>Today’s Commission <Info text="Earnings from today’s transactions" /></div>
        <div className="font-semibold" style={{fontSize:'28px', color:'var(--brand-earn)'}}>UGX {fmt(totals.commission)}</div>
        <div style={{height:4, background:'var(--brand-earn)', borderRadius:2, marginTop:6}}/>
      </Card>

      {/* Quick actions */}
      <div className="flex justify-center" style={{ width: '100%' }}>
        <div className="flex gap-4 mt-3" style={{ width: 'fit-content' }}>
          <Link to="/transaction/new?type=cash_in" className="btn-action btn-mtn" style={{ textDecoration: 'none' }}>Deposit</Link>
          <Link to="/transaction/new?type=cash_out" className="btn-action btn-airtel" style={{ textDecoration: 'none' }}>Withdraw</Link>
          <Link to="/transaction/new?type=send_money" className="btn-action btn-send" style={{ textDecoration: 'none' }}>Send</Link>
        </div>
      </div>

      {/* Empty state guidance */}
      {isEmpty && (
        <div className="text-sm text-gray-700" style={{marginTop:4}}>No transactions yet. Tap <b>+</b> to record your first transaction.</div>
      )}

      {/* Last transaction hint */}
      {lastTx && (
        <div className="text-sm text-gray-700" style={{marginTop:4}}>Last transaction: {lastTx}</div>
      )}
    </div>

    <Tabs />
  </div>;
}

function fmt(n: number) { return (n||0).toLocaleString('en-UG'); }
function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const mins = Math.round(diff/60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins===1?'':'s'} ago`;
  const hrs = Math.round(mins/60);
  if (hrs < 24) return `${hrs} hour${hrs===1?'':'s'} ago`;
  const days = Math.round(hrs/24);
  return `${days} day${days===1?'':'s'} ago`;
}
