export const purposes = ['Sale', 'Rent', 'Lease'] as const;
export const propertyTypes = ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Office', 'Shop'] as const;

export function validateListing(body: Record<string, unknown>) {
  const text = (key: string, max: number) => typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '';
  const purpose = text('purpose', 20), propertyType = text('propertyType', 20);
  const title = text('title', 150), description = text('description', 5000);
  const city = text('city', 100), address = text('address', 200), country = text('country', 100);
  const price = Number(body.price), areaSize = Number(body.areaSize);
  if (!purposes.includes(purpose as typeof purposes[number]) || !propertyTypes.includes(propertyType as typeof propertyTypes[number])) throw new Error('Choose a transaction and property type.');
  if (!Number.isFinite(price) || price <= 0 || price > 1e10 || !Number.isFinite(areaSize) || areaSize <= 0 || areaSize > 1e8) throw new Error('Enter a valid price and area.');
  if (!city || !address || !country) throw new Error('Enter the city, address and country.');
  if (title.length < 5 || description.length < 30) throw new Error('Add a title of at least 5 characters and a description of at least 30 characters.');
  if (body.consent !== true) throw new Error('Confirm you have permission to advertise this property.');
  const pricePeriod = purpose === 'Sale' ? undefined : text('pricePeriod', 20);
  if (purpose !== 'Sale' && !['month', 'year'].includes(pricePeriod || '')) throw new Error('Choose monthly or yearly pricing.');
  const rooms: Record<string, number | undefined> = {};
  let coordinates: { lat: number; lng: number } | undefined;
  if (body.lat !== '' && body.lat !== undefined || body.lng !== '' && body.lng !== undefined) {
    const lat = Number(body.lat), lng = Number(body.lng);
    if (body.lat === '' || body.lng === '' || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('Enter valid map coordinates.');
    coordinates = { lat, lng };
  }
  for (const key of ['bedrooms', 'bathrooms']) {
    if (body[key] === '' || body[key] === undefined) continue;
    const n = Number(body[key]);
    if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error('Enter valid room counts.');
    rooms[key] = n;
  }
  return { purpose: purpose as typeof purposes[number], propertyType: propertyType as typeof propertyTypes[number], title, description, price,
    pricePeriod: pricePeriod as 'month' | 'year' | undefined, areaSize, areaUnit: 'sqm' as const, ...rooms,
    location: { address, city, state: text('state', 100), country, zipCode: text('zipCode', 20), coordinates },
    hideExactAddress: body.hideExactAddress === true, floor: text('floor', 30),
    amenities: text('amenities', 1000).split(',').map(a => a.trim()).filter(Boolean).slice(0, 30) };
}
