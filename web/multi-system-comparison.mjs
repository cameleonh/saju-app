// web/multi-system-comparison.mjs
// 아시아 4대 전통 점성학 비교(한국 사주, 미얀마 마하보테, 태국 호라삿, 베트남 뜨비) 프레젠테이션 모듈.

export const COMPARISON_SYSTEMS = Object.freeze([
  { systemId: 'saju', label: '한국 사주', nativeLabel: 'Four Pillars', policyId: 'KR-CIVIL-1.0', flag: '🇰🇷' },
  { systemId: 'mahabote', label: '미얀마 마하보테', nativeLabel: 'Mahabote', policyId: 'MM-MAHABOTE-1.0', flag: '🇲🇲' },
  { systemId: 'horasat', label: '태국 호라삿', nativeLabel: 'Horasat', policyId: 'TH-HORASAT-1.0', flag: '🇹🇭' },
  { systemId: 'tu-vi', label: '베트남 뜨비', nativeLabel: 'Tử Vi', policyId: 'VN-TUVI-1.0', flag: '🇻🇳' },
]);

const STATE_LABELS = Object.freeze({
  ready: '계산 가능',
  partial: '부분 결과',
  'needs-input': '추가 입력 필요',
  unsupported: '지원되지 않음',
  'policy-blocked': '정책 준비 중',
});

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function sajuEligibility(profile) {
  if (!String(profile?.date || '').trim()) return { state: 'needs-input', reason: '출생일을 입력하면 사주 명식을 계산할 수 있어요.' };
  if (!validDate(profile.date)) return { state: 'unsupported', reason: '출생일 형식을 확인해 주세요.' };
  if (profile.unknownTime === true) return { state: 'partial', reason: '출생 시각을 몰라도 년주·월주·일주를 계산합니다.' };
  return { state: 'ready', reason: '현재 입력으로 한국 사주 명식을 계산할 수 있어요.' };
}

function mahaboteEligibility(profile) {
  if (!String(profile?.date || '').trim()) return { state: 'needs-input', reason: '출생일을 입력하면 미얀마 마하보테를 계산할 수 있어요.' };
  if (!validDate(profile.date)) return { state: 'unsupported', reason: '출생일 형식을 확인해 주세요.' };
  if (profile.unknownTime === true) return { state: 'partial', reason: '출생 시각을 모르면 수요일 오전/오후 구분 없이 기본 요일로 계산해요.' };
  return { state: 'ready', reason: '현재 입력으로 미얀마 마하보테(8요일 7하우스)를 계산할 수 있어요.' };
}

function horasatEligibility(profile) {
  if (!String(profile?.date || '').trim()) return { state: 'needs-input', reason: '출생일을 입력하면 태국 호라삿을 계산할 수 있어요.' };
  if (!validDate(profile.date)) return { state: 'unsupported', reason: '출생일 형식을 확인해 주세요.' };
  if (profile.unknownTime === true) return { state: 'partial', reason: '출생 시각을 모르면 주간 수요일 기준으로 기본 계산해요.' };
  return { state: 'ready', reason: '현재 입력으로 태국 호라삿(12라시 8수호불)을 계산할 수 있어요.' };
}

function tuViEligibility(profile) {
  if (!String(profile?.date || '').trim()) return { state: 'needs-input', reason: '출생일을 입력하면 베트남 뜨비를 계산할 수 있어요.' };
  if (!validDate(profile.date)) return { state: 'unsupported', reason: '출생일 형식을 확인해 주세요.' };
  if (profile.unknownTime === true) return { state: 'partial', reason: '출생 시각 미상 시 정오(오시) 기준으로 명궁을 산출해요.' };
  return { state: 'ready', reason: '현재 입력으로 베트남 뜨비(12궁 5국 주성)를 계산할 수 있어요.' };
}

export function getComparisonEligibility(profile = {}) {
  const saju = sajuEligibility(profile);
  const mahabote = mahaboteEligibility(profile);
  const horasat = horasatEligibility(profile);
  const tuVi = tuViEligibility(profile);

  return COMPARISON_SYSTEMS.map((system) => {
    let result = { state: 'ready', reason: '계산 가능' };
    if (system.systemId === 'saju') result = saju;
    if (system.systemId === 'mahabote') result = mahabote;
    if (system.systemId === 'horasat') result = horasat;
    if (system.systemId === 'tu-vi') result = tuVi;
    return {
      ...system,
      ...result,
      systemLabel: system.label,
      label: STATE_LABELS[result.state] || result.state,
      canCalculate: result.state === 'ready' || result.state === 'partial',
    };
  });
}

