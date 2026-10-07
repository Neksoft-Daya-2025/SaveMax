'use client';
import { useCallback, useEffect, useState } from 'react';

type Review = { id: string; candidate_id: string; state: string; expires_at: string; payload: {
  title: string; description: string; purpose: string; propertyType: string; price: number; pricePeriod: string | null;
  areaSize: number; bedrooms: number | null; bathrooms: number | null; location: { address: string; city: string; country: string; zipCode: string }; } };
export default function ApprovalReview({ organizationName }: { organizationName: string }) {
  const [rows, setRows] = useState<Review[]>([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null), [rights, setRights] = useState<Record<string, boolean>>({});
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/agent-review/approvals', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Could not load approvals.');
      setRows(result.data); setError('');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load approvals.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function decide(id: string, decision: 'APPROVED' | 'REJECTED') {
    setBusy(id); setError('');
    try {
      const response = await fetch(`/api/agent-review/approvals/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rightsConfirmed: rights[id] === true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Could not save the decision.');
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save the decision.'); }
    finally { setBusy(null); }
  }
  return <section className="mx-auto max-w-5xl space-y-6 text-slate-900">
    <div><h1 className="text-2xl font-semibold">AI candidate approvals</h1><p className="mt-2 text-sm font-medium text-slate-700">Reviewing candidates for {organizationName}</p><p className="mt-2 text-sm text-slate-600">Review the exact property details before allowing a non-public draft. Approval does not publish the property.</p></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {loading ? <p role="status">Loading approvals…</p> : !error && rows.length === 0 && <p>No candidates awaiting review.</p>}
    {rows.map(row => {
      const expired = new Date(row.expires_at).getTime() <= Date.now();
      const pending = row.state === 'PENDING' && !expired;
      return <article key={row.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{row.payload.title}</h2><span className="text-sm text-slate-600">{expired && row.state !== 'EXECUTED' ? 'EXPIRED' : row.state}</span></div>
        <p>{new Intl.NumberFormat('en-NL', { style: 'currency', currency: 'EUR' }).format(row.payload.price)}{row.payload.purpose === 'Sale' ? '' : ` / ${row.payload.pricePeriod}`} · {row.payload.purpose} · {row.payload.areaSize} m²</p>
        <p className="text-sm">{row.payload.location.address}, {row.payload.location.zipCode} {row.payload.location.city}, {row.payload.location.country}</p>
        <p className="text-sm">{row.payload.propertyType} · Bedrooms: {row.payload.bedrooms ?? 'Not provided'} · Bathrooms: {row.payload.bathrooms ?? 'Not provided'}</p>
        <p className="whitespace-pre-wrap text-sm leading-6">{row.payload.description}</p>
        <p className="text-xs text-slate-600">Candidate: {row.candidate_id} · Approval: {row.id} · Expires: {new Date(row.expires_at).toLocaleString()}</p>
        {pending && <><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rights[row.id] || false} onChange={event => setRights({ ...rights, [row.id]: event.target.checked })} className="mt-1" />I have checked these details and confirm permission to advertise this property.</label>
          <div className="flex gap-3"><button disabled={busy !== null || !rights[row.id]} onClick={() => void decide(row.id, 'APPROVED')} className="rounded-lg bg-blue-800 px-4 py-2 text-sm text-white disabled:opacity-50">Approve draft</button>
            <button disabled={busy !== null} onClick={() => void decide(row.id, 'REJECTED')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Reject</button></div></>}
      </article>;
    })}
  </section>;
}
