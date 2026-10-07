import { Pool } from 'pg';
import { AgentError } from '@/lib/agent-policy';

const cache = globalThis as typeof globalThis & { savemaxPool?: Pool };
export function agentDatabase() {
  if (!process.env.SAVEMAX_AI_DATABASE_URL) throw new AgentError(503, 'APPROVAL_STORE_UNAVAILABLE', 'The approval database is not configured.');
  if (!cache.savemaxPool) {
    cache.savemaxPool = new Pool({ connectionString: process.env.SAVEMAX_AI_DATABASE_URL, max: 3, connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000, statement_timeout: 10000, application_name: 'savemax-agent-api' });
    cache.savemaxPool.on('error', () => console.error('SaveMax approval database connection error'));
  }
  return cache.savemaxPool;
}
