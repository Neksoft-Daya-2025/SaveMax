import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import User from '@/models/User';
import { AgentError, authenticateAgent, type AgentPrincipal, type AgentScope } from '@/lib/agent-policy';

const buckets = new Map<string, { start: number; count: number }>();
export async function authorizeAgent(request: Request, scope: AgentScope): Promise<AgentPrincipal> {
  const principal = authenticateAgent(request.headers.get('authorization'), scope);
  const now = Date.now();
  const bucket = buckets.get(principal.keyId);
  if (!bucket || now - bucket.start >= 60000) buckets.set(principal.keyId, { start: now, count: 1 });
  else if (++bucket.count > 60) throw new AgentError(429, 'RATE_LIMITED', 'Try again in one minute.');
  await connectDB();
  const organization = await Organization.exists({ _id: principal.organizationId, status: { $in: ['active', 'trial'] } });
  const creator = await User.exists({ _id: principal.creatorId, organization: principal.organizationId, status: 'Active', isSuperAdmin: { $ne: true } });
  if (!organization || !creator) throw new AgentError(403, 'TENANT_DISABLED', 'The service tenant or creator is unavailable.');
  return principal;
}

export function agentResponse(data: unknown, status = 200, requestId = randomUUID()) {
  return NextResponse.json({ success: true, data, requestId }, { status, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId } });
}
export function agentFailure(error: unknown, requestId = randomUUID()) {
  const known = error instanceof AgentError;
  if (!known) console.error('Agent API request failed', { requestId });
  return NextResponse.json({ success: false, error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'The request could not be completed.' }, requestId },
    { status: known ? error.status : 500, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': requestId, ...(known && error.status === 429 ? { 'Retry-After': '60' } : {}) } });
}

export async function agentJson(request: Request, maxBytes = 16000): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AgentError(415, 'JSON_REQUIRED', 'Use application/json.');
  const reader = request.body?.getReader();
  if (!reader) throw new AgentError(400, 'INVALID_BODY', 'A JSON body is required.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.length;
    if (size > maxBytes) { await reader.cancel(); throw new AgentError(413, 'BODY_TOO_LARGE', 'Request exceeds the size limit.'); }
    chunks.push(part.value);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AgentError(400, 'INVALID_BODY', 'Invalid JSON.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AgentError(400, 'INVALID_BODY', 'Use a JSON object.');
  return parsed as Record<string, unknown>;
}
