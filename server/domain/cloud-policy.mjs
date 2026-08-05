const ACCEPTED = new Set(['accepted', 'granted']);

export function evaluateCloudPersistence({ auth, input }) {
  if (!auth?.userId || auth.status !== 'active') {
    return { allowed: false, reason: 'authentication_required' };
  }
  if (input?.relationshipMode === 'couple'
    || input?.dataSubject?.relationship !== 'self'
    || input?.dataSubject?.authorityVerified !== true
    || input?.dataSubject?.minor !== false) {
    return { allowed: false, reason: 'adult_self_only' };
  }
  const optionalPurpose = input?.purposeReceipts?.some((receipt) => receipt?.purpose !== 'service_storage' && ACCEPTED.has(receipt?.decision));
  if (optionalPurpose) return { allowed: false, reason: 'optional_processing_disabled' };
  return { allowed: true, reason: 'adult_self_storage' };
}
