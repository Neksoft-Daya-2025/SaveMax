import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { authenticateAgent, pagination, propertyQuery } from '../lib/agent-policy.ts';

const token = 'smx_' + 'a'.repeat(43);
const env = {
  SAVEMAX_AGENT_ENABLED: 'true', SAVEMAX_AGENT_KEY_SHA256: createHash('sha256').update(token).digest('hex'),
  SAVEMAX_AGENT_ORGANIZATION_ID: 'a'.repeat(24), SAVEMAX_AGENT_CREATOR_ID: 'b'.repeat(24),
  SAVEMAX_AGENT_KEY_EXPIRES_AT: '2099-01-01T00:00:00Z', SAVEMAX_AGENT_SCOPES: 'status:read,properties:read',
};
const authorization = `Bearer ${token}`;
const denied = (fn, status) => assert.throws(fn, error => error.status === status);

test('anonymous and incorrect credentials cannot access service', () => {
  denied(() => authenticateAgent(null, 'status:read', env), 401);
  denied(() => authenticateAgent('Bearer smx_' + 'b'.repeat(43), 'status:read', env), 401);
});
test('service fails closed for missing tenant, disabled flag, malformed hash and expiration', () => {
  for (const change of [{ SAVEMAX_AGENT_ORGANIZATION_ID: '' }, { SAVEMAX_AGENT_ENABLED: 'false' },
    { SAVEMAX_AGENT_KEY_SHA256: 'broken' }, { SAVEMAX_AGENT_KEY_EXPIRES_AT: '2020-01-01' }, { SAVEMAX_AGENT_CREATOR_ID: '' }]) {
    denied(() => authenticateAgent(authorization, 'status:read', { ...env, ...change }), 503);
  }
});
test('read credential cannot create drafts', () => {
  denied(() => authenticateAgent(authorization, 'drafts:create', env), 403);
});
test('tenant comes exclusively from authenticated service configuration', () => {
  const principal = authenticateAgent(authorization, 'properties:read', env);
  assert.deepEqual(propertyQuery(principal, new URLSearchParams('purpose=Sale')), { organization: env.SAVEMAX_AGENT_ORGANIZATION_ID, purpose: 'Sale' });
  denied(() => propertyQuery(principal, new URLSearchParams('organization=other')), 400);
  denied(() => propertyQuery(principal, new URLSearchParams('status[$ne]=Pending')), 400);
  denied(() => propertyQuery(principal, new URLSearchParams('purpose=Unknown')), 400);
});
test('pagination rejects unbounded and fractional queries', () => {
  for (const query of ['limit=100000', 'page=-1', 'page=1.2', 'limit=NaN']) denied(() => pagination(new URLSearchParams(query)), 400);
  assert.deepEqual(pagination(new URLSearchParams()), { page: 1, limit: 20 });
});
