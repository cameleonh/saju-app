import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PURPOSES,
  findReceipt,
  validatePurposeReceipts,
  isTrainingEligible,
} from '../../server/domain/purpose.mjs';

assert.deepEqual(
  PURPOSES,
  Object.freeze({
    SERVICE_STORAGE: 'service_storage',
    MODEL_TRAINING: 'model_training',
    THIRD_PARTY_AI: 'third_party_ai_transfer',
    HUMAN_REVIEW: 'human_quality_review',
  }),
  'PURPOSES is a frozen, ordered constant',
);
assert.equal(Object.isFrozen(PURPOSES), true);

const baseReceipt = (purpose, decision = 'accepted') => ({
  receiptId: `${purpose}-id`,
  purpose,
  decision,
  disclosureVersion: 'v1',
  recordedAt: '2026-08-01T00:00:00Z',
});

assert.equal(findReceipt([baseReceipt('service_storage')], PURPOSES.SERVICE_STORAGE).receiptId, 'service_storage-id');
assert.equal(findReceipt([baseReceipt('model_training', 'granted')], PURPOSES.MODEL_TRAINING).decision, 'granted');
assert.equal(findReceipt([baseReceipt('service_storage', 'declined')], PURPOSES.SERVICE_STORAGE), undefined, 'declined receipts are not active');
assert.equal(findReceipt([baseReceipt('service_storage', 'withdrawn')], PURPOSES.SERVICE_STORAGE), undefined, 'withdrawn receipts are not active');
assert.equal(findReceipt([], PURPOSES.SERVICE_STORAGE), undefined);
assert.equal(findReceipt([null, {}, { purpose: 'service_storage' }], PURPOSES.SERVICE_STORAGE), undefined, 'malformed receipts do not match');

assert.deepEqual(validatePurposeReceipts([baseReceipt('service_storage')]), []);
assert.deepEqual(validatePurposeReceipts([baseReceipt('service_storage'), baseReceipt('model_training')]), []);

assert.ok(validatePurposeReceipts(undefined).includes('purposeReceipts must be an array'));
assert.ok(validatePurposeReceipts(null).includes('purposeReceipts must be an array'));
assert.ok(validatePurposeReceipts('nope').includes('purposeReceipts must be an array'));

const missingService = validatePurposeReceipts([baseReceipt('model_training')]);
assert.ok(missingService.some((error) => /service_storage authorization is required/.test(error)), 'service storage is mandatory');

for (const malformed of [null, 'string', 42]) {
  const errors = validatePurposeReceipts([malformed]);
  assert.ok(errors.some((error) => /each purpose receipt must be an object/.test(error)), `non-object receipt ${JSON.stringify(malformed)} is rejected`);
}

const emptyObjectErrors = validatePurposeReceipts([{}]);
assert.ok(
  emptyObjectErrors.some((error) => /purpose receipts require receiptId, purpose, disclosureVersion, and recordedAt/.test(error)),
  'an object without fields is caught by the field-presence rule',
);

for (const missingField of [
  { receiptId: 'r', purpose: 'service_storage', disclosureVersion: 'v1' },
  { receiptId: 'r', purpose: 'service_storage', recordedAt: '2026-08-01' },
  { purpose: 'service_storage', disclosureVersion: 'v1', recordedAt: '2026-08-01' },
  { receiptId: 'r', disclosureVersion: 'v1', recordedAt: '2026-08-01' },
]) {
  const errors = validatePurposeReceipts([missingField]);
  assert.ok(
    errors.some((error) => /purpose receipts require receiptId, purpose, disclosureVersion, and recordedAt/.test(error)),
    `receipt missing a required field is rejected: ${JSON.stringify(missingField)}`,
  );
}

const selfSubject = { relationship: 'self', authorityVerified: true, minor: false };
assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training')],
    dataSubject: selfSubject,
    relationshipMode: 'single',
  }),
  true,
  'self subject with explicit consent and no minor flag is eligible',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training', 'withdrawn')],
    dataSubject: selfSubject,
    relationshipMode: 'single',
  }),
  false,
  'withdrawn training consent blocks eligibility',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage')],
    dataSubject: selfSubject,
    relationshipMode: 'single',
  }),
  false,
  'missing training receipt blocks eligibility',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training')],
    dataSubject: selfSubject,
    relationshipMode: 'couple',
  }),
  false,
  'couple submissions are never training-eligible under the current policy',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training')],
    dataSubject: { relationship: 'self', authorityVerified: false, minor: false },
    relationshipMode: 'single',
  }),
  false,
  'unverified authority blocks eligibility',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training')],
    dataSubject: { relationship: 'self', authorityVerified: true, minor: true },
    relationshipMode: 'single',
  }),
  false,
  'minors are never training-eligible',
);

assert.equal(
  isTrainingEligible({
    purposeReceipts: [baseReceipt('service_storage'), baseReceipt('model_training')],
    dataSubject: { relationship: 'third_party', authorityVerified: true, minor: false },
    relationshipMode: 'single',
  }),
  false,
  'third-party subjects are never training-eligible in v1',
);

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`purpose unit: ${assertionCount} assertions passed`);
