// Mock API to support offline-first MVP. Replace with real backend later.
import { v4 as uuid } from 'uuid';
import { Agent, AuthSession, Transaction, DailySummary, DailySummaryTotals, TxType } from '../domain/types';
import { computeTotals, computeClosingFloat } from '../domain/compute';
import { Storage } from './storage';

// lightweight uuid fallback
function uuid4() {
  try { return uuid(); } catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
}

function today() {
  return new Date().toISOString().slice(0,10);
}

export const MockApi = {
  async requestOtp(phone: string) {
    await delay(200);
    return { success: true };
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthSession> {
    await delay(200);
    // Create agent if not exists
    let agents = Storage.getAgents();
    let agent = agents.find(a => a.phone === phone);
    if (!agent) {
      agent = { id: uuid4(), phone, name: '', network: 'Both', openingFloat: 0, commissionRatePct: 0.5, createdAt: new Date().toISOString() } as Agent;
      agents.push(agent);
      Storage.saveAgents(agents);
    }
    const session: AuthSession = { agentId: agent.id, phone, token: uuid4() };
    Storage.saveSession(session);
    return session;
  },

  async getAgent(agentId: string): Promise<Agent> {
    await delay(100);
    const a = Storage.getAgent(agentId);
    if (!a) throw new Error('Agent not found');
    return a;
  },

  async updateAgent(agentId: string, patch: Partial<Pick<Agent,'openingFloat'|'commissionRatePct'|'name'|'network'>>): Promise<Agent> {
    await delay(150);
    const a = Storage.getAgent(agentId);
    if (!a) throw new Error('Agent not found');
    const next = { ...a, ...patch } as Agent;
    Storage.saveAgent(next);
    return next;
  },

  async saveOnboarding(agentId: string, data: Partial<Pick<Agent,'name'|'network'|'openingFloat'|'commissionRatePct'>>) {
    return this.updateAgent(agentId, data);
  },

  async listTransactions(agentId: string): Promise<Transaction[]> {
    await delay(120);
    return Storage.getTransactions(agentId);
  },

  async addTransaction(agentId: string, type: TxType, amount: number, network: 'MTN'|'Airtel'): Promise<Transaction> {
    await delay(120);
    const agent = Storage.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');

    // compute current float based on today's transactions
    const todayStr = today();
    const txs = Storage.getTransactions(agentId);
    const dayTxs = txs.filter(t => t.timestamp.slice(0,10) === todayStr);
    const deltaIn = dayTxs.filter(t => t.type==='cash_in').reduce((s,t)=>s+t.amount,0);
    const deltaOut = dayTxs.filter(t => t.type==='cash_out').reduce((s,t)=>s+t.amount,0);
    const currentFloat = agent.openingFloat + deltaIn - deltaOut;

    if (type === 'cash_out' && amount > currentFloat) {
      throw new Error('Insufficient float for cash-out');
    }

    const commission = Math.round((amount * agent.commissionRatePct) / 100);
    const tx: Transaction = { id: uuid4(), agentId, type, amount, commission, network, timestamp: new Date().toISOString(), synced: false };
    txs.push(tx);
    Storage.saveTransactions(agentId, txs);
    return tx;
  },

  async computeDaily(agentId: string, date = today()): Promise<DailySummary> {
    await delay(100);
    const agent = Storage.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');

    const txs = Storage.getTransactions(agentId).filter(t => t.timestamp.slice(0,10) === date);
    const totals: DailySummaryTotals = computeTotals(txs);

    const openingFloat = agent.openingFloat;
    const closingFloat = computeClosingFloat(openingFloat, totals);

    const summaries = Storage.getSummaries(agentId);
    let sum = summaries.find(s => s.date === date);
    if (!sum) {
      sum = { id: uuid4(), agentId, date, openingFloat, closingFloat, closed: false, totals };
      summaries.push(sum);
    } else {
      sum.totals = totals;
      sum.openingFloat = openingFloat;
      sum.closingFloat = closingFloat;
    }
    Storage.saveSummaries(agentId, summaries);
    return sum;
  },

  async closeDay(agentId: string, date = today()): Promise<DailySummary> {
    const sum = await this.computeDaily(agentId, date);
    sum.closed = true;
    const summaries = Storage.getSummaries(agentId);
    const idx = summaries.findIndex(s => s.id === sum.id);
    if (idx >= 0) { summaries[idx] = sum; Storage.saveSummaries(agentId, summaries); }
    // Carry forward closing float to agent as opening for next day
    const agent = Storage.getAgent(agentId);
    if (agent) {
      agent.openingFloat = sum.closingFloat;
      Storage.saveAgent(agent);
    }
    return sum;
  },
};

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
