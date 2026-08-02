import { findReceipt, isTrainingEligible, PURPOSES, validatePurposeReceipts } from './purpose.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^\d{2}:\d{2}$/;

export function validateSubmission(input) {
  const errors = [];
  if (!input || typeof input !== 'object') return ['request body must be a JSON object'];
  if (input.schemaVersion !== 'submission.v1') errors.push('schemaVersion must be submission.v1');
  if (!input.clientRequestId || typeof input.clientRequestId !== 'string' || input.clientRequestId.length > 120) errors.push('clientRequestId is required');
  const birth = input.birthInput;
  if (!birth || typeof birth !== 'object') errors.push('birthInput is required');
  else {
    if (birth.calendar !== 'solar') errors.push('only solar input is supported by this adapter');
    if (!ISO_DATE.test(String(birth.date || ''))) errors.push('birthInput.date must use YYYY-MM-DD');
    if (!birth.unknownTime && !ISO_TIME.test(String(birth.time || ''))) errors.push('birthInput.time must use HH:MM unless unknownTime is true');
    if (typeof birth.place !== 'string' || birth.place.length === 0 || birth.place.length > 120) errors.push('birthInput.place is required');
    if (birth.placeCode != null && !/^\d{10}$/.test(String(birth.placeCode))) errors.push('birthInput.placeCode must be a 10-digit administrative-area code');
  }
  if (!input.chartResult || typeof input.chartResult !== 'object') errors.push('chartResult is required');
  if (!input.dataSubject || !['self', 'third_party'].includes(input.dataSubject.relationship)) errors.push('dataSubject.relationship must be self or third_party');
  if (input.dataSubject?.relationship === 'third_party' && input.dataSubject.authorityVerified !== true) errors.push('third-party submissions require verified authority');
  if (input.relationshipMode === 'couple') {
    const partnerBirth = input.partnerBirthInput;
    if (!partnerBirth || typeof partnerBirth !== 'object') errors.push('partnerBirthInput is required for couple submissions');
    else {
      if (partnerBirth.calendar !== 'solar') errors.push('only solar partner input is supported by this adapter');
      if (!ISO_DATE.test(String(partnerBirth.date || ''))) errors.push('partnerBirthInput.date must use YYYY-MM-DD');
      if (!partnerBirth.unknownTime && !ISO_TIME.test(String(partnerBirth.time || ''))) errors.push('partnerBirthInput.time must use HH:MM unless unknownTime is true');
      if (typeof partnerBirth.place !== 'string' || partnerBirth.place.length === 0 || partnerBirth.place.length > 120) errors.push('partnerBirthInput.place is required');
      if (partnerBirth.placeCode != null && !/^\d{10}$/.test(String(partnerBirth.placeCode))) errors.push('partnerBirthInput.placeCode must be a 10-digit administrative-area code');
    }
    if (!input.partnerSubject || input.partnerSubject.relationship !== 'partner') errors.push('partnerSubject.relationship must be partner for couple submissions');
    if (input.partnerSubject?.authorityVerified !== true) errors.push('couple submissions require verified partner authority');
    if (!Array.isArray(input.partnerPurposeReceipts)) errors.push('partnerPurposeReceipts are required for couple submissions');
    else errors.push(...validatePurposeReceipts(input.partnerPurposeReceipts).map((error) => `partner ${error}`));
  }
  errors.push(...validatePurposeReceipts(input.purposeReceipts));
  return errors;
}

export function buildSubmissionDecision(input) {
  const errors = validateSubmission(input);
  if (errors.length) return { accepted: false, errors };
  return {
    accepted: true,
    status: 'accepted-pending-persistence',
    durable: false,
    persistence: 'adapter-only; connect PostgreSQL before treating this as durable storage',
    trainingEligible: isTrainingEligible(input),
    purposes: input.purposeReceipts.map((receipt) => receipt.purpose),
  };
}

export function buildTrainingProjection(input) {
  if (!isTrainingEligible(input)) return null;
  return {
    schemaVersion: 'training-projection.v1',
    sourceSubmissionId: input.clientRequestId,
    subjectKey: `subject:${input.dataSubject.relationship}`,
    chartFacts: input.chartResult.facts || [],
    reading: input.chartResult.reading || [],
    policy: input.chartResult.policy || null,
    consentReceiptId: findReceipt(input.purposeReceipts, PURPOSES.MODEL_TRAINING).receiptId,
  };
}
