import { randomUUID } from 'node:crypto';
import { Types } from 'mongoose';
import type { PoolClient } from 'pg';
import Property from '@/models/Property';
import { agentDatabase } from '@/lib/agent-postgres';
import { AgentError, type AgentPrincipal } from '@/lib/agent-policy';
import { approvalExecutable, draftHash, type AgentDraft } from '@/lib/agent-draft';

type Approval = { id: string; organization_id: string; candidate_id: string; payload: AgentDraft; payload_hash: string;
  property_id: string; state: string; approved_by: string | null; expires_at: Date; created_at: Date };

async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await agentDatabase().connect();
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
  finally { client.release(); }
}
async function event(client: PoolClient, row: Approval, actor: string, action: string) {
  await client.query('INSERT INTO savemax_approval_events(approval_id,organization_id,actor,action) VALUES($1,$2,$3,$4)', [row.id, row.organization_id, actor, action]);
}
export async function requestDraftApproval(principal: AgentPrincipal, candidateId: string, payload: AgentDraft) {
  return transaction(async client => {
    const hash = draftHash(payload);
    const result = await client.query<Approval>(`INSERT INTO savemax_draft_approvals
      (id,organization_id,candidate_id,requested_by,payload,payload_hash,property_id)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(organization_id,candidate_id) DO NOTHING RETURNING *`,
      [randomUUID(), principal.organizationId, candidateId, principal.keyId, JSON.stringify(payload), hash, new Types.ObjectId().toString()]);
    const row = result.rows[0] || (await client.query<Approval>('SELECT * FROM savemax_draft_approvals WHERE organization_id=$1 AND candidate_id=$2', [principal.organizationId, candidateId])).rows[0];
    if (row.payload_hash !== hash) throw new AgentError(409, 'CANDIDATE_CHANGED', 'This candidate already has a different immutable approval request. Submit a new candidate version.');
    if (result.rows[0]) await event(client, row, principal.keyId, 'REQUESTED');
    return { approvalId: row.id, candidateId: row.candidate_id, state: row.state, expiresAt: row.expires_at, replayed: !result.rows[0] };
  });
}
export async function reviewApprovals(organizationId: string) {
  const result = await agentDatabase().query<Approval>('SELECT id,candidate_id,payload,state,approved_by,expires_at,created_at FROM savemax_draft_approvals WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 50', [organizationId]);
  return result.rows;
}
export async function decideApproval(organizationId: string, userId: string, id: string, decision: 'APPROVED' | 'REJECTED') {
  return transaction(async client => {
    const row = (await client.query<Approval>('SELECT * FROM savemax_draft_approvals WHERE id=$1 AND organization_id=$2 FOR UPDATE', [id, organizationId])).rows[0];
    if (!row) throw new AgentError(404, 'NOT_FOUND', 'Approval not found.');
    if (row.state !== 'PENDING' || new Date(row.expires_at).getTime() <= Date.now()) throw new AgentError(409, 'NOT_PENDING', 'Only an unexpired pending request can be decided.');
    await client.query('UPDATE savemax_draft_approvals SET state=$1,approved_by=$2,decided_at=now() WHERE id=$3', [decision, userId, id]);
    await event(client, row, userId, decision);
    return { approvalId: id, state: decision };
  });
}
export async function createApprovedDraft(principal: AgentPrincipal, id: string) {
  return transaction(async client => {
    const row = (await client.query<Approval>('SELECT * FROM savemax_draft_approvals WHERE id=$1 AND organization_id=$2 FOR UPDATE', [id, principal.organizationId])).rows[0];
    if (!row) throw new AgentError(404, 'NOT_FOUND', 'Approval not found.');
    if (row.state === 'EXECUTED') return { id: row.property_id, approvalId: id, replayed: true };
    approvalExecutable(row);
    if (draftHash(row.payload) !== row.payload_hash) throw new AgentError(409, 'PAYLOAD_CHANGED', 'Approved payload integrity check failed.');
    const { rightsConfirmed, ...payload } = row.payload;
    if (rightsConfirmed !== true) throw new AgentError(409, 'RIGHTS_REQUIRED', 'Approved payload lacks advertising permission.');
    // Stable ID reserved in PostgreSQL makes a retry after Mongo success/PG failure safe.
    // Existing records are never overwritten by this operation.
    await Property.updateOne({ _id: row.property_id, organization: principal.organizationId }, { $setOnInsert: {
      ...payload, pricePeriod: payload.purpose === 'Sale' ? undefined : payload.pricePeriod,
      bedrooms: payload.bedrooms ?? undefined, bathrooms: payload.bathrooms ?? undefined,
      organization: principal.organizationId, createdBy: principal.creatorId, status: 'Pending',
      images: [], amenities: [], isFeatured: false, isHot: false, submissionSource: 'admin',
      agentImport: { approvalId: id, candidateId: row.candidate_id, payloadHash: row.payload_hash },
    } }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
    const existing = await Property.findOne({ _id: row.property_id, organization: principal.organizationId }).select('status agentImport').lean();
    if (!existing || existing.status !== 'Pending' || existing.agentImport?.approvalId !== id || existing.agentImport.payloadHash !== row.payload_hash) {
      throw new AgentError(409, 'DRAFT_CONFLICT', 'Draft requires manual reconciliation; no existing property was overwritten.');
    }
    await client.query("UPDATE savemax_draft_approvals SET state='EXECUTED',executed_at=now() WHERE id=$1", [id]);
    await event(client, row, principal.keyId, 'DRAFT_CREATED');
    return { id: row.property_id, status: 'Pending', approvalId: id, replayed: false };
  });
}
