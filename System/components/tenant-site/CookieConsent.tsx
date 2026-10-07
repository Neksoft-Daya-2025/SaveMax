'use client';

import { useEffect, useRef, useState } from 'react';
import s from './cookie-consent.module.css';

type Preferences = { necessary: true; analytics: boolean; marketing: boolean; savedAt: number; version: 1 };
const copy = {
  title: 'Cookies on', introduction: 'We use essential cookies to keep the website working and to securely sign you in. Your saved properties are stored in your browser.',
  optional: 'Analytics and advertising cookies are not currently enabled. You can set your preferences for optional cookies below, and change your choice at any time using “Cookie preferences” in the footer.',
  manage: 'Manage preferences', reject: 'Reject optional cookies', accept: 'Accept all', save: 'Save preferences', reopen: 'Cookie preferences',
};

export default function CookieConsent({ name, slug }: { name: string; slug: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const key = `property-cookie-preferences:${slug}:v1`;
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let valid = false;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const value: Preferences = JSON.parse(raw);
        valid = value.version === 1 && value.necessary === true && typeof value.analytics === 'boolean' && typeof value.marketing === 'boolean'
          && Number.isFinite(value.savedAt) && value.savedAt <= Date.now() && Date.now() - value.savedAt < 180 * 86400000;
        if (valid) { setAnalytics(value.analytics); setMarketing(value.marketing); }
      }
    } catch { /* A blocked or corrupt store defaults to essential cookies only. */ }
    if (!valid && !dialog.current?.open) dialog.current?.showModal();
  }, [key]);
  function save(allowAnalytics: boolean, allowMarketing: boolean) {
    const preferences: Preferences = { necessary: true, analytics: allowAnalytics, marketing: allowMarketing, savedAt: Date.now(), version: 1 };
    setAnalytics(allowAnalytics); setMarketing(allowMarketing);
    try { localStorage.setItem(key, JSON.stringify(preferences)); setStorageError(false); }
    catch { setStorageError(true); }
    // Integrations can read this preference; no tracking scripts are installed by this dialog.
    window.dispatchEvent(new CustomEvent('property-cookie-preferences', { detail: { slug, ...preferences } }));
    dialog.current?.close();
  }
  return <>
    <button type="button" className={s.reopen} onClick={() => { setManage(true); dialog.current?.showModal(); }}>{copy.reopen}</button>
    {storageError && <span className={s.storageNotice} role="status">Your browser could not save this choice for your next visit.</span>}
    <dialog ref={dialog} className={s.dialog} aria-labelledby={`cookie-title-${slug}`} onCancel={event => { event.preventDefault(); save(false, false); }}>
      <div className={s.brand}>{name}<small>REAL ESTATE</small></div>
      <h2 id={`cookie-title-${slug}`}>{copy.title} {name}</h2>
      <p>{copy.introduction}</p><p>{copy.optional}</p>
      {manage && <div className={s.preferences}>
        <label><span><strong>Essential cookies</strong><small>Sign-in, security and your cookie preferences. Always enabled.</small></span><input type="checkbox" checked disabled aria-label="Essential cookies, always enabled" /></label>
        <label><span><strong>Analytics cookies</strong><small>Permission to measure website usage. Not currently in use.</small></span><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /></label>
        <label><span><strong>Advertising cookies</strong><small>Permission for personalised advertising. Not currently in use.</small></span><input type="checkbox" checked={marketing} onChange={event => setMarketing(event.target.checked)} /></label>
      </div>}
      <div className={s.actions}>
        {manage ? <button type="button" className={s.manage} onClick={() => save(analytics, marketing)}>{copy.save}</button> : <button type="button" className={s.manage} onClick={() => setManage(true)}>{copy.manage}</button>}
        <button type="button" onClick={() => save(false, false)}>{copy.reject}</button>
        <button type="button" onClick={() => save(true, true)}>{copy.accept}</button>
      </div>
    </dialog>
  </>;
}
