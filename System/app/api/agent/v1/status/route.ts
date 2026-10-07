import { authorizeAgent, agentResponse, agentFailure } from '@/lib/agent-api';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const principal = await authorizeAgent(request, 'status:read');
    return agentResponse({ version: 'v1', organizationId: principal.organizationId, scopes: principal.scopes,
      capabilities: { propertyReads: principal.scopes.includes('properties:read'),
        draftCreation: principal.scopes.includes('drafts:create') && Boolean(process.env.SAVEMAX_AI_DATABASE_URL),
        draftApprovalRequired: true, publishing: false, deletion: false, outreach: false } });
  } catch (error) { return agentFailure(error); }
}
