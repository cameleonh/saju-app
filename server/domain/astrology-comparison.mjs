import crypto from 'node:crypto';
import { NATAL_POLICY, calculateNatalChart, resolveSeoulCivilTime } from '../../chart/natal-engine.mjs';
import { MAHABOTE_POLICY, calculateMahabote } from '../../chart/mahabote-engine.mjs';
import { HORASAT_POLICY, calculateHorasat } from '../../chart/horasat-engine.mjs';
import { TU_VI_POLICY, calculateTuVi } from '../../chart/tu-vi-engine.mjs';

export const SYSTEM_IDS = Object.freeze(['saju', 'horasat', 'tu-vi', 'mahabote']);
export const ELIGIBILITY_STATUSES = Object.freeze(['eligible', 'partial', 'needs_input', 'policy_unverified', 'engine_unavailable', 'unsupported_range', 'invalid_input']);
export const RESULT_STATUSES = Object.freeze(['ready', 'partial']);
export const COMPARISON_VERSION = 'comparison.v1';

export const SYSTEM_REGISTRY = Object.freeze([
  Object.freeze({ schemaVersion: 'system-policy-descriptor.v1', systemId: 'saju', displayName: '한국 사주', policyId: NATAL_POLICY.id, policyVersion: NATAL_POLICY.version, status: 'active', engineVersion: NATAL_POLICY.engineVersion, factSchemaVersion: 'natal-chart.v1', sourceSetVersion: 'kasi-kasa-almanac-kst-minute@2024-2027.reviewed-2026-08-04', requiredInputs: Object.freeze(['inputCalendar.date']), optionalInputs: Object.freeze(['birthTime', 'place']), supportsPartial: true, engineAvailable: true, supportedRange: Object.freeze({ dateFrom: NATAL_POLICY.supportedSolarDates[0], dateTo: NATAL_POLICY.supportedSolarDates[1] }) }),
  Object.freeze({ schemaVersion: 'system-policy-descriptor.v1', systemId: 'mahabote', displayName: '미얀마 마하보테', policyId: MAHABOTE_POLICY.id, policyVersion: MAHABOTE_POLICY.version, status: 'active', engineVersion: MAHABOTE_POLICY.version, factSchemaVersion: 'mahabote-facts.v1', sourceSetVersion: 'mm-mahabote-sources.v1', requiredInputs: Object.freeze(['inputCalendar.date']), optionalInputs: Object.freeze(['birthTime']), supportsPartial: true, engineAvailable: true, supportedRange: Object.freeze({ dateFrom: '1900-01-01', dateTo: '2100-12-31' }) }),
  Object.freeze({ schemaVersion: 'system-policy-descriptor.v1', systemId: 'horasat', displayName: '태국 호라삿', policyId: HORASAT_POLICY.id, policyVersion: HORASAT_POLICY.version, status: 'active', engineVersion: HORASAT_POLICY.version, factSchemaVersion: 'horasat-facts.v1', sourceSetVersion: 'th-horasat-sources.v1', requiredInputs: Object.freeze(['inputCalendar.date']), optionalInputs: Object.freeze(['birthTime']), supportsPartial: true, engineAvailable: true, supportedRange: Object.freeze({ dateFrom: '1900-01-01', dateTo: '2100-12-31' }) }),
  Object.freeze({ schemaVersion: 'system-policy-descriptor.v1', systemId: 'tu-vi', displayName: '베트남 뜨비', policyId: TU_VI_POLICY.id, policyVersion: TU_VI_POLICY.version, status: 'active', engineVersion: TU_VI_POLICY.version, factSchemaVersion: 'tu-vi-facts.v1', sourceSetVersion: 'vn-tuvi-sources.v1', requiredInputs: Object.freeze(['inputCalendar.date']), optionalInputs: Object.freeze(['birthTime']), supportsPartial: true, engineAvailable: true, supportedRange: Object.freeze({ dateFrom: '1900-01-01', dateTo: '2100-12-31' }) }),
]);

