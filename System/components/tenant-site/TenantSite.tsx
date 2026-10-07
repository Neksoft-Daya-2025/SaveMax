'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Bath, BedDouble, BadgeCheck, Building2, MapPinned, Check, ChevronLeft, ChevronRight, Heart, Home, KeyRound, Mail, MapPin, Phone, Ruler, Search, SlidersHorizontal, UserRound, X } from 'lucide-react';
import type { PublicProperty, PublicTenant } from '@/lib/public-site';
import s from './site.module.css';
import HeroVideo from './HeroVideo';
import ListingsMap from './ListingsMap';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type Listings = { properties: PublicProperty[]; total: number; page: number; pages: number; cities: string[]; amenities: string[] };
const demoPhotos = [
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85'
];
function safeImage(url?: string) { return url && (/^https?:\/\//i.test(url) || /^data:image\/(png|jpeg|webp);base64,/i.test(url)) ? url : ''; }
function photos(p: PublicProperty) { const actual = p.images?.map(i => safeImage(i.url)).filter(Boolean) || []; return actual.length ? actual : demoPhotos; }
function title(p: PublicProperty) { return p.title.replace(/^Sample\s*-\s*/i, ''); }
function mapUrl(p: PublicProperty) {
  const c = p.location.coordinates;
  if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lng) || Math.abs(c.lat) > 90 || Math.abs(c.lng) > 180) return '';
  const bbox = [c.lng - .012, c.lat - .007, c.lng + .012, c.lat + .007].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${c.lat},${c.lng}`)}`;
}

