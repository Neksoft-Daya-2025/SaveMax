import { createHash } from 'node:crypto';
import { AgentError } from './agent-policy';

const types = ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Office', 'Shop'];
export function validateAgentDraft(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new AgentError(422, 'INVALID_DRAFT', 'A structured draft is required.');
  const body = raw as Record<string, unknown>;
  const allowed = ['title', 'description', 'propertyType', 'purpose', 'price', 'pricePeriod', 'areaSize', 'areaUnit', 'address', 'city', 'country', 'zipCode', 'bedrooms', 'bathrooms', 'rightsConfirmed'];
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new AgentError(422, 'INVALID_DRAFT', 'Unsupported draft field.');
  const text = (key: string, min: number, max: number) => {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';
    if (value.length < min || value.length > max) throw new AgentError(422, 'INVALID_DRAFT', `Invalid ${key}.`);
    return value;
  };
  const number = (key: string, max: number, optional = false) => {
    if (optional && body[key] === undefined) return undefined;
    const value = body[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < (optional ? 0 : 0.01) || value > max || (optional && !Number.isInteger(value))) {
      throw new AgentError(422, 'INVALID_DRAFT', `Invalid ${key}.`);
    }
    return value;
  };
  const purpose = text('purpose', 1, 10), propertyType = text('propertyType', 1, 20);
  if (!['Sale', 'Rent', 'Lease'].includes(purpose) || !types.includes(propertyType) || body.areaUnit !== 'sqm') throw new AgentError(422, 'INVALID_DRAFT', 'Choose a supported purpose/type and sqm area.');
  if (body.rightsConfirmed !== true) throw new AgentError(422, 'RIGHTS_REQUIRED', 'Permission to advertise must be confirmed.');
  if (purpose !== 'Sale' && !['month', 'year'].includes(String(body.pricePeriod))) throw new AgentError(422, 'INVALID_DRAFT', 'Rent and lease require month or year pricing.');
  return { title: text('title', 5, 150), description: text('description', 30, 5000), propertyType, purpose,
    price: number('price', 1e10)!, pricePeriod: purpose === 'Sale' ? null : body.pricePeriod as string,
    areaSize: number('areaSize', 1e8)!, areaUnit: 'sqm', bedrooms: number('bedrooms', 100, true) ?? null,
    bathrooms: number('bathrooms', 100, true) ?? null,
    location: { address: text('address', 1, 200), city: text('city', 1, 100), country: text('country', 1, 100), zipCode: text('zipCode', 0, 20) },
    rightsConfirmed: true };
}
export type AgentDraft = ReturnType<typeof validateAgentDraft>;
export function draftHash(draft: AgentDraft) {
  const canonical = (value: unknown): unknown => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
  return createHash('sha256').update(JSON.stringify(canonical(draft))).digest('hex');
}
export function approvalExecutable(row: { state: string; expires_at: Date | string; approved_by: string | null }) {
  const expiry = new Date(row.expires_at).getTime();
  if (row.state !== 'APPROVED' || !row.approved_by || !Number.isFinite(expiry) || expiry <= Date.now()) {
    throw new AgentError(403, 'APPROVAL_REQUIRED', 'A current human approval is required.');
  }
}
