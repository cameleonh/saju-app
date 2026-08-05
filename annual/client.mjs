const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

export function buildAnnualRequest(chart, targetYear) {
  if (!chart || chart.mode === 'couple' || !Array.isArray(chart.pillars)) throw new Error('annual reading requires one natal chart');
  const year = Number(targetYear);
  if (!Number.isInteger(year) || year < 2024 || year > 2026) throw new Error('targetYear must be an integer from 2024 to 2026');
  for (const field of ['id', 'version', 'engine', 'engineVersion']) {
    if (typeof chart.policy?.[field] !== 'string' || !chart.policy[field]) throw new Error(`chart.policy.${field} is required`);
  }
  const branches = chart.pillars.map(({ branch }) => branch).filter((branch) => branch && branch !== '?');
  const request = {
    targetYear: year,
    natal: { dayStem: chart.pillars[2]?.stem, monthBranch: chart.pillars[1]?.branch, branches, unknownTime: Boolean(chart.input?.unknownTime) },
    chartPolicy: chart.policy || null,
  };
  if (chart.input && chart.input.date && chart.pillars[0]?.stem && chart.pillars[1]?.stem && chart.pillars[1]?.branch) {
    request.natal.input = { date: chart.input.date, gender: chart.input.gender || 'unset' };
    request.daewoon = {
      date: chart.input.date,
      time: chart.input.time || (chart.input.unknownTime ? '12:00' : '12:00'),
      unknownTime: Boolean(chart.input.unknownTime),
      gender: chart.input.gender || 'female',
      yearStem: chart.pillars[0].stem,
      monthStem: chart.pillars[1].stem,
      monthBranch: chart.pillars[1].branch,
    };
  }
  return request;
}

export async function requestAnnualReading(chart, targetYear, endpoint = '/v1/annual-readings', fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
  const response = await fetchImpl(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(buildAnnualRequest(chart, targetYear)) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `annual reading rejected: ${response.status}`);
  return result;
}

export function annualSubmissionFields(annual) {
  if (!annual || annual.schemaVersion !== 'annual-reading.v1') return {};
  return { readingScope: 'annual', targetYear: annual.targetYear, annualResult: annual };
}

export function privacySafeAnnualExport(annual) {
  if (!annual || annual.schemaVersion !== 'annual-reading.v1') throw new Error('annual reading is required');
  return {
    schemaVersion: annual.schemaVersion, readingScope: annual.readingScope, targetYear: annual.targetYear, yearPillar: annual.yearPillar,
    effectiveRange: annual.effectiveRange, timezone: annual.timezone, boundaryFlags: annual.boundaryFlags,
    calculationPolicy: annual.calculationPolicy, chartPolicy: annual.chartPolicy,
    interpretationProfile: annual.interpretationProfile, ruleSet: annual.ruleSet, facts: annual.facts, cards: annual.cards,
    monthlyFlow: annual.monthlyFlow, suppressedRules: annual.suppressedRules,
    unsupportedStates: annual.unsupportedStates, claimTrace: annual.claimTrace, contentHash: annual.contentHash,
    privacy: { rawBirthInputIncluded: false, exactLocationIncluded: false, recordIdentifiersIncluded: false, consentMetadataIncluded: false },
  };
}

function formatRange(range) {
  if (!range || !range.start || !range.end) return '범위 정보 없음';
  const formatter = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `${formatter.format(new Date(range.start))}부터 ${formatter.format(new Date(range.end))} 직전`;
}

function cardMarkup(card, index, activeIndex) {
  const active = index === activeIndex;
  return `<article class="annual-card" data-annual-card="${index}" data-active="${active}" tabindex="-1" aria-current="${active}" aria-labelledby="annual-card-title-${index}"><div class="annual-card-kicker">${index + 1} / 8 · ${escapeHtml(card.cardType)}</div><h3 id="annual-card-title-${index}">${escapeHtml(card.title)}</h3><p class="annual-card-summary">${escapeHtml(card.summary)}</p><div class="annual-keywords">${card.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join('')}</div><ul>${card.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul><div class="annual-card-action"><strong>해볼 일</strong><p>${escapeHtml(card.action)}</p></div><div class="annual-card-watch"><strong>주의</strong><p>${escapeHtml(card.watch)}</p></div><div class="evidence-row">${card.evidence.map((id) => `<button class="evidence-chip" data-action="annual-evidence" data-fact="${escapeHtml(id)}">${escapeHtml(id)}</button>`).join('')}</div></article>`;
}

function documentCardMarkup(card, index) {
  return `<li><article><h4>${index + 1}. ${escapeHtml(card.title)}</h4><p>${escapeHtml(card.summary)}</p><ul>${card.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul><p><strong>해볼 일:</strong> ${escapeHtml(card.action)}</p><p><strong>주의:</strong> ${escapeHtml(card.watch)}</p><p class="mono">근거: ${card.evidence.map(escapeHtml).join(' · ')}</p></article></li>`;
}

