import { approvalReviewer } from '@/lib/agent-approval-human';
import { reviewApprovals } from '@/lib/agent-approvals';
import { agentResponse, agentFailure } from '@/lib/agent-api';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try { const reviewer = await approvalReviewer(request); return agentResponse(await reviewApprovals(reviewer.organizationId)); }
  catch (error) { return agentFailure(error); }
}
