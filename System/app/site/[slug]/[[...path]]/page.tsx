import { notFound } from 'next/navigation';
import { getPublicTenant, getPublicListings, getPublicProperty } from '@/lib/public-site';
import TenantSite from '@/components/tenant-site/TenantSite';
import ListingWizard from '@/components/tenant-site/ListingWizard';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string; path?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params }: Props) {
  const { slug, path = [] } = await params;
  const tenant = await getPublicTenant(slug);
  if (!tenant) return { title: 'Website not found' };
  if (path[0] === 'list-property' || path[0] === 'account') return { title: `${path[0] === 'account' ? 'Your account' : 'List a property'} | ${tenant.name}`, robots: { index: false, follow: false } };
  const property = path[0] === 'property' && path[1] ? await getPublicProperty(tenant, path[1]) : null;
  return { title: `${property?.title || (path[0] === 'listings' ? 'Properties' : 'Find your next home')} | ${tenant.name}`, description: `Explore properties for sale and rent with ${tenant.name}. View details and contact the team.` };
}
export default async function Page({ params, searchParams }: Props) {
  const { slug, path = [] } = await params;
  const tenant = await getPublicTenant(slug);
  if (!tenant) notFound();
  if (path.length === 1 && ['list-property', 'account'].includes(path[0])) return <ListingWizard tenant={tenant} accountMode={path[0] === 'account'} />;
  const paramsQuery = await searchParams;
  if (path.length === 2 && path[0] === 'property') {
    const property = await getPublicProperty(tenant, path[1]);
    if (!property) notFound();
    const related = await getPublicListings(tenant, { type: property.propertyType });
    return <TenantSite tenant={tenant} mode="detail" property={property} listings={{ ...related, properties: related.properties.filter(p => p._id !== property._id).slice(0, 3) }} />;
  }
  if (path.length > 1 || (path.length === 1 && path[0] !== 'listings')) notFound();
  const listings = await getPublicListings(tenant, path[0] === 'listings' ? paramsQuery : {});
  return <TenantSite tenant={tenant} mode={path[0] === 'listings' ? 'listings' : 'home'} listings={listings} />;
}
