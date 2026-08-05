import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateCloudPersistence } from '../../server/domain/cloud-policy.mjs';

const auth = Object.freeze({ userId: '11111111-1111-4111-8111-111111111111', status: 'active' });
const input = Object.freeze({
  relationshipMode: 'single',
  dataSubject: Object.freeze({ relationship: 'self', authorityVerified: true, minor: false }),
  purposeReceipts: Object.freeze([
    Object.freeze({ purpose: 'service_storage', decision: 'accepted' }),
  ]),
});

assert.deepEqual(evaluateCloudPersistence({ auth: null, input }), {
  allowed: false,
  reason: 'authentication_required',
});

assert.deepEqual(evaluateCloudPersistence({ auth, input }), {
  allowed: true,
  reason: 'adult_self_storage',
});

assert.equal(evaluateCloudPersistence({ auth, input: { ...input, relationshipMode: 'couple' } }).allowed, false);
assert.equal(evaluateCloudPersistence({ auth, input: { ...input, dataSubject: { ...input.dataSubject, relationship: 'third_party' } } }).allowed, false);
assert.equal(evaluateCloudPersistence({ auth, input: { ...input, dataSubject: { ...input.dataSubject, minor: true } } }).allowed, false);
assert.equal(evaluateCloudPersistence({ auth, input: { ...input, dataSubject: { ...input.dataSubject, minor: 'unknown' } } }).allowed, false);
assert.equal(evaluateCloudPersistence({ auth: { ...auth, status: 'deleted' }, input }).allowed, false);
assert.deepEqual(evaluateCloudPersistence({
  auth,
  input: {
    ...input,
    purposeReceipts: [...input.purposeReceipts, { purpose: 'model_training', decision: 'accepted' }],
  },
}), {
  allowed: false,
  reason: 'optional_processing_disabled',
});

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`cloud policy unit: ${assertionCount} assertions passed`);