export function renderComparisonEligibility(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  return `
    <section class="comparison-status panel" aria-labelledby="comparison-status-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow">아시아 4대 전통 점성학 비교</div>
          <h2 id="comparison-status-title">네 전통 체계와 계산 상태</h2>
        </div>
        <p class="section-desc">동일한 생년월일시를 기준으로 한국·미얀마·태국·베트남 전통 점성학 체계의 계산 결과를 나란히 대조합니다.</p>
      </div>
      <div class="comparison-system-grid" role="list">
        ${safeEntries.map((entry) => `
          <article class="comparison-system-card state-${escapeHtml(entry.state)}" data-system-id="${escapeHtml(entry.systemId)}" role="listitem">
            <div class="comparison-system-card-top">
              <span class="comparison-system-name">${escapeHtml(entry.flag || '')} ${escapeHtml(entry.systemLabel || entry.systemId)}</span>
              <span class="comparison-state badge badge-ready" data-state="${escapeHtml(entry.state)}">
                ${escapeHtml(entry.label)}
              </span>
            </div>
            <div class="comparison-native-label">${escapeHtml(entry.nativeLabel || '')}</div>
            <p class="comparison-reason">${escapeHtml(entry.reason)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

/**
 * 아시아 4대 전통(한국 사주, 미얀마 마하보테, 태국 호라삿, 베트남 뜨비) 통합 비교 패널 렌더링.
 */
export function renderFourSystemComparison(sajuChart, mahaboteChart, horasatChart, tuViChart) {
  if (!sajuChart) return '';

  const dayPillar = sajuChart.pillars?.[2] || sajuChart.pillars?.[0] || { text: '갑자', stem: '甲', element: '목' };

  return `
    <section class="panel comparison-detail-panel" aria-labelledby="comparison-detail-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow">동아시아 & 동남아 4대 전통 심층 대조</div>
          <h2 id="comparison-detail-title">하나의 생년월일, 네 개의 전통이 바라본 나</h2>
        </div>
        <p class="section-desc">한국의 60갑자 사주, 미얀마의 8요일 마하보테, 태국의 수호불 호라삿, 베트남의 12궁 뜨비가 전하는 종합 통찰입니다. <strong>배치 산법은 원전·독립 구현체와 대조 검증했으며(마하보테 dirah 산법·호라삿 항성황도 표·뜨비 tuvi-neo 패리티), 연운 해석은 참고용(β)입니다.</strong></p>
      </div>

      <div class="comparison-4grid">
        <!-- 1. 한국 사주 -->
        <div class="comparison-side-card saju-side">
          <div class="side-header">
            <span class="side-flag">🇰🇷</span>
            <div>
              <h3>한국 사주 (Four Pillars)</h3>
              <span class="side-sub">시간과 음양오행의 순환</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">나를 대표하는 기운 (일주)</div>
            <div class="highlight-value">${escapeHtml(dayPillar.text || '')} (${escapeHtml(dayPillar.element || '')})</div>
          </div>
          <ul class="side-details">
            <li><strong>본질 성향:</strong> 일간 ${escapeHtml(dayPillar.stem || '')}(${escapeHtml(dayPillar.element || '')})의 성질을 중심으로 삶을 설계</li>
            <li><strong>핵심 원리:</strong> 사주 4기둥의 오행 상생상극과 10년 대운의 시간적 흐름</li>
          </ul>
        </div>

        <!-- 2. 미얀마 마하보테 -->
        ${mahaboteChart ? `
        <div class="comparison-side-card mahabote-side">
          <div class="side-header">
            <span class="side-flag">🇲🇲</span>
            <div>
              <h3>미얀마 마하보테 (Mahabote)</h3>
              <span class="side-sub">8요일과 7하우스 수리역학</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">탄생 요일 & 수호 동물</div>
            <div class="highlight-value">${escapeHtml(mahaboteChart.birthDay?.korean || '')} ${escapeHtml(mahaboteChart.birthDay?.animal || '')}</div>
          </div>
          <ul class="side-details">
            <li><strong>수호 방위:</strong> ${escapeHtml(mahaboteChart.birthDay?.direction || '')}</li>
            <li><strong>인생의 핵심 자리:</strong> ${escapeHtml(mahaboteChart.rulingHouse?.name || '')} (${escapeHtml(mahaboteChart.rulingHouse?.meaning || '')})</li>
            <li><strong>미얀마력(BE):</strong> ${escapeHtml(mahaboteChart.burmeseYear || '')}년 (Akar: ${escapeHtml(mahaboteChart.akar || '')})</li>
          </ul>
        </div>
        ` : ''}

        <!-- 3. 태국 호라삿 -->
        ${horasatChart ? `
        <div class="comparison-side-card horasat-side">
          <div class="side-header">
            <span class="side-flag">🇹🇭</span>
            <div>
              <h3>태국 호라삿 (Horasat)</h3>
              <span class="side-sub">8대 수호불과 황도 12라시</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">황도 라시 & 수호 색상</div>
            <div class="highlight-value">${escapeHtml(horasatChart.rasi?.name || '')} · ${escapeHtml(horasatChart.birthDay?.color || '')}</div>
          </div>
          <ul class="side-details">
            <li><strong>수호불:</strong> ${escapeHtml(horasatChart.birthDay?.buddhaPosture || '')}</li>
            <li><strong>수호 행성:</strong> ${escapeHtml(horasatChart.birthDay?.planet || '')} (${escapeHtml(horasatChart.birthDay?.element || '')})</li>
            <li><strong>라시 키워드:</strong> ${escapeHtml(horasatChart.rasi?.keyword || '')} (지배성: ${escapeHtml(horasatChart.rasi?.ruler || '')})</li>
          </ul>
        </div>
        ` : ''}

        <!-- 4. 베트남 뜨비 -->
        ${tuViChart ? `
        <div class="comparison-side-card tuvi-side">
          <div class="side-header">
            <span class="side-flag">🇻🇳</span>
            <div>
              <h3>베트남 뜨비 (Tử Vi)</h3>
              <span class="side-sub">12궁과 14주성 별자리 체계</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">명궁(Mệnh) & 대표 주성</div>
            <div class="highlight-value">${escapeHtml(tuViChart.menhPalace?.branch?.name || '')}궁 · ${escapeHtml(tuViChart.menhPalace?.primaryStar?.name || '')}</div>
          </div>
          <ul class="side-details">
            <li><strong>음력 기준:</strong> ${escapeHtml(tuViChart.lunarDate || '')}</li>
            <li><strong>인생의 국(Cục):</strong> ${escapeHtml(tuViChart.cuc?.name || '')} (${escapeHtml(tuViChart.cuc?.character || '')})</li>
            <li><strong>주성 역량:</strong> ${escapeHtml(tuViChart.menhPalace?.primaryStar?.keyword || '')}</li>
            ${tuViChart.tuHoa ? `<li><strong>사화(四化):</strong> ${escapeHtml(tuViChart.yearStem?.hanja || '')}년간 — ${escapeHtml(tuViChart.tuHoa.loc?.host || '')} 祿 · ${escapeHtml(tuViChart.tuHoa.quyen?.host || '')} 權 · ${escapeHtml(tuViChart.tuHoa.khoa?.host || '')} 科 · ${escapeHtml(tuViChart.tuHoa.ky?.host || '')} 忌</li>` : ''}
            ${tuViChart.menhMinorStars?.length ? `<li><strong>명궁 잡성:</strong> ${escapeHtml(tuViChart.menhMinorStars.map((s) => `${s.name.split(' (')[0]}(${s.nature})`).join(' · '))}</li>` : ''}
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- 종합 비교 통찰 -->
      <div class="comparison-insights-grid">
        <div class="insight-box common">
          <div class="insight-title">🌿 4대 전통이 공통으로 가리키는 나의 기질</div>
          <p>사주의 <strong>일간(${escapeHtml(dayPillar.element)})</strong>, 마하보테의 <strong>${escapeHtml(mahaboteChart?.birthDay?.animal || '')}</strong>, 호라삿의 <strong>${escapeHtml(horasatChart?.birthDay?.planet || '')}</strong>, 뜨비의 <strong>${escapeHtml(tuViChart?.menhPalace?.primaryStar?.name || '')}</strong>를 함께 놓고 읽어보는 관점입니다. 전통마다 쓰는 입력과 규칙이 다르므로 이 해석은 참고용으로만 제공합니다.</p>
        </div>

        <div class="insight-box different">
          <div class="insight-title">⚡ 전통별 독창적인 관점</div>
          <p>• <strong>한국 사주:</strong> 10년 대운과 세운을 통한 <em>'시간과 계절의 순환'</em><br>
          • <strong>미얀마 마하보테:</strong> 7개 하우스와 8요일을 통한 <em>'공간적 방위와 인생 테마'</em><br>
          • <strong>태국 호라삿:</strong> 수호불과 라시를 통한 <em>'일상의 수호 색상과 마음가짐'</em><br>
          • <strong>베트남 뜨비:</strong> 12개 궁을 통한 <em>'가정·직업·재물·인간관계의 정밀 지도'</em></p>
        </div>
      </div>
    </section>
  `;
}

/**
 * 4대 전통 당해 연도(targetYear) 연운 심층 대조 패널 렌더링.
 */
export function renderFourSystemAnnualComparison(sajuAnnual, mahaboteAnnual, horasatAnnual, tuViAnnual, targetYear = 2026) {
  if (!sajuAnnual && !mahaboteAnnual) return '';

  const sajuLead = sajuAnnual?.cards?.[0]?.lead || '한 해의 계절과 기운이 조화롭게 순환합니다.';
  const sajuTheme = sajuAnnual?.cards?.[0]?.title || `${targetYear}년 세운의 흐름`;
  const sajuAdvice = sajuAnnual?.cards?.[0]?.practice || '무리한 확장보다 내실 있는 실천에 집중하세요.';

  return `
    <section class="panel comparison-detail-panel" aria-labelledby="annual-comparison-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow">${targetYear}년 연운(年運) 4대 전통 대조</div>
          <h2 id="annual-comparison-title">${targetYear}년, 네 개의 전통이 바라본 올해의 운</h2>
        </div>
        <p class="section-desc">한국의 세운 십신, 미얀마의 당해 하우스 주기, 태국의 목성 입궁 운, 베트남의 유년 세궁이 예고하는 ${targetYear}년 종합 운세입니다. <strong>한국 사주 외 세 전통의 연운 산출은 간이 모형(β)입니다.</strong></p>
      </div>

      <div class="comparison-4grid">
        <!-- 1. 한국 사주 연운 -->
        <div class="comparison-side-card saju-side">
          <div class="side-header">
            <span class="side-flag">🇰🇷</span>
            <div>
              <h3>한국 사주 ${targetYear}년</h3>
              <span class="side-sub">세운 천간·지지와 십신 흐름</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">올해의 핵심 테마</div>
            <div class="highlight-value">${escapeHtml(sajuTheme)}</div>
          </div>
          <ul class="side-details">
            <li><strong>주요 흐름:</strong> ${escapeHtml(sajuLead)}</li>
            <li><strong>행동 조언:</strong> ${escapeHtml(sajuAdvice)}</li>
          </ul>
        </div>

        <!-- 2. 미얀마 마하보테 연운 -->
        ${mahaboteAnnual ? `
        <div class="comparison-side-card mahabote-side">
          <div class="side-header">
            <span class="side-flag">🇲🇲</span>
            <div>
              <h3>미얀마 마하보테 연운</h3>
              <span class="side-sub">만 ${mahaboteAnnual.age}세 거주 하우스</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">올해 머무는 자리</div>
            <div class="highlight-value">${escapeHtml(mahaboteAnnual.yearlyHouse?.name || '')} (${escapeHtml(mahaboteAnnual.yearlyTheme || '')})</div>
          </div>
          <ul class="side-details">
            <li><strong>핵심 집중:</strong> ${escapeHtml(mahaboteAnnual.focusKeywords || '')}</li>
            ${mahaboteAnnual.planetLine ? `<li><strong>하우스의 주인:</strong> ${escapeHtml(mahaboteAnnual.planetLine)}</li>` : ''}
            <li><strong>마하보테 조언:</strong> ${escapeHtml(mahaboteAnnual.yearlyAdvice || '')}</li>
          </ul>
        </div>
        ` : ''}

        <!-- 3. 태국 호라삿 연운 -->
        ${horasatAnnual ? `
        <div class="comparison-side-card horasat-side">
          <div class="side-header">
            <span class="side-flag">🇹🇭</span>
            <div>
              <h3>태국 호라삿 연운</h3>
              <span class="side-sub">목성(Jupiter)의 황도 입궁</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">올해의 목성 기운</div>
            <div class="highlight-value">${escapeHtml(horasatAnnual.annualTone || '')}</div>
          </div>
          <ul class="side-details">
            <li><strong>목성의 자리:</strong> 나의 ${escapeHtml(horasatAnnual.natalRasi?.name || '')}에서 볼 때 ${escapeHtml(horasatAnnual.jupiterHouse || '')}</li>
            <li><strong>성취 영역:</strong> ${escapeHtml(horasatAnnual.annualFocus || '')}</li>
            <li><strong>실천 조언:</strong> ${escapeHtml(horasatAnnual.annualPractice || '')}</li>
            <li><strong>행운의 색상:</strong> ${escapeHtml(horasatAnnual.luckyColor || '')}</li>
          </ul>
        </div>
        ` : ''}

        <!-- 4. 베트남 뜨비 유년운 -->
        ${tuViAnnual ? `
        <div class="comparison-side-card tuvi-side">
          <div class="side-header">
            <span class="side-flag">🇻🇳</span>
            <div>
              <h3>베트남 뜨비 유년운</h3>
              <span class="side-sub">유년 세궁(Lưu Niên) 활성화</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">올해 활성화되는 궁</div>
            <div class="highlight-value">${escapeHtml(tuViAnnual.activePalace?.name || '')}</div>
          </div>
          <ul class="side-details">
            ${tuViAnnual.annualTheme ? `<li><strong>올해의 테마:</strong> ${escapeHtml(tuViAnnual.annualTheme)}</li>` : ''}
            ${tuViAnnual.annualLead ? `<li><strong>흐름 읽기:</strong> ${escapeHtml(tuViAnnual.annualLead)}</li>` : ''}
            ${tuViAnnual.daiHan ? `<li><strong>대한(大限):</strong> ${escapeHtml(tuViAnnual.daiHan.ageRange || '')} ${escapeHtml(tuViAnnual.daiHan.branch?.name || '')} ${escapeHtml(tuViAnnual.daiHan.palace?.name || '')} · ${escapeHtml(tuViAnnual.daiHan.direction || '')}</li>` : ''}
            ${tuViAnnual.tieuHan ? `<li><strong>소한(小限):</strong> ${escapeHtml(String(tuViAnnual.nominalAge || ''))}세 ${escapeHtml(tuViAnnual.tieuHan.branch?.name || '')} ${escapeHtml(tuViAnnual.tieuHan.palace?.name || '')}</li>` : ''}
            <li><strong>뜨비 조언:</strong> ${escapeHtml(tuViAnnual.annualPractice || tuViAnnual.advice || '')}</li>
          </ul>
        </div>
        ` : ''}
      </div>

      <div class="comparison-insights-grid">
        <div class="insight-box unique">
          <div class="insight-title">✦ ${targetYear}년 4대 전통 종합 실천 가이드</div>
          <p>한국의 사주가 <em>'시간의 타이밍'</em>을 알려주고, 미얀마의 마하보테가 <em>'올해 집중할 영역'</em>을 짚어주며, 태국의 호라삿이 <em>'행운의 일상 색상과 마음가짐'</em>을 비추고, 베트남의 뜨비가 <em>'활성화될 삶의 무대'</em>를 안내합니다. 네 가지 지혜를 조화롭게 융합하여 주도적인 한 해를 설계하세요.</p>
        </div>
      </div>
    </section>
  `;
}

/**
 * 4대 전통 오늘의 운세(Daily) 심층 대조 패널 렌더링.
 */
export function renderFourSystemDailyComparison(sajuDaily, mahaboteDaily, horasatDaily, tuViDaily, targetDateStr = '') {
  const sajuLead = sajuDaily?.sections?.[0]?.lead || '오늘의 일진과 기운이 조화롭게 흐릅니다.';
  const sajuTitle = sajuDaily?.sections?.[0]?.title || '오늘의 기운 흐름';

  return `
    <section class="panel comparison-detail-panel" aria-labelledby="daily-comparison-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow">오늘의 운세 4대 전통 대조</div>
          <h2 id="daily-comparison-title">오늘, 네 개의 전통이 비추는 하루의 기운</h2>
        </div>
        <p class="section-desc">한국의 일진 십신, 미얀마의 당일 요일 수호령, 태국의 일일 지배 행성, 베트남의 음력 활성화 궁이 전하는 하루 지침입니다.</p>
      </div>

      <div class="comparison-4grid">
        <!-- 1. 한국 사주 일운 -->
        <div class="comparison-side-card saju-side">
          <div class="side-header">
            <span class="side-flag">🇰🇷</span>
            <div>
              <h3>한국 사주 오늘의 운</h3>
              <span class="side-sub">일진 십신과 오행의 흐름</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">오늘의 테마</div>
            <div class="highlight-value">${escapeHtml(sajuTitle)}</div>
          </div>
          <ul class="side-details">
            <li><strong>주요 흐름:</strong> ${escapeHtml(sajuLead)}</li>
          </ul>
        </div>

        <!-- 2. 미얀마 마하보테 일운 -->
        ${mahaboteDaily ? `
        <div class="comparison-side-card mahabote-side">
          <div class="side-header">
            <span class="side-flag">🇲🇲</span>
            <div>
              <h3>미얀마 마하보테 일운</h3>
              <span class="side-sub">${escapeHtml(mahaboteDaily.todayDay?.korean || '')} 수호 동물 교감</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">오늘의 수호 기운</div>
            <div class="highlight-value">${escapeHtml(mahaboteDaily.dailyTheme)}</div>
          </div>
          <ul class="side-details">
            <li><strong>추천 방향:</strong> ${escapeHtml(mahaboteDaily.favorableDirection)}</li>
            <li><strong>마하보테 조언:</strong> ${escapeHtml(mahaboteDaily.dailyAdvice)}</li>
          </ul>
        </div>
        ` : ''}

        <!-- 3. 태국 호라삿 일운 -->
        ${horasatDaily ? `
        <div class="comparison-side-card horasat-side">
          <div class="side-header">
            <span class="side-flag">🇹🇭</span>
            <div>
              <h3>태국 호라삿 일운</h3>
              <span class="side-sub">오늘의 지배성: ${escapeHtml(horasatDaily.todayRuler)}</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">오늘 행운의 색상</div>
            <div class="highlight-value">${escapeHtml(horasatDaily.todayColor)}</div>
          </div>
          <ul class="side-details">
            <li><strong>오늘의 테마:</strong> ${escapeHtml(horasatDaily.todayTheme)}</li>
            <li><strong>호라삿 조언:</strong> ${escapeHtml(horasatDaily.advice)}</li>
          </ul>
        </div>
        ` : ''}

        <!-- 4. 베트남 뜨비 일운 -->
        ${tuViDaily ? `
        <div class="comparison-side-card tuvi-side">
          <div class="side-header">
            <span class="side-flag">🇻🇳</span>
            <div>
              <h3>베트남 뜨비 일운</h3>
              <span class="side-sub">오늘 활성화 궁(Nhật Vận)</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">오늘의 중심 궁</div>
            <div class="highlight-value">${escapeHtml(tuViDaily.activePalace?.name || '')}</div>
          </div>
          <ul class="side-details">
            <li><strong>영역 포커스:</strong> ${escapeHtml(tuViDaily.dailyFocus)}</li>
            <li><strong>뜨비 조언:</strong> ${escapeHtml(tuViDaily.advice)}</li>
          </ul>
        </div>
        ` : ''}
      </div>
    </section>
  `;
}

export const comparisonStateLabel = (state) => STATE_LABELS[state] || '상태 확인 필요';