const descriptorFor = (systemId) => SYSTEM_REGISTRY.find((item) => item.systemId === systemId);
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonical = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};
const fingerprint = (value) => ({ algorithm: 'sha256', value: sha256(canonical(value)) });
const reason = (code, field, messageKey) => ({ code, field: field || null, messageKey });

export function normalizeBirthProfile(input, { now = new Date(), profileId = crypto.randomUUID() } = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  const calendar = raw.calendar === 'solar' || raw.calendar === 'gregorian' ? 'gregorian' : raw.calendar === 'lunar' ? 'lunar' : null;
  const date = typeof raw.date === 'string' ? raw.date : null;
  const unknownTime = raw.unknownTime === true || raw.time === null || raw.time === undefined || raw.time === '';
  const timeStatus = unknownTime ? 'unknown' : (raw.timeAccuracy === 'approximate' ? 'approximate' : 'exact');
  if (!calendar || !date) throw new TypeError('birth profile requires calendar and date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError('birth profile date must use YYYY-MM-DD');
  const place = raw.place && typeof raw.place === 'object' ? raw.place : {};
  const latitude = Number(raw.latitude ?? place.latitude);
  const longitude = Number(raw.longitude ?? place.longitude);
  const timezoneId = raw.timezone || raw.timezoneId || place.timezoneId || (raw.placeCode ? 'Asia/Seoul' : null);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const normalized = {
    schemaVersion: 'birth-profile.v2', profileId, inputCalendar: { type: calendar, date, isLeapMonth: raw.isLeapMonth ?? null },
    birthTime: { status: timeStatus, localTime: timeStatus === 'unknown' ? null : raw.time, uncertaintyMinutes: timeStatus === 'approximate' ? Number(raw.uncertaintyMinutes || 30) : 0 },
    place: { label: typeof raw.place === 'string' ? raw.place : (place.label || null), countryCode: raw.countryCode || place.countryCode || (raw.placeCode ? 'KR' : null), latitude: hasCoordinates ? latitude : null, longitude: hasCoordinates ? longitude : null, timezoneId, timezoneConfidence: timezoneId ? (raw.timezoneConfidence || place.timezoneConfidence || 'inferred') : 'unresolved', legacyKoreanPlaceCode: raw.placeCode || place.legacyKoreanPlaceCode || null },
    resolvedInstant: null, traditionalSexParameter: ['female', 'male'].includes(raw.traditionalSexParameter) ? raw.traditionalSexParameter : 'not_provided', interestDomains: Array.isArray(raw.interestDomains) ? raw.interestDomains.filter((item) => typeof item === 'string').sort() : [], createdAt: now.toISOString(),
  };
  if (timeStatus !== 'unknown' && timezoneId === 'Asia/Seoul') {
    const civil = resolveSeoulCivilTime(date, raw.time);
    normalized.resolvedInstant = { utc: new Date(civil.utcMs).toISOString(), timezoneDataVersion: '2026c', resolutionStatus: civil.ambiguous ? 'ambiguous-earlier' : 'exact' };
  }
  return Object.freeze(normalized);
}

function commonReasons(profile) {
  const issues = [];
  if (!profile?.inputCalendar?.date || !profile?.inputCalendar?.type) issues.push(reason('INVALID_BIRTH_DATE', 'inputCalendar.date', 'eligibility.birthDateInvalid'));
  else if (profile.inputCalendar.type !== 'gregorian') issues.push(reason('UNSUPPORTED_CALENDAR', 'inputCalendar.type', 'eligibility.calendarUnsupported'));
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.inputCalendar.date)) issues.push(reason('INVALID_BIRTH_DATE', 'inputCalendar.date', 'eligibility.birthDateInvalid'));
  return issues;
}

