import 'server-only';
import { cache } from 'react';
import connectDB from '@/lib/mongodb';
import Organization from '@/models/Organization';
import Property from '@/models/Property';
import User from '@/models/User';
import { escapeRegex } from '@/lib/security';

export type PublicProperty = {
  _id: string; title: string; description: string; propertyType: string; purpose: string;
  price: number; pricePeriod?: 'month' | 'year'; areaSize: number; areaUnit: string; bedrooms?: number; bathrooms?: number;
  parking?: number; amenities: string[]; images: { url: string; isFeatured?: boolean }[];
  location: { address: string; city: string; country: string; coordinates?: { lat: number; lng: number } };
  agent?: { _id?: string; name?: string; phone?: string; email?: string }; demo: boolean;
};
export type PublicTenant = {
  id: string; slug: string; name: string; logo: string; email: string; phone: string;
  address: string; kvkNumber: string; currency: string;
};
export const getPublicTenant = cache(async (slug: string): Promise<PublicTenant | null> => {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) return null;
  await connectDB();
  const org: any = await Organization.findOne({ slug, status: 'active' })
    .select('name slug email phone address logoUrl settings.storeName settings.email settings.phone settings.address settings.logoUrl settings.kvkNumber settings.currency subscription.currency').lean();
  if (!org) return null;
  const s = org.settings || {};
  return { id: String(org._id), slug: org.slug, name: s.storeName || org.name,
    logo: s.logoUrl || org.logoUrl || '', email: s.email || org.email || '',
    phone: s.phone || org.phone || '', address: s.address || org.address || '',
    kvkNumber: s.kvkNumber || '', currency: s.currency || org.subscription?.currency || 'EUR' };
});

const publicFields = 'title description propertyType purpose price pricePeriod hideExactAddress areaSize areaUnit bedrooms bathrooms parking amenities images location agent';
const serialise = (p: any): PublicProperty => {
  const result = JSON.parse(JSON.stringify(p));
  if (result.hideExactAddress) {
    result.location.address = result.location.city;
    delete result.location.coordinates;
    delete result.location.zipCode;
  }
  delete result.hideExactAddress;
  return { ...result, demo: /fictional sample property|sample -/i.test(`${p.title} ${p.description}`) };
};

export async function getPublicProperty(tenant: PublicTenant, id: string): Promise<PublicProperty | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const p = await Property.findOne({ _id: id, organization: tenant.id, status: 'Available' })
    .select(publicFields).populate({ path: 'agent', model: User, select: 'name phone email', match: { organization: tenant.id, status: 'Active' } }).lean();
  if (!p) return null;
  const publicProperty = serialise(p);
  if (tenant.slug === 'save-max' && tenant.email && publicProperty.agent) {
    publicProperty.agent.email = tenant.email;
  }
  return publicProperty;
}

export async function getPublicListings(tenant: PublicTenant, params: Record<string, string | string[] | undefined>) {
  const value = (key: string) => typeof params[key] === 'string' ? (params[key] as string).slice(0, 200) : '';
  const query: any = { organization: tenant.id, status: 'Available' };
  const purpose = value('purpose');
  if (['Sale', 'Rent', 'Lease'].includes(purpose)) query.purpose = purpose;
  const type = value('type');
  if (['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Office', 'Shop'].includes(type)) query.propertyType = type;
  const search = value('q').trim();
  if (search) query.$or = ['title', 'location.city', 'location.address'].map(key => ({ [key]: { $regex: escapeRegex(search), $options: 'i' } }));
  for (const [key, field, operator] of [['min', 'price', '$gte'], ['max', 'price', '$lte'], ['beds', 'bedrooms', '$gte']]) {
    const raw = value(key); const n = Number(raw);
    if (raw && Number.isFinite(n) && n >= 0) query[field] = { ...query[field], [operator]: n };
  }
  const area = Number(value('area'));
  if (value('area') && Number.isFinite(area) && area >= 0) query.$expr = { $gte: [{ $cond: [{ $eq: ['$areaUnit', 'sqft'] }, { $multiply: ['$areaSize', 0.092903] }, '$areaSize'] }, area] };
  if (value('amenity')) query.amenities = value('amenity');
  if (params.saved !== undefined) {
    const ids = (typeof params.saved === 'string' ? params.saved : '').split(',').filter(id => /^[a-f\d]{24}$/i.test(id)).slice(0, 100);
    query._id = { $in: ids };
  }
  const parsedPage = Number(value('page'));
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;
  const sort: any = value('sort') === 'price-asc' ? { price: 1, _id: 1 } : value('sort') === 'price-desc' ? { price: -1, _id: 1 } : { createdAt: -1, _id: 1 };
  const [total, properties, cities, amenities] = await Promise.all([
    Property.countDocuments(query),
    Property.find(query).select(publicFields).sort(sort).skip((page - 1) * 12).limit(12).lean(),
    Property.distinct('location.city', { organization: tenant.id, status: 'Available' }),
    Property.distinct('amenities', { organization: tenant.id, status: 'Available' })
  ]);
  return { properties: properties.map(serialise), total, page, pages: Math.ceil(total / 12), cities: cities.sort(), amenities: amenities.sort() };
}
