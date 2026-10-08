'use client';
import Link from 'next/link';
import { Home, Mail, MapPin, Phone } from 'lucide-react';
import type { PublicTenant } from '@/lib/public-site';
import CookieConsent from './CookieConsent';
import s from './footer.module.css';

export default function SiteFooter({ tenant }: { tenant: PublicTenant }) {
  const base = `/site/${tenant.slug}`;
  return (<footer id="contact" className={s.footer}><div className={s.container}><div className={s.top}><div><Link className={s.brand} href={base}><Home size={32} /><span>{tenant.name}<small>REAL ESTATE</small></span></Link><p>Find a place. Make it yours.</p></div><div><strong>Explore</strong><Link href={`${base}/listings?purpose=Sale`}>Properties for sale</Link><Link href={`${base}/listings?purpose=Rent`}>Properties for rent</Link><Link href={`${base}/listings`}>All properties</Link><Link href={`${base}#locations`}>Popular locations</Link></div><div><strong>Company</strong><Link href={`${base}#about`}>About us</Link><Link href={`${base}#contact`}>Contact</Link><Link href={`${base}/listings`}>Find a property</Link><Link href={`${base}/list-property`}>List a property</Link></div><div><strong>Get in touch</strong>{tenant.email && <a href={`mailto:${tenant.email}`}><Mail size={16} aria-hidden="true" />{tenant.email}</a>}{tenant.phone && <a href={`tel:${tenant.phone.replace(/[^+\d]/g, '')}`}><Phone size={16} aria-hidden="true" />{tenant.phone}</a>}{tenant.address && <span><MapPin size={16} aria-hidden="true" />{tenant.address}</span>}</div></div><div className={s.bottom}><span>© {new Date().getFullYear()} {tenant.name}</span>{tenant.kvkNumber && <span>KVK {tenant.kvkNumber}</span>}<span>All rights reserved.</span>{tenant.showNekdigitalCredit ? <span>Powered by <a href="https://nekdigital.nl/" target="_blank" rel="noopener noreferrer">NekDigital</a></span> : <span>Powered by Neksoft Global Service Pvt. Ltd.</span>}<CookieConsent name={tenant.name} slug={tenant.slug} /></div></div></footer>);
}
