// web/consent-gate.mjs
// 동의 게이트 — 계정 저장(회원가입·클라우드 저장)을 시도하는 순간에만 평가한다.
// 첫 방문 화면은 열어 두고(앱 바로 노출), 약관·방침·만 14세 3필수 동의와 클라우드 저장 만 19세 게이트는
// 계정/클라우드 진입 시점에 통과시킨다. 동의 상태와 시각은 이 기기의 localStorage에만 저장한다(중앙 전송 없음).
// 순수 로직 모듈: DOM 의존 없이 주입된 storage(Web Storage 호환)로 동작하며 자동 테스트가 쉽다.

export const CONSENT_STORAGE_KEY = 'saju.consent.gate.v1';
export const CONSENT_SCHEMA_VERSION = 1;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function emptyConsent() {
  return {
    schemaVersion: CONSENT_SCHEMA_VERSION,
    terms: false,
    privacy: false,
    age14: null, // 'over14' | 'under14' | null(미선택)
    passedAt: null,
    declined: false,
    cloud19: null, // 'over19' | 'under19' | null
    cloud19At: null,
  };
}

function coerceConsent(raw) {
  const base = emptyConsent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    schemaVersion: CONSENT_SCHEMA_VERSION,
    terms: raw.terms === true,
    privacy: raw.privacy === true,
    age14: raw.age14 === 'over14' || raw.age14 === 'under14' ? raw.age14 : null,
    passedAt: typeof raw.passedAt === 'string' && ISO_DATE.test(raw.passedAt) ? raw.passedAt : null,
    declined: raw.declined === true,
    cloud19: raw.cloud19 === 'over19' || raw.cloud19 === 'under19' ? raw.cloud19 : null,
    cloud19At: typeof raw.cloud19At === 'string' && ISO_DATE.test(raw.cloud19At) ? raw.cloud19At : null,
  };
}

/**
 * 저장소에서 동의 상태를 읽는다.
 * @param {Storage|{getItem(key):string|null, setItem(key,value):void, removeItem(key):void}} storage
 */
export function readConsentState(storage) {
  if (!storage || typeof storage.getItem !== 'function') return emptyConsent();
  try {
    return coerceConsent(JSON.parse(storage.getItem(CONSENT_STORAGE_KEY) || 'null'));
  } catch {
    return emptyConsent();
  }
}

/**
 * 동의 상태를 이 기기에만 저장한다. 반환값은 갱신된 전체 상태.
 * @returns 저장된 상태(coerce 후)
 */
export function persistConsent(storage, patch, now = new Date()) {
  const next = { ...readConsentState(storage), ...patch, schemaVersion: CONSENT_SCHEMA_VERSION };
  if (patch && (patch.terms === true || patch.age14 === 'over14')) {
    // 서비스 게이트가 완전히 통과되는 순간에만 통과 시각을 찍는다
    if (next.terms === true && next.privacy === true && next.age14 === 'over14' && !next.passedAt) next.passedAt = now.toISOString();
  }
  if (patch && patch.cloud19 === 'over19' && !next.cloud19At) next.cloud19At = now.toISOString();
  storage?.setItem?.(CONSENT_STORAGE_KEY, JSON.stringify(next));
  return coerceConsent(next);
}

/** 서비스(만 14세) 게이트 평가 — 미통과 시 서비스 이용 불가 */
export function evaluateServiceGate(consent) {
  const state = coerceConsent(consent);
  const blockers = [];
  if (state.terms !== true) blockers.push('terms');
  if (state.privacy !== true) blockers.push('privacy');
  if (state.age14 !== 'over14') blockers.push('age14');
  return {
    open: blockers.length > 0,
    blocked: blockers.length > 0 || state.declined === true,
    underAge: state.age14 === 'under14',
    blockers,
    passedAt: state.passedAt,
  };
}

/** 클라우드 저장(계정) 진입용 만 19세 게이트 평가 — 통과 전에는 로그인 진행 불가 */
export function evaluateCloudGate(consent) {
  const state = coerceConsent(consent);
  return {
    open: state.cloud19 !== 'over19',
    underAge: state.cloud19 === 'under19',
    passedAt: state.cloud19At,
  };
}

/** 동의 철회(이 기기 기록만 지움 — 저장소 키 하나만 제거) */
export function resetConsent(storage) {
  storage?.removeItem?.(CONSENT_STORAGE_KEY);
  return emptyConsent();
}
