import { NextRequest, NextResponse } from 'next/server';
import { getPublicTenant } from '@/lib/public-site';
import { guardPublicWrite, listingAccount } from '@/lib/public-account';
import User from '@/models/User';
import Role from '@/models/Role';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const account = await listingAccount((await params).slug);
  return NextResponse.json({ user: account ? { name: account.user.name, email: account.user.email, phone: account.user.phone } : null }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    guardPublicWrite(request, 'public-signup', 5);
    const tenant = await getPublicTenant((await params).slug);
    if (!tenant) return NextResponse.json({ error: 'Website not found.' }, { status: 404 });
    const raw = await request.text();
    if (raw.length > 4096) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const body = JSON.parse(raw);
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';
    if (!name || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || Buffer.byteLength(password) > 72) return NextResponse.json({ error: 'Enter your name, valid email and a password of 10–72 bytes.' }, { status: 400 });
    if (await User.exists({ email })) return NextResponse.json({ error: 'This email is already registered. Sign in with your existing account.' }, { status: 409 });
    // A separate customer role with no dashboard permissions; no client-supplied role is accepted.
    const role = await Role.findOneAndUpdate({ name: 'Public customer', organization: tenant.id }, { $setOnInsert: { name: 'Public customer', organization: tenant.id, permissions: { dashboard: { view: false } } } }, { upsert: true, new: true });
    await User.create({ name, email, password, phone, organization: tenant.id, role: role._id, status: 'Active', isSuperAdmin: false, customerDetails: { notes: 'Registered through the public property website.' } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const known = /origin|Too many attempts/.test(message);
    return NextResponse.json({ error: known ? message : 'Could not create your account. Please try again.' }, { status: known ? (message.includes('origin') ? 403 : 429) : 400 });
  }
}
