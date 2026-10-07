import { redirect } from 'next/navigation';
import SaveMaxAI from '@/components/agent/SaveMaxAI';
import { approvalPageReviewer } from '@/lib/agent-approval-page';

export default async function TenantSaveMaxAIPage() {
  const reviewer = await approvalPageReviewer();
  if (reviewer.isSuperAdmin) redirect('/superadmin/savemax-ai');
  return <SaveMaxAI organizationName={reviewer.organizationName} isSuperAdmin={false} />;
}