export default function TenantSite({ tenant, mode, listings, property }: { tenant: PublicTenant; mode: 'home' | 'listings' | 'detail'; listings: Listings; property?: PublicProperty }) {
  const base = `/site/${tenant.slug}`;
  const router = useRouter();
  const query = useSearchParams();
  const [saved, setSaved] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [mapSelected, setMapSelected] = useState<string>('');
  const [activePhoto, setActivePhoto] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const [sending, setSending] = useState(false);
  const sendPending = useRef(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [viewing, setViewing] = useState(false);
  const key = `property-favourites:${tenant.slug}`;
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      setSaved(Array.isArray(stored) ? stored.filter((id: unknown) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)).slice(0, 100) : []);
    } catch { setSaved([]); }
    setStorageReady(true);
  }, [key]);
  useEffect(() => { setActivePhoto(0); setSent(false); setFormError(''); setViewing(false); }, [property?._id]);
  const toggleSaved = (id: string) => {
    const next = saved.includes(id) ? saved.filter(p => p !== id) : [...saved, id].slice(-100);
    setSaved(next);
    try { localStorage.setItem(key, JSON.stringify(next)); setNotice(''); }
    catch { setNotice('Favourites are available for this visit. Your browser has disabled saving.'); }
    if (mode === 'listings' && query.has('saved')) {
      const params = new URLSearchParams(query.toString()); params.set('saved', next.join(',')); params.delete('page');
      router.replace(`${base}/listings?${params}`);
    }
  };
  const price = (p: PublicProperty) => {
    let formatted: string;
    try { formatted = new Intl.NumberFormat('en-NL', { style: 'currency', currency: tenant.currency, maximumFractionDigits: 0 }).format(p.price); }
    catch { formatted = `${tenant.currency} ${p.price.toLocaleString()}`; }
    return <>{formatted}{p.purpose !== 'Sale' && <small> / {p.pricePeriod === 'year' ? 'year' : 'month'}</small>}</>;
  };
  const pageHref = (page: number) => { const params = new URLSearchParams(query.toString()); params.set('page', String(page)); return `${base}/listings?${params}`; };
  const SearchForm = ({ expanded = false }: { expanded?: boolean }) => (
    <form action={`${base}/listings`} className={s.searchForm}>
      {query.has('saved') && <input type="hidden" name="saved" value={query.get('saved') || ''} />}
      <fieldset className={s.transactionToggle}><legend className={s.srOnly}>Transaction</legend>{(mode === 'home' ? [['Sale', 'Buy'], ['Rent', 'Rent'], ['', 'All properties']] : [['', 'All'], ['Sale', 'Buy'], ['Rent', 'Rent'], ['Lease', 'Lease']]).map(([value, label]) => <label key={value}><input type="radio" name="purpose" value={value} defaultChecked={(query.get('purpose') || (mode === 'home' ? 'Sale' : '')) === value} onChange={event => { if (mode !== 'listings') return; const form = event.currentTarget.form; if (!form) return; const params = new URLSearchParams(); new FormData(form).forEach((entry, name) => { if (typeof entry === 'string' && (entry || name === 'saved')) params.set(name, entry); }); params.delete('page'); router.push(`${base}/listings?${params.toString()}`, { scroll: false }); }} /><span>{mode === 'home' && (value === 'Sale' ? <Home size={16} /> : value === 'Rent' ? <KeyRound size={16} /> : <Building2 size={16} />)}{label}</span></label>)}</fieldset>
      <label className={s.locationInput}>{mode === 'home' && <MapPin className={s.searchFieldIcon} size={17} aria-hidden="true" />}<span>Location</span><input name="q" placeholder="City, neighbourhood or address" defaultValue={query.get('q') || ''} list="tenant-cities" maxLength={200} /></label>
      <datalist id="tenant-cities">{listings.cities.map(city => <option key={city} value={city} />)}</datalist>
      <label className={s.propertyTypeInput}>{mode === 'home' && <SlidersHorizontal className={s.searchFieldIcon} size={17} aria-hidden="true" />}<span>Property type</span><select name="type" defaultValue={query.get('type') || ''}><option value="">All properties</option>{['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Office', 'Shop'].map(type => <option key={type}>{type}</option>)}</select></label>
      {mode === 'home' && <><label className={s.homeMin}><span>Min. price</span><input type="number" name="min" min="0" placeholder="No min" defaultValue={query.get('min') || ''} /></label><label className={s.homeMax}><span>Max. price</span><input type="number" name="max" min="0" placeholder="No max" defaultValue={query.get('max') || ''} /></label></>}
      {mode !== 'home' && <details className={s.advancedFilters} open={['min', 'max', 'beds', 'area', 'amenity', 'sort'].some(key => !!query.get(key))}><summary><SlidersHorizontal size={17} /> Filters</summary><div className={s.filterForm}>
        <label><span>Min. price ({tenant.currency})</span><input type="number" name="min" min="0" defaultValue={query.get('min') || ''} placeholder="No minimum" /></label>
        <label><span>Max. price ({tenant.currency})</span><input type="number" name="max" min="0" defaultValue={query.get('max') || ''} placeholder="No maximum" /></label>
        <label><span>Bedrooms</span><select name="beds" defaultValue={query.get('beds') || ''}><option value="">Any</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}</select></label>
        <label><span>Minimum area (m²)</span><input type="number" name="area" min="0" defaultValue={query.get('area') || ''} placeholder="Any size" /></label>
        <label><span>Amenity</span><select name="amenity" defaultValue={query.get('amenity') || ''}><option value="">Any amenity</option>{listings.amenities.map(a => <option key={a}>{a}</option>)}</select></label>
        <label><span>Sort by</span><select name="sort" defaultValue={query.get('sort') || ''}><option value="">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
      </div></details>}
      <button className={s.primary}><Search size={18} />{expanded ? 'Apply filters' : 'Search properties'}</button>
    </form>
  );
  const Card = ({ p }: { p: PublicProperty }) => (
    <article data-map-property={p._id} className={`${s.card} ${view === 'map' && mapSelected === p._id ? s.mapCardActive : ''}`}>
      <div className={s.cardImage}>
        <Link href={`${base}/property/${p._id}`}><img src={photos(p)[0]} alt={p.images?.length ? title(p) : `Illustrative interior for ${title(p)}`} loading="lazy" /></Link>
        <span className={s.purpose}>{p.purpose === 'Sale' ? 'For sale' : p.purpose === 'Rent' ? 'For rent' : 'For lease'}</span>
        <button className={`${s.heart} ${saved.includes(p._id) ? s.saved : ''}`} type="button" disabled={!storageReady} aria-pressed={saved.includes(p._id)} aria-label={`${saved.includes(p._id) ? 'Remove from' : 'Add to'} favourites: ${title(p)}`} onClick={() => toggleSaved(p._id)}><Heart size={19} fill={saved.includes(p._id) ? 'currentColor' : 'none'} /></button>
        {(p.demo || !p.images?.length) && <span className={s.demoImage}>Demo listing · illustrative photo</span>}
      </div>
      <div className={s.cardBody}>
        <div className={s.cardPrice}>{price(p)}</div>
        <h3><Link href={`${base}/property/${p._id}`}>{title(p)}</Link></h3>
        <p className={s.muted}><MapPin size={14} />{p.location.city}, {p.location.country}</p>
        <div className={s.facts}>{!!p.bedrooms && <span><BedDouble size={16} />{p.bedrooms} beds</span>}{!!p.bathrooms && <span><Bath size={16} />{p.bathrooms} baths</span>}<span><Ruler size={16} />{p.areaSize} {p.areaUnit === 'sqm' ? 'm²' : 'sq ft'}</span></div>
        <div className={s.cardFooter}><span>Offered by {tenant.name}</span>{mode === 'home' && <Link className={s.cardArrow} href={`${base}/property/${p._id}`} aria-label={`View ${title(p)}`}><ArrowUpRight size={17} /></Link>}{view === 'map' && <button type="button" onClick={() => setMapSelected(p._id)} className={s.textButton}>Show on map</button>}</div>
      </div>
    </article>
  );
  async function sendInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!property || sendPending.current) return;
    sendPending.current = true; setSending(true); setFormError('');
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/public/sites/${tenant.slug}/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId: property._id, name: form.get('name'), email: form.get('email'), phone: form.get('phone'), message: form.get('message'), visitDate: viewing ? form.get('visitDate') : '', website: form.get('website'), consent: form.get('consent') === 'on' }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not send your request.');
      setSent(true);
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Please try again.'); }
    finally { sendPending.current = false; setSending(false); }
  }
  const imageList = property ? photos(property) : [];
  return <div className={`${s.site} ${mode === 'home' ? s.referenceHome : ''}`}>
    <a className={s.skip} href="#site-content">Skip to content</a>
    <SiteHeader tenant={tenant} saved={saved} purpose={query.get('purpose')} />
    {notice && <p role="status" className={s.notice}>{notice}</p>}
    <main id="site-content">
    {mode === 'home' && <>
      <section className={s.hero}>
        <HeroVideo />
        <div className={s.heroContent}><p className={s.eyebrow}>FIND MORE THAN A PROPERTY</p><h1>A new address.<br />A brighter <em>tomorrow.</em></h1><p>Buy, rent or explore homes across the Netherlands<br />with {tenant.name}.</p><Link className={s.primary} href={`${base}/listings`}>Find your perfect home <ArrowUpRight size={17} /></Link></div>
        <div className={s.searchDock}><SearchForm /></div>
        <span className={s.heroLocation}><MapPin size={13} />Amsterdam, Netherlands</span>
      </section>
      <div className={`${s.container} ${s.serviceStrip}`}><div><BadgeCheck size={22} /><span><strong>Property listings</strong><small>Explore available homes</small></span></div><div><MapPinned size={22} /><span><strong>Prime locations</strong><small>The best areas</small></span></div><div><UserRound size={22} /><span><strong>Expert support</strong><small>We’re here to help</small></span></div></div>
      <section className={`${s.container} ${s.homeListings}`}><div className={s.sectionHeading}><div><p className={s.eyebrow}>FEATURED PROPERTIES</p><h2>Find a place that fits.</h2></div><Link href={`${base}/listings`} className={s.textButton}>View all properties <ArrowUpRight size={18} /></Link></div>
        <div className={s.grid}>{listings.properties.slice(0, 3).map(p => <Card key={p._id} p={p} />)}</div>{!listings.total && <p className={s.empty}>New properties will appear here when they become available.</p>}
      </section>
      <section id="locations" className={`${s.container} ${s.localSection}`}><div><p className={s.eyebrow}>EXPLORE BY CITY</p><h2>Where would you<br />like to live?</h2><p className={s.muted}>Explore available properties by location.</p></div><div className={s.cityLinks}>{listings.cities.slice().sort((a, b) => ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'The Hague'].indexOf(a) - ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'The Hague'].indexOf(b)).map((city) => <Link href={`${base}/listings?q=${encodeURIComponent(city)}`} key={city}><span className={s.cityArtwork} aria-hidden="true" style={{ backgroundImage: "url(/site-assets/dutch-cities.webp)", backgroundPosition: `${Math.max(0, ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'The Hague'].indexOf(city)) * 25}% center` }} /><span>{city}</span><ArrowUpRight size={20} /></Link>)}</div></section>
      <section id="about" className={s.aboutSection}><div className={s.aboutPhoto}><img src="/site-assets/living-room.webp" alt="Illustrative living room" loading="lazy" /><span>A PLACE TO BELONG</span></div><div className={s.aboutContent}><p className={s.eyebrow}>WHY {tenant.name.toUpperCase()}</p><h2>More than real estate.<br />A better way home.</h2><p>Explore our properties, speak with the assigned agent, and arrange a viewing. We’re here to help you find a place that fits.</p><div className={s.aboutFacts}><div><strong>{listings.total}</strong><span>Available properties</span></div><div><strong>{listings.cities.length}</strong><span>Locations to explore</span></div><div><Home size={32} /><span>Personal support</span></div></div><div className={s.brandSeal} aria-hidden="true"><span>PEOPLE · PLACES · PROPERTY</span><Home size={29} /></div>{tenant.email && <a className={s.primary} href={`mailto:${tenant.email}`}>Get in touch <ArrowUpRight size={18} /></a>}</div></section>
    </>}
    {mode === 'listings' && <section className={`${s.container} ${s.listingPage}`}>
      <div className={s.breadcrumb}><Link href={base}>Home</Link><span>/</span><span>Properties</span></div>
      <div className={s.sectionHeading}><div><p className={s.eyebrow}>{tenant.name.toUpperCase()} COLLECTION</p><h1>{query.has('saved') ? 'Your saved places.' : 'Your next place is here.'}</h1><p className={s.muted}>{listings.total} {listings.total === 1 ? 'property' : 'properties'} {query.has('saved') ? 'in your collection' : 'to explore'}</p></div><div className={s.viewToggle}><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button><button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>Map</button></div></div>
      <div className={s.filters}><SearchForm expanded /><Link className={s.reset} href={`${base}/listings`}>Clear filters</Link></div>
      <div className={view === 'map' ? s.mapResults : ''}><div className={s.grid}>{listings.properties.map(p => <Card key={p._id} p={p} />)}</div>
      {view === 'map' && <aside className={s.mapPanel}><ListingsMap properties={listings.properties} selected={mapSelected} currency={tenant.currency} onSelect={id => {
        setMapSelected(id);
        document.querySelector(`[data-map-property="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }} /></aside>}</div>
      {!listings.properties.length && <div className={s.empty}><Home size={34} /><h2>{query.has('saved') ? 'Your collection starts here.' : 'No properties match this search.'}</h2><p>{query.has('saved') ? 'Save a property with the heart button. Favourites are stored in this browser.' : 'Try another location or a wider price range.'}</p><Link className={s.primary} href={`${base}/listings`}>Explore all properties</Link></div>}
      {listings.pages > 1 && <nav className={s.pagination} aria-label="Listing pages">{listings.page > 1 && <Link href={pageHref(listings.page - 1)}>Previous</Link>}<span>Page {listings.page} of {listings.pages}</span>{listings.page < listings.pages && <Link href={pageHref(listings.page + 1)}>Next</Link>}</nav>}
    </section>}
    {mode === 'detail' && property && <section className={`${s.container} ${s.detailPage}`}>
      <Link className={s.back} href={`${base}/listings`}><ArrowLeft size={16} /> Back to properties</Link>
      <div className={s.detailHeading}><div><p className={s.eyebrow}>{property.propertyType} · {property.purpose === 'Sale' ? 'FOR SALE' : 'FOR RENT / LEASE'}</p><h1>{title(property)}</h1><p className={s.muted}><MapPin size={16} />{property.location.city}, {property.location.country}</p></div><button type="button" className={s.secondary} disabled={!storageReady} aria-pressed={saved.includes(property._id)} onClick={() => toggleSaved(property._id)}><Heart size={18} fill={saved.includes(property._id) ? 'currentColor' : 'none'} />{saved.includes(property._id) ? 'Saved' : 'Save property'}</button></div>
      <div className={s.gallery}><button type="button" className={s.mainPhoto} onClick={() => dialog.current?.showModal()} aria-label="Open property photo gallery"><img src={imageList[activePhoto]} alt={`${property.images?.length ? '' : 'Illustrative photo: '}${title(property)}`} /><span>View photos <ArrowUpRight size={16} /></span></button><div className={s.thumbnails}>{imageList.slice(0, 3).map((url, i) => <button type="button" key={`${url}-${i}`} aria-label={`View photo ${i + 1}`} aria-pressed={activePhoto === i} onClick={() => setActivePhoto(i)}><img src={url} alt={`Photo ${i + 1}`} /></button>)}</div></div>
      {(property.demo || !property.images?.length) && <p className={s.demoBanner}>Demonstration listing · Photos are illustrative. Property details, prices and locations are sample data, not a real offer.</p>}
      <div className={s.detailColumns}><div className={s.propertyContent}>
        <div className={s.bigFacts}>{!!property.bedrooms && <span><BedDouble /><strong>{property.bedrooms}</strong>Bedrooms</span>}{!!property.bathrooms && <span><Bath /><strong>{property.bathrooms}</strong>Bathrooms</span>}<span><Ruler /><strong>{property.areaSize}</strong>{property.areaUnit === 'sqm' ? 'Square metres' : 'Square feet'}</span>{!!property.parking && <span><Home /><strong>{property.parking}</strong>Parking spaces</span>}</div>
        <section><h2>About this property</h2><p className={s.description}>{property.description}</p></section>
        <section><h2>The details that matter</h2><dl className={s.detailsList}><div><dt>Property type</dt><dd>{property.propertyType}</dd></div><div><dt>Purpose</dt><dd>{property.purpose}</dd></div><div><dt>Location</dt><dd>{property.location.city}</dd></div><div><dt>Availability</dt><dd>Available</dd></div></dl></section>
        <section><h2>Amenities</h2>{property.amenities?.length ? <ul className={s.amenities}>{property.amenities.map(a => <li key={a}><Check size={17} />{a}</li>)}</ul> : <p className={s.muted}>Ask the agent for the full list of amenities.</p>}</section>
        <section><h2>A closer look at the neighbourhood</h2><p className={s.muted}>{property.location.address}, {property.location.city}</p>{mapUrl(property) ? <iframe className={s.detailMap} title="Property neighbourhood map" src={mapUrl(property)} loading="lazy" referrerPolicy="no-referrer" /> : <p className={s.mapNote}>Contact the agent for the exact location.</p>}</section>
      </div><aside className={s.inquiryPanel} id="contact-agent">
        <div className={s.detailPrice}>{price(property)}</div><p className={s.muted}>{property.purpose === 'Sale' ? 'Asking price' : property.pricePeriod === 'year' ? 'Yearly asking price' : 'Monthly asking price'}</p>
        <div className={s.agent}><span className={s.agentAvatar}>{(property.agent?.name || tenant.name).replace(/^Sample\s*-\s*/i, '').slice(0, 1)}</span><div><strong>{property.agent?.name?.replace(/^Sample\s*-\s*/i, '') || tenant.name}</strong><span>Offered by {tenant.name}</span></div></div>
        <div className={s.contactLinks}>{(property.agent?.phone || tenant.phone) && <a href={`tel:${(property.agent?.phone || tenant.phone).replace(/[^+\d]/g, '')}`}><Phone size={16} />Call agent</a>}{(property.agent?.email || tenant.email) && <a href={`mailto:${property.agent?.email || tenant.email}`}><Mail size={16} />Email agent</a>}</div>
        {sent ? <div className={s.success} role="status"><Check size={28} /><h3>Your request is with us.</h3><p>{tenant.name} will contact you using the details provided. Viewing times are subject to confirmation.</p></div> : <form onSubmit={sendInquiry} className={s.inquiryForm}>
          <div className={s.formTabs}><button type="button" aria-pressed={!viewing} onClick={() => setViewing(false)}>Ask a question</button><button type="button" aria-pressed={viewing} onClick={() => setViewing(true)}>Request a viewing</button></div>
          <label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Email address<input type="email" name="email" autoComplete="email" required maxLength={254} /></label><label>Phone number <small>(optional)</small><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
          {viewing && <label>Preferred viewing date<input name="visitDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>}
          <label>Message<textarea name="message" required rows={3} maxLength={2000} placeholder={viewing ? 'Tell us your preferred time and anything we should know.' : 'What would you like to know about this property?'} /></label>
          <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
          <label className={s.consent}><input name="consent" type="checkbox" required /><span>I agree to share these details with {tenant.name} so they can respond to my request.</span></label>
          {formError && <p className={s.formError} role="alert">{formError}</p>}<button className={s.primary} disabled={sending}>{sending ? 'Sending...' : viewing ? 'Request a viewing' : 'Send inquiry'}<ArrowUpRight size={17} /></button>
          <p className={s.formNote}>Your message goes directly to this organization’s property team.</p>
        </form>}
      </aside></div>
      {!!listings.properties.length && <section className={s.related}><div className={s.sectionHeading}><h2>More places to consider</h2><Link href={`${base}/listings`} className={s.textButton}>All properties <ArrowUpRight size={16} /></Link></div><div className={s.grid}>{listings.properties.map(p => <Card key={p._id} p={p} />)}</div></section>}
      <dialog ref={dialog} className={s.lightbox} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><button type="button" className={s.closeGallery} aria-label="Close gallery" onClick={() => dialog.current?.close()}><X /></button><img src={imageList[activePhoto]} alt={`Property photo ${activePhoto + 1}`} /><div className={s.galleryControls}><button type="button" aria-label="Previous photo" onClick={() => setActivePhoto(n => (n + imageList.length - 1) % imageList.length)}><ChevronLeft /></button><span>{activePhoto + 1} / {imageList.length}</span><button type="button" aria-label="Next photo" onClick={() => setActivePhoto(n => (n + 1) % imageList.length)}><ChevronRight /></button></div></dialog>
    </section>}
    </main>
    <SiteFooter tenant={tenant} />
  </div>;
}
