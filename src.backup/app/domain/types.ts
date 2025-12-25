// Domain models for Mobile Money Agent
export type Network = 'MTN' | 'Airtel' | 'Both';
export type TxType = 'cash_in' | 'cash_out';

export interface Agent {
  id: string;
  phone: string;
  name: string;
  network: Network;
  openingFloat: number; // UGX - persists, can be overridden
  commissionRatePct: number; // e.g., 0.5 means 0.5%
  createdAt: string; // ISO
}

export interface Transaction {
  id: string;
  agentId: string;
  type: TxType;
  amount: number; // UGX
  commission: number; // UGX
  network: Exclude<Network, 'Both'>;
  timestamp: string; // ISO
  synced: boolean;
}

export interface DailySummaryTotals {
  totalCashIn: number;
  totalCashOut: number;
  totalCommission: number;
  netProfit: number;
}

export interface DailySummary {
  id: string;
  agentId: string;
  date: string; // YYYY-MM-DD
  openingFloat: number; // start of day
  closingFloat: number; // opening + in - out
  closed: boolean; // frozen when true
  totals: DailySummaryTotals;
}

export interface SyncStatus {
  isOnline: boolean;
  hasUnsynced: boolean;
  lastSyncAt?: string;
}

export interface AuthSession {
  agentId: string;
  phone: string;
  token: string;
}

export type CommissionTable = {
  [key in Exclude<Network, 'Both'>]: {
    ratePct: number; // e.g., 0.5 means 0.5%
  };
};
