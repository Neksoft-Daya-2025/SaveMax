import { redirect } from 'next/navigation';
import ApprovalReview from '@/components/agent/ApprovalReview';
import { approvalPageReviewer } from '@/lib/agent-approval-page';

export default async function SuperAdminApprovalPage() {
  const reviewer = await approvalPageReviewer();
  if (!reviewer.isSuperAdmin) redirect('/ai-approvals');
  return <ApprovalReview organizationName={reviewer.organizationName} />;
}
