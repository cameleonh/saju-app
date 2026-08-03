import { findReceipt, isTrainingEligible, PURPOSES, validatePurposeReceipts } from './purpose.mjs';
import { calculateAnnualContentHash, createAnnualReading } from './annual.mjs';

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
  if (input.readingScope != null && !['natal', 'annual'].includes(input.readingScope)) errors.push('readingScope must be natal or annual');
  if (input.readingScope === 'annual') {
    const annual = input.annualResult;
    if (!Number.isInteger(input.targetYear) || input.targetYear < 1900 || input.targetYear > 2099) errors.push('targetYear must be an integer from 1900 to 2099');
    if (!annual || typeof annual !== 'object') errors.push('annualResult is required for annual submissions');
    else {
      if (annual.schemaVersion !== 'annual-reading.v1') errors.push('annualResult.schemaVersion must be annual-reading.v1');
      if (annual.targetYear !== input.targetYear) errors.push('annualResult.targetYear must match targetYear');
      if (!annual.calculationPolicy?.id || !annual.calculationPolicy?.version) errors.push('annualResult calculation policy and version are required');
      if (!annual.interpretationProfile?.id || !annual.interpretationProfile?.version) errors.push('annualResult interpretation profile and version are required');
      if (!Array.isArray(annual.facts) || annual.facts.length === 0) errors.push('annualResult.facts are required');
      if (!Array.isArray(annual.cards) || annual.cards.length !== 8) errors.push('annualResult.cards must contain eight cards');
      if (!Array.isArray(annual.monthlyFlow) || annual.monthlyFlow.length !== 12) errors.push('annualResult.monthlyFlow must contain twelve entries');
      if (!/^[a-f0-9]{64}$/.test(String(annual.contentHash || ''))) errors.push('annualResult.contentHash must be a SHA-256 hex digest');
      else {
        try {
          if (calculateAnnualContentHash(annual) !== annual.contentHash) errors.push('annualResult.contentHash does not match its content');
          const pillars = input.chartResult?.pillars;
          if (!Array.isArray(pillars) || !pillars[1]?.branch || !pillars[2]?.stem) errors.push('annual submissions require structured natal pillars');
          else {
            const expected = createAnnualReading({
              targetYear: input.targetYear,
              natal: { dayStem: pillars[2].stem, monthBranch: pillars[1].branch, branches: pillars.map(({ branch }) => branch).filter((branch) => branch && branch !== '?'), unknownTime: Boolean(input.birthInput?.unknownTime) },
              chartPolicy: input.chartResult.policy || null,
            });
            if (expected.contentHash !== annual.contentHash) errors.push('annualResult does not match the deterministic annual calculation');
          }
        } catch (error) {
          errors.push(`annualResult verification failed: ${error.message}`);
        }
      }
    }
  }
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
  const projection = {
    schemaVersion: 'training-projection.v1',
    sourceSubmissionId: input.clientRequestId,
    subjectKey: `subject:${input.dataSubject.relationship}`,
    chartFacts: input.chartResult.facts || [],
    reading: input.chartResult.reading || [],
    policy: input.chartResult.policy || null,
    consentReceiptId: findReceipt(input.purposeReceipts, PURPOSES.MODEL_TRAINING).receiptId,
  };
  if (input.readingScope === 'annual' && input.annualResult) {
    projection.readingScope = 'annual';
    projection.targetYear = input.targetYear;
    projection.annualFacts = input.annualResult.facts;
    projection.annualCards = input.annualResult.cards;
    projection.annualPolicy = input.annualResult.calculationPolicy;
    projection.interpretationProfile = input.annualResult.interpretationProfile;
    projection.contentHash = input.annualResult.contentHash;
  }
  return projection;
}
