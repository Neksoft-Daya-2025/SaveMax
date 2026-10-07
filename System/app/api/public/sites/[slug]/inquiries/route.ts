import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getPublicTenant, getPublicProperty } from '@/lib/public-site';
import Inquiry from '@/models/Inquiry';

const attempts = new Map<string, { count: number; expires: number }>();
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(process.env.NEXTAUTH_URL || request.url).origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    const { slug } = await params;
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const key = createHash('sha256').update(`${ip}:${slug}`).digest('hex');
    const now = Date.now();
    for (const [k, entry] of attempts) if (entry.expires < now) attempts.delete(k);
    const entry = attempts.get(key) || { count: 0, expires: now + 900000 };
    if (entry.count >= 5 || attempts.size >= 10000) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    entry.count++; attempts.set(key, entry);
    const raw = await request.text();
    if (raw.length > 8192) return NextResponse.json({ error: 'Message is too long.' }, { status: 413 });
    let body: any;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    const text = (key: string, max: number) => typeof body[key] === 'string' ? body[key].trim().slice(0, max) : '';
    const name = text('name', 100), email = text('email', 254).toLowerCase(), phone = text('phone', 40), message = text('message', 2000);
    if (body.website) return NextResponse.json({ success: true });
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || body.consent !== true) return NextResponse.json({ error: 'Enter your name, email and message, and agree to share your details.' }, { status: 400 });
    const tenant = await getPublicTenant(slug);
    const property = tenant && typeof body.propertyId === 'string' ? await getPublicProperty(tenant, body.propertyId) : null;
    if (!tenant || !property) return NextResponse.json({ error: 'This property is no longer available.' }, { status: 404 });
    const visitDate = text('visitDate', 10);
    if (visitDate && (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || !Number.isFinite(Date.parse(visitDate)) || visitDate < new Date().toISOString().slice(0, 10))) return NextResponse.json({ error: 'Choose a future viewing date.' }, { status: 400 });
    // Tenant and property association come only from the server-resolved public listing.
    await Inquiry.create({ organization: tenant.id, property: property._id, agent: property.agent?._id, name, email, phone,
      message: visitDate ? `Viewing requested for ${visitDate} (not confirmed).\n${message}` : message, status: 'New' });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'We could not send your request. Please try again.' }, { status: 500 });
  }
}
