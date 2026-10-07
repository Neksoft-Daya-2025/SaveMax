import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import Property from '@/models/Property';
import { guardPublicWrite, listingAccount } from '@/lib/public-account';
import { validateListing } from '@/lib/listing-submission';

export const runtime = 'nodejs';
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const account = await listingAccount((await params).slug);
  if (!account) return NextResponse.json({ error: 'Sign in to this website first.' }, { status: 401 });
  const properties = await Property.find({ organization: account.tenant.id, createdBy: account.user._id, submissionSource: 'public' })
    .select('title status purpose price pricePeriod createdAt').sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ properties }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    guardPublicWrite(request, 'public-listing', 5);
    const account = await listingAccount((await params).slug);
    if (!account) return NextResponse.json({ error: 'Sign in to this website first.' }, { status: 401 });
    // Bound the actual streamed body, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Missing form.' }, { status: 400 });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const part = await reader.read(); if (part.done) break;
      size += part.value.length;
      if (size > 20 * 1024 * 1024) { await reader.cancel(); return NextResponse.json({ error: 'Photos exceed the upload limit.' }, { status: 413 }); }
      chunks.push(part.value);
    }
    const form = await new Request(request.url, { method: 'POST', headers: { 'Content-Type': request.headers.get('content-type') || '' }, body: Buffer.concat(chunks) }).formData();
    const raw = form.get('listing');
    if (typeof raw !== 'string' || raw.length > 12000) return NextResponse.json({ error: 'Invalid listing.' }, { status: 400 });
    const listing = validateListing(JSON.parse(raw));
    const files = form.getAll('photos');
    if (!files.length || files.length > 6) return NextResponse.json({ error: 'Add 1–6 property photos.' }, { status: 400 });
    const images: { url: string; isFeatured: boolean }[] = [];
    for (const file of files) {
      if (!(file instanceof File) || file.size > 3 * 1024 * 1024) return NextResponse.json({ error: 'Each photo must be under 3 MB.' }, { status: 400 });
      const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 20000000 });
      const metadata = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages || 1) > 1) return NextResponse.json({ error: 'Use JPG, PNG or WebP photos.' }, { status: 400 });
      const output = await image.rotate().resize({ width: 1400, height: 1000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
      if (output.length > 500000) return NextResponse.json({ error: 'Please use smaller photos.' }, { status: 400 });
      images.push({ url: `data:image/webp;base64,${output.toString('base64')}`, isFeatured: images.length === 0 });
    }
    const property = await Property.create({ ...listing, images, organization: account.tenant.id, createdBy: account.user._id,
      status: 'Pending', submissionSource: 'public', isFeatured: false, isHot: false });
    return NextResponse.json({ id: String(property._id), status: 'Pending' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const validation = /^(Choose|Enter|Add a title|Confirm|Too many|Invalid request origin)/.test(message);
    return NextResponse.json({ error: validation ? message : 'Could not submit this listing. Check the photos and try again.' }, { status: message.includes('origin') ? 403 : message.startsWith('Too many') ? 429 : 400 });
  }
}
