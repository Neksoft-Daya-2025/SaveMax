import { approvalReviewer } from '@/lib/agent-approval-human';
import { agentResponse, agentFailure } from '@/lib/agent-api';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const reviewer = await approvalReviewer(request);
    return agentResponse({ canReview: true, href: reviewer.isSuperAdmin ? '/superadmin/ai-approvals' : '/ai-approvals', organizationName: reviewer.organizationName });
  } catch (error) { return agentFailure(error); }
}
