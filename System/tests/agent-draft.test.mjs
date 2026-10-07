import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAgentDraft, draftHash, approvalExecutable } from '../lib/agent-draft.ts';

const sample = { title: 'Example apartment', description: 'A sufficiently detailed property description for review.',
  propertyType: 'Apartment', purpose: 'Sale', price: 400000, areaSize: 80, areaUnit: 'sqm',
  address: 'Example 1', city: 'Amsterdam', country: 'Netherlands', rightsConfirmed: true };
test('sale draft does not inherit monthly pricing', () => {
  assert.equal(validateAgentDraft({ ...sample, pricePeriod: 'month' }).pricePeriod, null);
});
test('rent requires an explicit supported period', () => {
  assert.throws(() => validateAgentDraft({ ...sample, purpose: 'Rent' }), error => error.status === 422);
  assert.equal(validateAgentDraft({ ...sample, purpose: 'Rent', pricePeriod: 'year' }).pricePeriod, 'year');
});
test('reject tenant, creator, publication and mongo operator fields supplied by caller', () => {
  for (const field of ['organization', 'createdBy', 'status', 'isFeatured', '$set']) {
    assert.throws(() => validateAgentDraft({ ...sample, [field]: 'anything' }), error => error.status === 422);
  }
});
test('reject missing rights, invalid units, oversized text and coerced numerical values', () => {
  for (const change of [{ rightsConfirmed: false }, { areaUnit: 'sqft' }, { price: '400000' },
    { price: Infinity }, { title: 'a'.repeat(151) }, { bedrooms: 1.5 }]) {
    assert.throws(() => validateAgentDraft({ ...sample, ...change }), error => error.status === 422);
  }
});
test('hash is invariant under PostgreSQL JSONB key reordering but changes with payload', () => {
  const draft = validateAgentDraft(sample);
  const reordered = Object.fromEntries(Object.entries(draft).reverse());
  reordered.location = Object.fromEntries(Object.entries(draft.location).reverse());
  assert.equal(draftHash(draft), draftHash(reordered));
  assert.notEqual(draftHash(draft), draftHash({ ...draft, price: 1 }));
});
test('pending, rejected, executed, expired and service self-approved records cannot execute', () => {
  for (const state of ['PENDING', 'REJECTED', 'EXECUTED']) assert.throws(() => approvalExecutable({ state, approved_by: 'human', expires_at: '2099-01-01' }));
  assert.throws(() => approvalExecutable({ state: 'APPROVED', approved_by: 'human', expires_at: '2020-01-01' }));
  assert.throws(() => approvalExecutable({ state: 'APPROVED', approved_by: null, expires_at: '2099-01-01' }));
  assert.throws(() => approvalExecutable({ state: 'APPROVED', approved_by: 'human', expires_at: 'invalid' }));
  assert.doesNotThrow(() => approvalExecutable({ state: 'APPROVED', approved_by: 'human', expires_at: '2099-01-01' }));
});
