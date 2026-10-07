import { redirect } from 'next/navigation';
import { approvalReviewer } from '@/lib/agent-approval-human';
import { AgentError } from '@/lib/agent-policy';

export async function approvalPageReviewer() {
  try { return await approvalReviewer(); }
  catch (error) {
    if (error instanceof AgentError && error.status === 401) redirect('/login');
    if (error instanceof AgentError && error.status === 403) redirect('/dashboard');
    throw error;
  }
}
