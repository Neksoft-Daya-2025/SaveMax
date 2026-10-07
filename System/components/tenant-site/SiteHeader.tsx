'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Heart, Home, UserRound } from 'lucide-react';
import type { PublicTenant } from '@/lib/public-site';
import s from './header.module.css';

export default function SiteHeader({ tenant, saved: currentSaved, purpose }: { tenant: PublicTenant; saved?: string[]; purpose?: string | null }) {
  const base = `/site/${tenant.slug}`;
  const [storedSaved, setStoredSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`property-favourites:${tenant.slug}`) || '[]');
      setStoredSaved(Array.isArray(stored) ? stored.filter((id: unknown) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)).slice(0, 100) : []);
    } catch { setStoredSaved([]); }
  }, [tenant.slug]);
  const saved = currentSaved ?? storedSaved;
  const savedHref = `${base}/listings?saved=${saved.join(',')}`;
  const logo = tenant.logo && (/^https?:\/\//i.test(tenant.logo) || /^data:image\/(png|jpeg|webp);base64,/i.test(tenant.logo)) ? tenant.logo : '';
  return (<header className={s.header}><div className={s.headerInner}>
      <Link className={s.brand} href={base}>{logo ? <img src={tenant.logo} alt={tenant.name} /> : <><span className={s.brandIcon}><Home size={22} /></span><span>{tenant.name}<small>REAL ESTATE</small></span></>}</Link>
      <nav aria-label="Main navigation"><Link aria-current={purpose === 'Sale' ? 'page' : undefined} href={`${base}/listings?purpose=Sale`}>Buy</Link><Link aria-current={purpose === 'Rent' ? 'page' : undefined} href={`${base}/listings?purpose=Rent`}>Rent</Link><Link href={`${base}/listings`}>All properties</Link><Link href={`${base}#about`}>About</Link><Link href={`${base}#contact`}>Contact</Link></nav>
      <div className={s.headerActions}><Link href={savedHref} aria-label={`Saved properties, ${saved.length}`}><Heart size={19} /><span>Saved{saved.length ? ` (${saved.length})` : ''}</span></Link><Link href={`${base}/account`} className={s.login}><UserRound size={16} />My account</Link>{<Link href={`${base}/list-property`} className={s.primary}>List a property <ArrowUpRight size={15} /></Link>}</div>
    </div></header>);
}
