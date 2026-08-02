export const PURPOSES = Object.freeze({
  SERVICE_STORAGE: 'service_storage',
  MODEL_TRAINING: 'model_training',
  THIRD_PARTY_AI: 'third_party_ai_transfer',
  HUMAN_REVIEW: 'human_quality_review',
});

const ACCEPTED = new Set(['accepted', 'granted']);

export function findReceipt(receipts, purpose) {
  return receipts.find((receipt) => receipt.purpose === purpose && ACCEPTED.has(receipt.decision));
}

export function validatePurposeReceipts(receipts) {
  if (!Array.isArray(receipts)) return ['purposeReceipts must be an array'];
  const errors = [];
  const service = findReceipt(receipts, PURPOSES.SERVICE_STORAGE);
  if (!service) errors.push('service_storage authorization is required');
  for (const receipt of receipts) {
    if (!receipt || typeof receipt !== 'object') errors.push('each purpose receipt must be an object');
    else if (!receipt.receiptId || !receipt.purpose || !receipt.disclosureVersion || !receipt.recordedAt) errors.push('purpose receipts require receiptId, purpose, disclosureVersion, and recordedAt');
  }
  return errors;
}

export function isTrainingEligible(submission) {
  const training = findReceipt(submission.purposeReceipts, PURPOSES.MODEL_TRAINING);
  const subject = submission.dataSubject;
  return Boolean(
    training
    && submission.relationshipMode !== 'couple'
    && subject?.relationship === 'self'
    && subject?.authorityVerified === true
    && subject?.minor === false,
  );
}
