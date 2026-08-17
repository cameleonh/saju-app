import assert from 'node:assert/strict';
import {
  CONSENT_STORAGE_KEY,
  evaluateCloudGate,
  evaluateServiceGate,
  persistConsent,
  readConsentState,
  resetConsent,
} from '../../web/consent-gate.mjs';

let passed = 0;
const ok = (label) => { passed++; console.log(`  ✓ ${label}`); };

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    backing: map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: (key) => { map.delete(key); },
  };
}

// 1. 첫 방문(저장소 비어 있음) → 서비스 게이트 열림, 이용 불가
{
  const storage = memoryStorage();
  const consent = readConsentState(storage);
  const gate = evaluateServiceGate(consent);
  assert.equal(gate.open, true, 'first visit opens the gate');
  assert.equal(gate.blocked, true, 'first visit blocks the service');
  assert.deepEqual(gate.blockers, ['terms', 'privacy', 'age14']);
  ok('first visit: gate open with three required blockers');
}

// 2. 약관·방침만 동의 → 여전히 차단(age14 미선택)
{
  const storage = memoryStorage();
  persistConsent(storage, { terms: true, privacy: true });
  const gate = evaluateServiceGate(readConsentState(storage));
  assert.equal(gate.open, true);
  assert.deepEqual(gate.blockers, ['age14']);
  assert.equal(gate.underAge, false);
  ok('terms+privacy only: still blocked until age is confirmed');
}

// 3. 만 14세 미만 선택 → 이용 불가 + underAge
{
  const storage = memoryStorage();
  persistConsent(storage, { terms: true, privacy: true, age14: 'under14' });
  const gate = evaluateServiceGate(readConsentState(storage));
  assert.equal(gate.open, true);
  assert.equal(gate.underAge, true);
  assert.ok(gate.blockers.includes('age14'));
  ok('under 14 selection: blocked and flagged underAge');
}

// 4. 세 항목 모두 동의 → 게이트 통과, 통과 시각이 이 기기에 기록됨
{
  const storage = memoryStorage();
  const at = new Date('2026-08-17T10:00:00Z');
  const saved = persistConsent(storage, { terms: true, privacy: true, age14: 'over14' }, at);
  const gate = evaluateServiceGate(saved);
  assert.equal(gate.open, false, 'full consent closes the gate');
  assert.equal(gate.blocked, false);
  assert.equal(gate.passedAt, at.toISOString(), 'consent timestamp is recorded');
  assert.equal(readConsentState(storage).passedAt, at.toISOString(), 'timestamp round-trips through local storage only');
  assert.deepEqual([...storage.backing.keys()], [CONSENT_STORAGE_KEY], 'only the single consent key is written');
  ok('full consent: gate passes with a local timestamp');
}

// 5. 거절(이용하지 않기) → 동의했더라도 서비스 이용 불가
{
  const storage = memoryStorage();
  persistConsent(storage, { terms: true, privacy: true, age14: 'over14' });
  persistConsent(storage, { declined: true });
  const gate = evaluateServiceGate(readConsentState(storage));
  assert.equal(gate.open, false);
  assert.equal(gate.blocked, true, 'declining blocks the service even after consent');
  ok('decline: service stays blocked');
}

// 6. 파손된 저장 값 → 빈 상태로 폴백(게이트 재오픈)
{
  const storage = memoryStorage({ [CONSENT_STORAGE_KEY]: '{not json' });
  const gate = evaluateServiceGate(readConsentState(storage));
  assert.equal(gate.open, true);
  const weird = memoryStorage({ [CONSENT_STORAGE_KEY]: JSON.stringify({ terms: 'yes', age14: 19, passedAt: 'yesterday' }) });
  const gate2 = evaluateServiceGate(readConsentState(weird));
  assert.deepEqual(gate2.blockers, ['terms', 'privacy', 'age14'], 'non-canonical values coerce to unconsented');
  ok('corrupt storage: fails closed back to the gate');
}

// 7. 클라우드 저장(계정) 만 19세 게이트 — 서비스 게이트와 독립
{
  const storage = memoryStorage();
  persistConsent(storage, { terms: true, privacy: true, age14: 'over14' });
  const cloud = evaluateCloudGate(readConsentState(storage));
  assert.equal(cloud.open, true, 'cloud gate is separate and starts closed');
  assert.equal(evaluateServiceGate(readConsentState(storage)).open, false, 'service gate stays passed');
  ok('cloud gate: independent from the service gate');
}

// 8. 만 19세 미만 → 클라우드 저장 진입 불가
{
  const storage = memoryStorage();
  persistConsent(storage, { cloud19: 'under19' });
  const cloud = evaluateCloudGate(readConsentState(storage));
  assert.equal(cloud.open, true);
  assert.equal(cloud.underAge, true);
  ok('under 19: cloud save entry stays blocked');
}

// 9. 만 19세 확인 → 클라우드 게이트 통과 + 시각 기록(로컬만)
{
  const storage = memoryStorage();
  const at = new Date('2026-08-17T11:30:00Z');
  persistConsent(storage, { cloud19: 'over19' }, at);
  const cloud = evaluateCloudGate(readConsentState(storage));
  assert.equal(cloud.open, false);
  assert.equal(cloud.underAge, false);
  assert.equal(cloud.passedAt, at.toISOString());
  assert.equal(readConsentState(storage).age14, null, 'cloud confirmation does not imply the 14+ service gate');
  assert.deepEqual([...storage.backing.keys()], [CONSENT_STORAGE_KEY]);
  ok('over 19: cloud gate passes with timestamp, single local key');
}

// 10. 철회 → 상태 초기화, 재방문 시 게이트 재오픈
{
  const storage = memoryStorage();
  persistConsent(storage, { terms: true, privacy: true, age14: 'over14', cloud19: 'over19' });
  const cleared = resetConsent(storage);
  assert.equal(storage.backing.size, 0, 'reset removes the local consent record');
  assert.equal(evaluateServiceGate(cleared).open, true);
  assert.equal(evaluateCloudGate(cleared).open, true);
  ok('reset: both gates reopen');
}

// 11. 저장소 접근 불가 환경 → 폴백이 크래시 없이 게이트를 유지
{
  const gate = evaluateServiceGate(readConsentState(null));
  assert.equal(gate.open, true);
  const saved = persistConsent(null, { terms: true, privacy: true, age14: 'over14' });
  assert.equal(evaluateServiceGate(saved).open, false, 'in-memory evaluation still works without storage');
  ok('no storage available: logic still evaluates safely');
}

console.log(`✓ consent-gate: ${passed} assertions passed`);
