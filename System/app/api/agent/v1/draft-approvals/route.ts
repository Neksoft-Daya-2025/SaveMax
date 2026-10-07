import { authorizeAgent, agentResponse, agentFailure, agentJson } from '@/lib/agent-api';
import { AgentError } from '@/lib/agent-policy';
import { validateAgentDraft } from '@/lib/agent-draft';
import { requestDraftApproval } from '@/lib/agent-approvals';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const principal = await authorizeAgent(request, 'drafts:create');
    const body = await agentJson(request);
    if (Object.keys(body).some(key => !['candidateId', 'draft'].includes(key)) || typeof body.candidateId !== 'string' || !/^[A-Za-z0-9._:-]{1,120}$/.test(body.candidateId)) {
      throw new AgentError(422, 'INVALID_CANDIDATE', 'Use a stable candidate identifier and structured draft.');
    }
    const result = await requestDraftApproval(principal, body.candidateId, validateAgentDraft(body.draft));
    return agentResponse(result, result.replayed ? 200 : 201);
  } catch (error) { return agentFailure(error); }
}
