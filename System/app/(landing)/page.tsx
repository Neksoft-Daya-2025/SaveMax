/* Developed by RUDRA via NEKLLM */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/website-settings', { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (data.success) setLogoUrl(data.data?.landingPage?.logoUrl || '');
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        {logoUrl ? (
          <img src={logoUrl} alt="SaveMAX" className="mx-auto mb-6 h-20 w-auto max-w-full object-contain" onError={() => setLogoUrl('')} />
        ) : (
          <p className="mb-6 text-sm font-bold tracking-widest text-blue-900">SaveMAX</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Build frontend here</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">This space is ready for the SaveMAX website.</p>
        <Link href="/login" className="mt-8 inline-flex rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900">
          Login to dashboard
        </Link>
        <p className="mt-10 text-xs text-slate-500">Developed by Neksoft Global Service Pvt. Ltd.</p>
      </section>
    </main>
  );
}
