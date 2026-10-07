import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import User from '@/models/User';
import { AgentError } from '@/lib/agent-policy';

export async function approvalReviewer(request?: Request, write = false) {
  // This is deliberately separate from bearer authentication: services cannot approve.
  if (request?.headers.has('authorization')) throw new AgentError(403, 'HUMAN_REQUIRED', 'Use an authorized human account to review.');
  if (write) {
    let expected = '';
    try { expected = new URL(process.env.NEXTAUTH_URL || '').origin; } catch { /* fail closed */ }
    if (!expected || request?.headers.get('origin') !== expected) throw new AgentError(403, 'INVALID_ORIGIN', 'Review must originate from this website.');
  }
  const session = await auth();
  if (!session?.user?.id) throw new AgentError(401, 'UNAUTHORIZED', 'Sign in to review candidates.');
  const organizationId = process.env.SAVEMAX_AGENT_ORGANIZATION_ID;
  if (!organizationId || !/^[a-f0-9]{24}$/.test(organizationId)) throw new AgentError(503, 'SERVICE_DISABLED', 'No service tenant configured.');
  await connectDB();
  const user = await User.findOne({ _id: session.user.id, status: 'Active' }).select('organization isSuperAdmin');
  const organization = await Organization.findOne({ _id: organizationId, status: { $in: ['active', 'trial'] } }).select('adminUser name');
  if (!user || !organization || !(user.isSuperAdmin === true ||
    (String(user.organization) === organizationId && String(organization.adminUser) === String(user._id)))) {
    throw new AgentError(403, 'FORBIDDEN', 'Only the tenant owner or verified SuperAdmin can approve candidates.');
  }
  return { organizationId, organizationName: organization.name, userId: String(user._id), isSuperAdmin: user.isSuperAdmin === true };
}
