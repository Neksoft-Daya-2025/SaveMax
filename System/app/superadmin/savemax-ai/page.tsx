import { redirect } from 'next/navigation';
import SaveMaxAI from '@/components/agent/SaveMaxAI';
import { approvalPageReviewer } from '@/lib/agent-approval-page';

export default async function SuperAdminSaveMaxAIPage() {
  const reviewer = await approvalPageReviewer();
  if (!reviewer.isSuperAdmin) redirect('/savemax-ai');
  return <SaveMaxAI organizationName={reviewer.organizationName} isSuperAdmin />;
}
