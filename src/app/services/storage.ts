// Simple localStorage-based persistence (web fallback). In Despia, this runs in WebView.
import { Agent, AuthSession, Transaction, DailySummary } from '../domain/types';

const LS = typeof window !== 'undefined' ? window.localStorage : undefined as any;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = LS?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  try { LS?.setItem(key, JSON.stringify(value)); } catch {}
}

export const Storage = {
  // Agents
  getAgents(): Agent[] { return get<Agent[]>('mma_agents', []); },
  saveAgents(v: Agent[]) { set('mma_agents', v); },
  getAgent(agentId: string): Agent | null { return Storage.getAgents().find(a => a.id === agentId) || null; },
  saveAgent(agent: Agent) {
    const list = Storage.getAgents();
    const idx = list.findIndex(a => a.id === agent.id);
    if (idx >= 0) list[idx] = agent; else list.push(agent);
    Storage.saveAgents(list);
  },

  // Session
  getSession(): AuthSession | null { return get<AuthSession | null>('mma_session', null); },
  saveSession(s: AuthSession | null) { set('mma_session', s); },

  // Transactions
  getTransactions(agentId: string): Transaction[] { return get<Transaction[]>(`mma_tx_${agentId}`, []); },
  saveTransactions(agentId: string, txs: Transaction[]) { set(`mma_tx_${agentId}`, txs); },

  // Daily summaries
  getSummaries(agentId: string): DailySummary[] { return get<DailySummary[]>(`mma_sum_${agentId}`, []); },
  saveSummaries(agentId: string, sums: DailySummary[]) { set(`mma_sum_${agentId}`, sums); },
};
