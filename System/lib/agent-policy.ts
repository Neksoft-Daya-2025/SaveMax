import { createHash, timingSafeEqual } from 'node:crypto';

export const agentScopes = ['status:read', 'properties:read', 'drafts:create'] as const;
export type AgentScope = typeof agentScopes[number];
export type AgentPrincipal = { organizationId: string; creatorId: string; keyId: string; scopes: AgentScope[] };

export class AgentError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}

// No session fallback: every call must provide a separately provisioned credential.
export function authenticateAgent(authorization: string | null, scope: AgentScope, env: NodeJS.ProcessEnv = process.env): AgentPrincipal {
  const match = /^Bearer (smx_[A-Za-z0-9_-]{43,128})$/.exec(authorization || '');
  if (!match) throw new AgentError(401, 'UNAUTHORIZED', 'A valid service credential is required.');
  const digest = env.SAVEMAX_AGENT_KEY_SHA256 || '';
  const organizationId = env.SAVEMAX_AGENT_ORGANIZATION_ID || '';
  const creatorId = env.SAVEMAX_AGENT_CREATOR_ID || '';
  const expires = Date.parse(env.SAVEMAX_AGENT_KEY_EXPIRES_AT || '');
  if (env.SAVEMAX_AGENT_ENABLED !== 'true' || !/^[a-f0-9]{64}$/.test(digest) ||
      !/^[a-f0-9]{24}$/.test(organizationId) || !/^[a-f0-9]{24}$/.test(creatorId) ||
      !Number.isFinite(expires) || expires <= Date.now()) {
    throw new AgentError(503, 'SERVICE_DISABLED', 'The Agent API is not configured for access.');
  }
  const actual = createHash('sha256').update(match[1]).digest();
  if (!timingSafeEqual(actual, Buffer.from(digest, 'hex'))) throw new AgentError(401, 'UNAUTHORIZED', 'A valid service credential is required.');
  const scopes = (env.SAVEMAX_AGENT_SCOPES || '').split(',').filter((value): value is AgentScope => agentScopes.includes(value as AgentScope));
  if (!scopes.includes(scope)) throw new AgentError(403, 'FORBIDDEN', 'This credential does not permit this action.');
  return { organizationId, creatorId, keyId: digest.slice(0, 12), scopes };
}

export function pagination(params: URLSearchParams) {
  const page = Number(params.get('page') || 1), limit = Number(params.get('limit') || 20);
  if (!Number.isInteger(page) || page < 1 || page > 1000 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AgentError(400, 'INVALID_PAGINATION', 'Use page 1–1000 and limit 1–50.');
  }
  return { page, limit };
}

export function propertyQuery(principal: AgentPrincipal, params: URLSearchParams) {
  for (const name of params.keys()) if (!['page', 'limit', 'purpose', 'status'].includes(name)) {
    throw new AgentError(400, 'INVALID_FILTER', 'Unsupported query parameter.');
  }
  const query: Record<string, unknown> = { organization: principal.organizationId };
  for (const [name, values] of Object.entries({ purpose: ['Sale', 'Rent', 'Lease'], status: ['Available', 'Sold', 'Rented', 'Booked', 'Pending'] })) {
    const value = params.get(name);
    if (value && !values.includes(value)) throw new AgentError(400, 'INVALID_FILTER', `Invalid ${name}.`);
    if (value) query[name] = value;
  }
  return query;
}
