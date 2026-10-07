import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { auth } from '@/auth';
import User from '@/models/User';
import { getPublicTenant } from '@/lib/public-site';

const attempts = new Map<string, { count: number; until: number }>();
export function guardPublicWrite(request: NextRequest, scope: string, limit = 10) {
  const expected = new URL(process.env.NEXTAUTH_URL || request.url).origin;
  if (request.headers.get('origin') !== expected) throw new Error('Invalid request origin.');
  const ip = request.headers.get('x-real-ip') || 'unknown';
  const key = createHash('sha256').update(`${scope}:${ip}`).digest('hex');
  const now = Date.now();
  for (const [k, value] of attempts) if (value.until < now) attempts.delete(k);
  const entry = attempts.get(key) || { count: 0, until: now + 900000 };
  if (entry.count >= limit || attempts.size >= 10000) throw new Error('Too many attempts. Please try again in 15 minutes.');
  entry.count++; attempts.set(key, entry);
}

export async function listingAccount(slug: string) {
  const tenant = await getPublicTenant(slug);
  const session = await auth();
  if (!tenant || !session?.user?.id) return null;
  // Check current database membership, never trust a submitted tenant or owner ID.
  const user = await User.findOne({ _id: session.user.id, organization: tenant.id, status: 'Active' }).select('name email phone');
  return user ? { tenant, user } : null;
}
