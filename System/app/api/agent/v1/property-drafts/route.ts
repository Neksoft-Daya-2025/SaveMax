import { authorizeAgent, agentFailure, agentResponse, agentJson } from '@/lib/agent-api';
import { AgentError } from '@/lib/agent-policy';
import { createApprovedDraft } from '@/lib/agent-approvals';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const principal = await authorizeAgent(request, 'drafts:create');
    const body = await agentJson(request, 1000);
    if (Object.keys(body).length !== 1 || typeof body.approvalId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.approvalId)) throw new AgentError(422, 'INVALID_APPROVAL', 'Supply only the approvalId.');
    const result = await createApprovedDraft(principal, body.approvalId);
    return agentResponse(result, result.replayed ? 200 : 201);
  } catch (error) { return agentFailure(error); }
}
