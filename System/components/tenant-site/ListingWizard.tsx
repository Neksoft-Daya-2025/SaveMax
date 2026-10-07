'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import type { PublicTenant } from '@/lib/public-site';
import { propertyTypes, purposes } from '@/lib/listing-submission';
import s from './listing-wizard.module.css';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import MapPicker from '@/components/property/MapPicker';
import AddressAutocomplete from '@/components/property/AddressAutocomplete';

const initial = { purpose: 'Sale', propertyType: 'Apartment', price: '', pricePeriod: 'month', areaSize: '', bedrooms: '', bathrooms: '', floor: '',
  country: 'Netherlands', state: '', city: '', address: '', zipCode: '', lat: '', lng: '', hideExactAddress: false, title: '', description: '', amenities: '', consent: false };
type Customer = { name: string; email: string; phone?: string };
type Submission = { _id: string; title: string; status: string };

export default function ListingWizard({ tenant, accountMode = false }: { tenant: PublicTenant; accountMode?: boolean }) {
  const base = `/site/${tenant.slug}`, api = `/api/public/sites/${tenant.slug}`;
  const [listing, setListing] = useState(initial);
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<Customer | null>(null);
  const [checking, setChecking] = useState(true);
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    fetch(`${api}/account`).then(r => r.json()).then(data => { if (active) setUser(data.user); })
      .catch(() => { if (active) setError('Could not check your account. Reload to try again.'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [api]);
  useEffect(() => {
    const urls = photos.map(file => URL.createObjectURL(file)); setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [photos]);
  useEffect(() => {
    if (!user) return;
    fetch(`${api}/submissions`).then(r => r.json()).then(data => setSubmissions(data.properties || [])).catch(() => setError('Could not load your submissions.'));
  }, [api, user, done]);
  const update = (key: keyof typeof initial, value: string | boolean) => setListing(current => ({ ...current, [key]: value }));
  const changeStep = (next: number) => { setStep(next); setError(''); setTimeout(() => heading.current?.focus(), 0); };
  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (register) {
        const response = await fetch(`${api}/account`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error);
      }
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (result?.error) throw new Error('Could not sign in. Check your email and password.');
      const response = await fetch(`${api}/account`); const account = await response.json();
      if (!account.user) throw new Error(`This account is not registered with ${tenant.name}. Use an account for this website.`);
      setUser(account.user);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  }
  async function continueForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (step < 2) { changeStep(step + 1); return; }
    if (!photos.length) { setError('Add at least one property photo.'); return; }
    setBusy(true);
    try {
      const form = new FormData(); form.set('listing', JSON.stringify(listing)); photos.forEach(photo => form.append('photos', photo));
      const response = await fetch(`${api}/submissions`, { method: 'POST', body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setDone(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not submit the property.'); }
    finally { setBusy(false); }
  }
  const field = (key: keyof typeof initial, label: string, options: { required?: boolean; type?: string; min?: number; max?: number; maxLength?: number } = {}) =>
    <label>{label}<input name={key} step={['price', 'areaSize', 'lat', 'lng'].includes(key) ? 'any' : undefined} value={String(listing[key])} onChange={event => update(key, event.target.value)} {...options} /></label>;
  const price = new Intl.NumberFormat('en-NL', { style: 'currency', currency: tenant.currency || 'EUR', maximumFractionDigits: 0 }).format(Number(listing.price) || 0);
  const score = Math.round([!!listing.price, !!listing.areaSize, !!listing.city, !!listing.address, listing.title.length >= 5, listing.description.length >= 30, photos.length > 0, listing.consent].filter(Boolean).length / 8 * 100);

  return <div className={s.page}>
    <SiteHeader tenant={tenant} />
    <main className={s.layout}>
      <section>
        <h1 ref={heading} tabIndex={-1}>{accountMode ? 'Your account' : 'List your property'}</h1>
        <p className={s.intro}>Advertise with {tenant.name}. Your listing is reviewed before publication.</p>
        {error && <p role="alert" className={s.error}>{error}</p>}
        {checking ? <p role="status">Checking your account…</p> : !user ? <div className={s.panel}>
          <h2>{register ? 'Create your account' : 'Sign in to continue'}</h2>
          <p>You need an account to submit a property and track its review.</p>
          <form onSubmit={authenticate}>
            {register && <><label>Full name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label></>}
            <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : undefined} maxLength={72} /></label>
            {register && <p>Use at least 10 characters.</p>}
            <button className={s.primary} disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account and continue' : 'Sign in'}</button>
          </form>
          <button className={s.textButton} onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already registered? Sign in' : 'New here? Create an account'}</button>
        </div> : <>
          <div className={s.identity}><span>Signed in as {user.name}</span><button type="button" onClick={async () => { await signOut({ redirect: false }); setUser(null); }}>Sign out</button></div>
          {accountMode || done ? <div className={s.panel}>
            <h2>{done ? 'Submitted for review' : 'Your listings'}</h2>
            {done && <p role="status">{tenant.name} will review your property. It will appear on the public website once approved.</p>}
            {submissions.length ? <ul className={s.submissions}>{submissions.map(p => <li key={p._id}><strong>{p.title}</strong><span>{p.status === 'Pending' ? 'Awaiting review' : p.status === 'Available' ? 'Published' : p.status}</span></li>)}</ul> : <p>You have no submissions yet.</p>}
            {accountMode ? <Link className={s.primary} href={`${base}/list-property`}>List a property →</Link> : <button className={s.primary} onClick={() => { setListing(initial); setPhotos([]); setDone(false); changeStep(0); }}>List another property</button>}
          </div> : <>
            <ol className={s.steps}>{['Property', 'Location', 'Presentation & publication'].map((name, index) => <li key={name} aria-current={step === index ? 'step' : undefined}><button type="button" disabled={index > step} onClick={() => changeStep(index)}><b>{index < step ? '✓' : index + 1}</b>{name}</button></li>)}</ol>
            <p className={s.intro}>{['Start with the essentials — what you offer and the price.', 'Help buyers find your property. Choose what location details appear publicly.', 'Make a strong first impression. Add photos and review your listing.'][step]}</p>
            <form onSubmit={continueForm}>
              {step === 0 && <>
                <div className={s.panel}><h2>Property</h2><fieldset><legend>Transaction type</legend><div className={s.choices}>{purposes.map(p => <label key={p}><input type="radio" name="purpose" checked={listing.purpose === p} onChange={() => update('purpose', p)} /><span>{p === 'Sale' ? 'For sale' : p === 'Rent' ? 'For rent' : 'For lease'}</span></label>)}</div></fieldset>
                  <fieldset><legend>Property type</legend><div className={s.choices}>{propertyTypes.map(p => <label key={p}><input type="radio" name="propertyType" checked={listing.propertyType === p} onChange={() => update('propertyType', p)} /><span>{p}</span></label>)}</div></fieldset></div>
                <div className={s.panel}><h2>Price & details</h2><div className={s.fields}>{field('price', `Total price (${tenant.currency})`, { type: 'number', required: true, min: 1, max: 1e10 })}
                  {listing.purpose !== 'Sale' && <label>Billing period<select value={listing.pricePeriod} onChange={e => update('pricePeriod', e.target.value)}><option value="month">Per month</option><option value="year">Per year</option></select></label>}
                  {field('areaSize', 'Usable area (m²)', { type: 'number', required: true, min: 1, max: 1e8 })}{field('bedrooms', 'Bedrooms', { type: 'number', min: 0, max: 100 })}{field('bathrooms', 'Bathrooms', { type: 'number', min: 0, max: 100 })}{field('floor', 'Floor (optional)', { maxLength: 30 })}</div></div>
              </>}
              {step === 1 && <div className={s.panel}><h2>Location</h2><div className={s.fields}>{field('country', 'Country', { required: true, maxLength: 100 })}{field('state', 'Province / region', { maxLength: 100 })}{field('city', 'City', { required: true, maxLength: 100 })}{field('zipCode', 'Postcode', { maxLength: 20 })}</div>{process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && <AddressAutocomplete value={listing.address} onChange={(address, lat, lng, city, state, zipCode, country) => setListing(current => ({ ...current, address, lat: String(lat), lng: String(lng), city, state, zipCode, country }))} />}{field('address', 'Street and house number', { required: true, maxLength: 200 })}
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && <MapPicker address={listing.address} coordinates={{ lat: listing.lat ? Number(listing.lat) : 52.1326, lng: listing.lng ? Number(listing.lng) : 5.2913 }} onChange={(lat, lng) => setListing(current => ({ ...current, lat: String(lat), lng: String(lng) }))} />}
                <details><summary>Map coordinates (optional)</summary><div className={s.fields}>{field('lat', 'Latitude', { type: 'number', min: -90, max: 90 })}{field('lng', 'Longitude', { type: 'number', min: -180, max: 180 })}</div></details><label className={s.check}><input type="checkbox" checked={listing.hideExactAddress} onChange={e => update('hideExactAddress', e.target.checked)} />Show only the city publicly</label><p>The full address remains available to the review team.</p></div>}
              {step === 2 && <>
                <div className={s.panel}><h2>Photos</h2><p>Add 1–6 JPG, PNG or WebP photos, up to 3 MB each. The first photo is the cover.</p><label>Choose photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 6 || files.some(file => file.size > 3 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { setError('Choose up to 6 JPG, PNG or WebP photos under 3 MB each.'); e.target.value = ''; return; }
                  setError(''); setPhotos(files);
                }} /></label><div className={s.photos}>{previews.map((url, i) => <div key={url}><img src={url} alt={`Property photo ${i + 1}`} /><button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos(current => current.filter((_, index) => index !== i))}>×</button></div>)}</div></div>
                <div className={s.panel}><h2>Presentation</h2>{field('title', 'Listing title', { required: true, maxLength: 150 })}<label>Description<textarea required minLength={30} maxLength={5000} rows={7} value={listing.description} onChange={e => update('description', e.target.value)} /></label>{field('amenities', 'Amenities (comma separated)', { maxLength: 1000 })}<p>Contact: {user.name} · {user.email}{user.phone ? ` · ${user.phone}` : ''}</p><label className={s.check}><input required type="checkbox" checked={listing.consent} onChange={e => update('consent', e.target.checked)} />I have permission to advertise this property and these photos, and confirm the details are accurate.</label><p>Your contact details are shared with the review team. They are not added to the public listing.</p></div>
                <div className={s.panel}><h2>Publication</h2><p>This is a request for publication. {tenant.name} reviews the information and approves the listing before it becomes visible to visitors.</p></div>
              </>}
              <div className={s.controls}>{step > 0 && <button type="button" disabled={busy} onClick={() => changeStep(step - 1)}>← Back</button>}<button className={s.primary} disabled={busy}>{busy ? 'Submitting…' : step === 0 ? 'Continue to location →' : step === 1 ? 'Continue to presentation →' : 'Submit for review'}</button></div>
            </form>
          </>}
        </>}
      </section>
      {!accountMode && <aside className={s.preview}><div className={s.panel}>{previews[0] ? <img className={s.cover} src={previews[0]} alt="Listing cover preview" /> : <div className={s.placeholder}>Your property photo</div>}<span className={s.badge}>For {listing.purpose === 'Sale' ? 'sale' : listing.purpose === 'Rent' ? 'rent' : 'lease'}</span><h2>{price}{listing.purpose !== 'Sale' && <small> / {listing.pricePeriod}</small>}</h2><h3>{listing.title || 'Your listing title'}</h3><p>{listing.city || 'Location added in step 2'}{listing.country ? `, ${listing.country}` : ''}</p>{listing.areaSize && <p>{listing.areaSize} m²{listing.bedrooms ? ` · ${listing.bedrooms} bedrooms` : ''}</p>}<p className={s.previewText}>{listing.description || 'Your description will appear here.'}</p><label>Listing completeness<progress value={score} max={100} /></label><p>{score}% complete · {done ? 'Awaiting review' : 'Not published'}</p></div></aside>}
    </main>
    <SiteFooter tenant={tenant} />
  </div>;
}
