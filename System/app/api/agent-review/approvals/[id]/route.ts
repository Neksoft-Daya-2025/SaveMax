import { approvalReviewer } from '@/lib/agent-approval-human';
import { decideApproval } from '@/lib/agent-approvals';
import { AgentError } from '@/lib/agent-policy';
import { agentResponse, agentFailure, agentJson } from '@/lib/agent-api';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const reviewer = await approvalReviewer(request, true);
    const { id } = await params;
    const body = await agentJson(request, 1000);
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id) || Object.keys(body).some(key => !['decision', 'rightsConfirmed'].includes(key)) || !['APPROVED', 'REJECTED'].includes(String(body.decision))) throw new AgentError(422, 'INVALID_DECISION', 'Choose APPROVED or REJECTED.');
    if (body.decision === 'APPROVED' && body.rightsConfirmed !== true) throw new AgentError(422, 'RIGHTS_REQUIRED', 'Confirm permission to advertise before approval.');
    return agentResponse(await decideApproval(reviewer.organizationId, reviewer.userId, id, body.decision as 'APPROVED' | 'REJECTED'));
  } catch (error) { return agentFailure(error); }
}
