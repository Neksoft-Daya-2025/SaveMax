import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import Organization from '@/models/Organization';

export const dynamic = 'force-dynamic';
export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  await connectDB();
  const property: any = await Property.findOne({ _id: id, status: 'Available' }).select('organization').lean();
  if (!property?.organization) notFound();
  const org: any = await Organization.findOne({ _id: property.organization, status: 'active' }).select('slug').lean();
  if (!org) notFound();
  redirect(`/site/${org.slug}/property/${id}`);
}