export function resolveEligibility(profile, systemId) {
  const descriptor = descriptorFor(systemId);
  if (!descriptor) throw new TypeError(`unknown systemId: ${systemId}`);
  const reasons = commonReasons(profile);
  const date = profile?.inputCalendar?.date;
  if (reasons.length === 0 && descriptor.systemId === 'saju' && (date < descriptor.supportedRange.dateFrom || date > descriptor.supportedRange.dateTo)) reasons.push(reason('UNSUPPORTED_DATE_RANGE', 'inputCalendar.date', 'eligibility.dateOutOfRange'));
  if (reasons.length === 0 && descriptor.status !== 'active') reasons.push(reason('POLICY_NOT_ACTIVE', null, 'eligibility.policyNotActive'));
  const missingInputs = [];
  if (missingInputs.length) reasons.push(reason('REQUIRED_INPUT_MISSING', missingInputs[0], 'eligibility.requiredInputMissing'));
  const status = reasons.length ? (reasons[0].code === 'INVALID_BIRTH_DATE' || reasons[0].code === 'UNSUPPORTED_CALENDAR' ? 'invalid_input' : reasons[0].code === 'UNSUPPORTED_DATE_RANGE' ? 'unsupported_range' : reasons[0].code === 'POLICY_NOT_ACTIVE' ? 'policy_unverified' : reasons[0].code === 'ENGINE_LOAD_FAILED' ? 'engine_unavailable' : 'needs_input') : (descriptor.supportsPartial && profile.birthTime.status !== 'exact' ? 'partial' : 'eligible');
  return { schemaVersion: 'eligibility.v1', systemId, policyId: descriptor.policyId, policyVersion: descriptor.policyVersion, status, reasons, missingInputs, canCalculate: status === 'eligible' || status === 'partial', calculationPrecision: status === 'partial' ? 'date-and-month' : (status === 'eligible' ? 'minute' : 'none'), permittedOutputScopes: status === 'eligible' || status === 'partial' ? ['native_facts'] : [] };
}

