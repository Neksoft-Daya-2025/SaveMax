import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import Organization from '@/models/Organization';
import { getPublicTenant, getPublicProperty } from '@/lib/public-site';

export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await connectDB();
    const record: any = await Property.findOne({ _id: id, status: 'Available' }).select('organization').lean();
    const org: any = record?.organization ? await Organization.findOne({ _id: record.organization, status: 'active' }).select('slug').lean() : null;
    const tenant = org ? await getPublicTenant(org.slug) : null;
    const property = tenant ? await getPublicProperty(tenant, id) : null;
    if (!tenant || !property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { property, settings: { storeName: tenant.name, address: tenant.address, phone: tenant.phone, email: tenant.email, currency: tenant.currency } } });
  } catch { return NextResponse.json({ error: 'Unable to load this property.' }, { status: 500 }); }
}