function monthlyMarkup(month) {
  if (month.status === 'unsupported') return `<li><strong>${escapeHtml(month.label)}</strong><p>${escapeHtml(month.unsupportedState?.reason || '경계 자료를 지원하지 않아 월운 해석을 만들지 않았습니다.')}</p></li>`;
  return `<li><article><div class="monthly-head"><strong>${escapeHtml(month.label)} · ${escapeHtml(month.pillar)}</strong><span>${escapeHtml(formatRange(month.effectiveRange))}</span></div><p><strong>상태:</strong> ${escapeHtml(month.status)} · ${month.boundarySensitive ? '절기 경계 주의' : '일반 범위'}</p><p>${escapeHtml(month.theme)}</p><p><strong>활용:</strong> ${escapeHtml(month.use)}</p><p><strong>주의:</strong> ${escapeHtml(month.watch)}</p><div class="evidence-row">${month.evidence.map((id) => `<button class="evidence-chip" data-action="annual-evidence" data-fact="${escapeHtml(id)}">${escapeHtml(id)}</button>`).join('')}</div></article></li>`;
}

function domainMarkup(domain) {
  const points = (domain.points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  return `<article class="reading-domain-card" data-domain-key="${escapeHtml(domain.domain_key)}"><h4>${escapeHtml(domain.domain_label)}</h4><ol>${points}</ol>${domain.closing ? `<p class="domain-closing">${escapeHtml(domain.closing)}</p>` : ''}</article>`;
}

export function renderAnnualReading(annual, { activeIndex = 0, activeFact = '', loading = false, error = '' } = {}) {
  if (loading) return '<section class="panel annual-reading" aria-live="polite"><p>연운의 입춘 경계와 카드 근거를 계산하고 있습니다.</p></section>';
  if (error) return `<section class="notice amber annual-reading" role="alert"><h2>연운 카드를 만들지 못했습니다</h2><p>${escapeHtml(error)}</p></section>`;
  if (!annual) return '';
  const index = Math.max(0, Math.min(Number(activeIndex) || 0, annual.cards.length - 1));
  const fact = annual.facts.find(({ id }) => id === activeFact);
  const domains = Array.isArray(annual.domains) && annual.domains.length > 0 ? `<details class="annual-domains"><summary>정밀 풀이 13항목 보기</summary><p>마음가짐, 인간관계, 건강, 직업, 가족, 애정, 재물, 패션, 날씨, 물품, 피할 기운, 이로운 기운, 해야 할 일을 차례로 살펴보세요.</p><div class="reading-domain-grid">${annual.domains.map(domainMarkup).join('')}</div></details>` : '';
  return `<section class="panel annual-reading" aria-labelledby="annual-reading-title"><div class="section-heading annual-heading"><div><div class="eyebrow">입춘 기준 연운 카드</div><h2 id="annual-reading-title">${escapeHtml(annual.targetYear)}년 ${escapeHtml(annual.yearPillar)}의 흐름</h2></div><p>${escapeHtml(formatRange(annual.effectiveRange))}</p></div><p class="annual-basis">해석 기준: 자평명리 파생 일간·월령·십신 관계. 격국·용신·조후와 연운 지장간 활성화는 이 버전에서 분류하지 않습니다.</p><div class="annual-controls"><button class="button secondary small" data-action="annual-prev" ${index === 0 ? 'disabled' : ''}>이전 카드</button><span role="status" aria-live="polite">${index + 1} / ${annual.cards.length}</span><button class="button secondary small" data-action="annual-next" ${index === annual.cards.length - 1 ? 'disabled' : ''}>다음 카드</button><button class="button ghost small" data-action="annual-export">연운 JSON</button><button class="button ghost small" data-action="annual-card-png">카드 PNG</button><button class="button ghost small" data-action="annual-print">인쇄·PDF</button></div><div class="annual-card-grid">${annual.cards.map((card, cardIndex) => cardMarkup(card, cardIndex, index)).join('')}</div>${fact ? `<div class="fact-detail annual-fact" role="status"><strong>${escapeHtml(fact.label)} · ${escapeHtml(fact.status)}</strong><p>${escapeHtml(fact.detail)}</p><span class="mono">${escapeHtml(fact.id)} · ${escapeHtml(fact.source?.id)}@${escapeHtml(fact.source?.version)}</span></div>` : ''}${domains}<details class="annual-document-view"><summary>문서 형태로 8장 전체 보기</summary><ol>${annual.cards.map(documentCardMarkup).join('')}</ol></details><details class="monthly-flow"><summary>월별 흐름 12개 보기 · 기본 카드와 분리</summary><p>각 절기월의 시작과 끝을 확인하세요. 월운도 사건 예측이 아니라 행동 점검용 전통 해석입니다.</p><ol>${annual.monthlyFlow.map(monthlyMarkup).join('')}</ol></details><p class="annual-hash mono">${escapeHtml(annual.calculationPolicy.id)}@${escapeHtml(annual.calculationPolicy.version)} · ${escapeHtml(annual.interpretationProfile.id)}@${escapeHtml(annual.interpretationProfile.version)} · ${escapeHtml(annual.contentHash.slice(0, 12))}</p></section>`;
}