const factIds = (chart) => chart.pillars.map((pillar, index) => ({ factId: `saju.pillar.${index}`, factType: 'pillar', value: pillar.text, position: pillar.label }));
export function calculateSystem(profile, systemId, { now = new Date() } = {}) {
  const eligibility = resolveEligibility(profile, systemId);
  if (!eligibility.canCalculate) return { eligibility, result: null };
  const descriptor = descriptorFor(systemId);

  if (systemId === 'mahabote') {
    const raw = {
      date: profile.inputCalendar.date,
      time: profile.birthTime.localTime || '12:00',
      unknownTime: profile.birthTime.status === 'unknown',
    };
    const nativeChart = calculateMahabote(raw);
    const facts = [
      { factId: 'mahabote.day', factType: 'weekday', value: nativeChart.birthDay.korean },
      { factId: 'mahabote.animal', factType: 'animal', value: nativeChart.birthDay.animal },
      { factId: 'mahabote.planet', factType: 'planet', value: nativeChart.birthDay.planet },
      { factId: 'mahabote.element', factType: 'element', value: nativeChart.birthDay.element },
      { factId: 'mahabote.house', factType: 'house', value: nativeChart.rulingHouse.name },
      { factId: 'mahabote.house_theme', factType: 'theme', value: nativeChart.rulingHouse.theme },
      { factId: 'mahabote.burmese_year', factType: 'year', value: String(nativeChart.burmeseYear) },
      { factId: 'mahabote.akar', factType: 'akar', value: String(nativeChart.akar) },
    ];
    const claims = [
      {
        claimId: 'claim-mahabote-character',
        domainId: 'personality',
        themeId: 'temperament',
        stance: nativeChart.birthDay.element.includes('화') || nativeChart.birthDay.element.includes('금') ? 'active' : 'reflective',
        summary: nativeChart.birthDay.character,
        evidenceFactIds: ['mahabote.day', 'mahabote.animal', 'mahabote.element'],
      },
      {
        claimId: 'claim-mahabote-house',
        domainId: 'life_path',
        themeId: 'destiny_focus',
        stance: nativeChart.rulingHouse.nature === 'favorable' ? 'prosperous' : 'growth_through_challenge',
        summary: `${nativeChart.rulingHouse.meaning}: ${nativeChart.rulingHouse.theme}`,
        evidenceFactIds: ['mahabote.house', 'mahabote.house_theme'],
      },
    ];
    const result = {
      schemaVersion: 'system-fact-result.v1',
      resultId: crypto.randomUUID(),
      systemId,
      status: profile.birthTime.status === 'unknown' ? 'partial' : 'ready',
      inputRef: profile.profileId,
      normalizedInputHash: sha256(canonical(profile)),
      policy: { id: descriptor.policyId, version: descriptor.policyVersion },
      engine: { id: 'gyeol-mahabote-core', version: descriptor.engineVersion },
      sourceAssets: [{ id: descriptor.sourceSetVersion }],
      systemResultSchemaVersion: descriptor.factSchemaVersion,
      facts,
      claims,
      nativeChart: { schemaVersion: 'mahabote-chart.v1', data: nativeChart },
      warnings: [],
      unsupportedStates: [],
      boundarySensitivity: [],
      calculatedAt: now.toISOString(),
    };
    return { eligibility, result: { ...result, fingerprint: fingerprint({ ...result, resultId: null, calculatedAt: null }) } };
  }

  if (systemId === 'horasat') {
    const raw = {
      date: profile.inputCalendar.date,
      time: profile.birthTime.localTime || '12:00',
      unknownTime: profile.birthTime.status === 'unknown',
    };
    const nativeChart = calculateHorasat(raw);
    const facts = [
      { factId: 'horasat.day', factType: 'weekday', value: nativeChart.birthDay.korean },
      { factId: 'horasat.planet', factType: 'planet', value: nativeChart.birthDay.planet },
      { factId: 'horasat.color', factType: 'color', value: nativeChart.birthDay.color },
      { factId: 'horasat.buddha', factType: 'buddha', value: nativeChart.birthDay.buddhaPosture },
      { factId: 'horasat.rasi', factType: 'rasi', value: nativeChart.rasi.name },
      { factId: 'horasat.rasi_element', factType: 'element', value: nativeChart.rasi.element },
    ];
    const claims = [
      {
        claimId: 'claim-horasat-character',
        domainId: 'personality',
        themeId: 'temperament',
        stance: nativeChart.birthDay.element.includes('화') || nativeChart.birthDay.element.includes('금') ? 'active' : 'reflective',
        summary: nativeChart.birthDay.character,
        evidenceFactIds: ['horasat.day', 'horasat.planet', 'horasat.buddha'],
      },
      {
        claimId: 'claim-horasat-rasi',
        domainId: 'life_path',
        themeId: 'destiny_focus',
        stance: 'prosperous',
        summary: `${nativeChart.rasi.name} (${nativeChart.rasi.keyword}): ${nativeChart.rasi.ruler}의 수호`,
        evidenceFactIds: ['horasat.rasi', 'horasat.rasi_element'],
      },
    ];
    const result = {
      schemaVersion: 'system-fact-result.v1',
      resultId: crypto.randomUUID(),
      systemId,
      status: profile.birthTime.status === 'unknown' ? 'partial' : 'ready',
      inputRef: profile.profileId,
      normalizedInputHash: sha256(canonical(profile)),
      policy: { id: descriptor.policyId, version: descriptor.policyVersion },
      engine: { id: 'gyeol-horasat-core', version: descriptor.engineVersion },
      sourceAssets: [{ id: descriptor.sourceSetVersion }],
      systemResultSchemaVersion: descriptor.factSchemaVersion,
      facts,
      claims,
      nativeChart: { schemaVersion: 'horasat-chart.v1', data: nativeChart },
      warnings: [],
      unsupportedStates: [],
      boundarySensitivity: [],
      calculatedAt: now.toISOString(),
    };
    return { eligibility, result: { ...result, fingerprint: fingerprint({ ...result, resultId: null, calculatedAt: null }) } };
  }

  if (systemId === 'tu-vi') {
    const raw = {
      date: profile.inputCalendar.date,
      time: profile.birthTime.localTime || '12:00',
      unknownTime: profile.birthTime.status === 'unknown',
    };
    const nativeChart = calculateTuVi(raw);
    const facts = [
      { factId: 'tu-vi.lunar_date', factType: 'date', value: nativeChart.lunarDate },
      { factId: 'tu-vi.menh_branch', factType: 'branch', value: nativeChart.menhPalace.branch.name },
      { factId: 'tu-vi.star', factType: 'star', value: nativeChart.menhPalace.primaryStar.name },
      { factId: 'tu-vi.star_nature', factType: 'nature', value: nativeChart.menhPalace.primaryStar.nature },
      { factId: 'tu-vi.cuc', factType: 'cuc', value: nativeChart.cuc.name },
    ];
    const claims = [
      {
        claimId: 'claim-tu-vi-character',
        domainId: 'personality',
        themeId: 'temperament',
        stance: nativeChart.menhPalace.primaryStar.element.includes('화') || nativeChart.menhPalace.primaryStar.element.includes('금') ? 'active' : 'reflective',
        summary: `${nativeChart.menhPalace.primaryStar.name}의 기운: ${nativeChart.menhPalace.primaryStar.keyword}`,
        evidenceFactIds: ['tu-vi.menh_branch', 'tu-vi.star'],
      },
      {
        claimId: 'claim-tu-vi-cuc',
        domainId: 'life_path',
        themeId: 'destiny_focus',
        stance: 'growth_through_challenge',
        summary: `${nativeChart.cuc.name}: ${nativeChart.cuc.character}`,
        evidenceFactIds: ['tu-vi.cuc'],
      },
    ];
    const result = {
      schemaVersion: 'system-fact-result.v1',
      resultId: crypto.randomUUID(),
      systemId,
      status: profile.birthTime.status === 'unknown' ? 'partial' : 'ready',
      inputRef: profile.profileId,
      normalizedInputHash: sha256(canonical(profile)),
      policy: { id: descriptor.policyId, version: descriptor.policyVersion },
      engine: { id: 'gyeol-tu-vi-core', version: descriptor.engineVersion },
      sourceAssets: [{ id: descriptor.sourceSetVersion }],
      systemResultSchemaVersion: descriptor.factSchemaVersion,
      facts,
      claims,
      nativeChart: { schemaVersion: 'tu-vi-chart.v1', data: nativeChart },
      warnings: [],
      unsupportedStates: [],
      boundarySensitivity: [],
      calculatedAt: now.toISOString(),
    };
    return { eligibility, result: { ...result, fingerprint: fingerprint({ ...result, resultId: null, calculatedAt: null }) } };
  }

  const raw = { calendar: 'solar', date: profile.inputCalendar.date, time: profile.birthTime.localTime || '12:00', unknownTime: profile.birthTime.status === 'unknown', place: profile.place.label || undefined, placeCode: profile.place.legacyKoreanPlaceCode || undefined };
  const nativeChart = calculateNatalChart(raw);
  const facts = factIds(nativeChart);
  const dayPillar = nativeChart.pillars[2] || nativeChart.pillars[0];
  const sajuElement = dayPillar?.element || '토';
  const claims = [
    {
      claimId: 'claim-saju-character',
      domainId: 'personality',
      themeId: 'temperament',
      stance: sajuElement === '화' || sajuElement === '금' ? 'active' : 'reflective',
      summary: `일간 ${dayPillar?.stem || ''}(${sajuElement})의 기운과 성향`,
      evidenceFactIds: ['saju.pillar.2'],
    },
  ];
  const result = { schemaVersion: 'system-fact-result.v1', resultId: crypto.randomUUID(), systemId, status: profile.birthTime.status === 'unknown' ? 'partial' : 'ready', inputRef: profile.profileId, normalizedInputHash: sha256(canonical(profile)), policy: { id: descriptor.policyId, version: descriptor.policyVersion }, engine: { id: descriptor.systemId === 'saju' ? descriptor.engineVersion && 'gyeol-natal-core' : descriptor.systemId, version: descriptor.engineVersion }, sourceAssets: [{ id: descriptor.sourceSetVersion }], systemResultSchemaVersion: descriptor.factSchemaVersion, facts, claims, nativeChart: { schemaVersion: nativeChart.schemaVersion, data: nativeChart }, warnings: nativeChart.warnings, unsupportedStates: nativeChart.unsupportedStates, boundarySensitivity: nativeChart.boundaryFlags.sensitivity ? [nativeChart.boundaryFlags.sensitivity] : [], calculatedAt: now.toISOString() };
  return { eligibility, result: { ...result, fingerprint: fingerprint({ ...result, resultId: null, calculatedAt: null }) } };
}

const claimKey = (claim) => `${claim.domainId || ''}|${claim.themeId || ''}`;
export function buildComparison({ requestedSystems = SYSTEM_IDS, results = [] } = {}, { now = new Date() } = {}) {
  const requested = [...new Set(requestedSystems)].filter((id) => SYSTEM_IDS.includes(id));
  const available = results.filter((result) => requested.includes(result.systemId) && (result.status === 'ready' || result.status === 'partial'));
  const sourceResults = available.map((result) => ({ systemId: result.systemId, resultId: result.resultId, fingerprint: result.fingerprint?.value || fingerprint({ ...result, resultId: null, calculatedAt: null }).value }));
  const groups = new Map();
  for (const result of available) for (const claim of (result.claims || result.comparisonClaims || [])) {
    if (!Array.isArray(claim.evidenceFactIds) || claim.evidenceFactIds.length === 0) continue;
    const facts = new Set((result.facts || []).map((fact) => fact.factId));
    if (claim.evidenceFactIds.some((factId) => !facts.has(factId))) throw Object.assign(new Error('comparison claim references a missing fact'), { code: 'FACT_VALIDATION_FAILED' });
    const key = claimKey(claim); const list = groups.get(key) || []; if (!list.some((item) => item.systemId === result.systemId)) list.push({ ...claim, systemId: result.systemId, resultId: result.resultId }); groups.set(key, list);
  }
  const sections = { common: [], different: [], unique: [], 'partial-unique': [] };
  for (const [key, claims] of groups) {
    const [domainId, themeId] = key.split('|'); const stances = new Set(claims.map((claim) => claim.stance));
    const classification = claims.length > 1 ? (stances.size === 1 ? 'common' : 'different') : (available.length === requested.length ? 'unique' : 'partial-unique');
    sections[classification].push({ itemId: sha256(`${classification}|${key}|${claims.map((claim) => `${claim.systemId}:${claim.claimId}`).sort().join(',')}`).slice(0, 32), classification, domainId, themeId, participatingClaims: claims.sort((a, b) => a.systemId.localeCompare(b.systemId)).map(({ systemId, claimId, stance }) => ({ systemId, claimId, stance })), titleKey: `comparison.${themeId}.${classification}.title`, summaryTemplateKey: `comparison.${classification}`, displayPriority: 50, coverage: classification === 'partial-unique' ? 'partial' : 'complete' });
  }
  for (const section of Object.values(sections)) section.sort((a, b) => `${a.domainId}|${a.themeId}|${a.itemId}`.localeCompare(`${b.domainId}|${b.themeId}|${b.itemId}`));
  const status = available.length === 0 ? 'failed' : available.length === requested.length ? 'complete' : 'partial';
  return { schemaVersion: 'comparison-bundle.v1', comparisonVersion: COMPARISON_VERSION, requestedSystems: requested, sourceResults, sourceFingerprintSetHash: sha256(canonical(sourceResults.slice().sort((a, b) => a.systemId.localeCompare(b.systemId)))), status, sections, comparisonFingerprint: sha256(canonical({ requestedSystems: requested, sourceResults, sections, comparisonVersion: COMPARISON_VERSION })), createdAt: now.toISOString() };
}

export function listPolicies() { return SYSTEM_REGISTRY.map((descriptor) => ({ ...descriptor })); }
