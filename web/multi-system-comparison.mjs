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
        <p class="section-desc">한국의 60갑자 사주, 미얀마의 8요일 마하보테, 태국의 수호불 호라삿, 베트남의 12궁 뜨비가 전하는 종합 통찰입니다.</p>
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
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- 종합 비교 통찰 -->
      <div class="comparison-insights-grid">
        <div class="insight-box common">
          <div class="insight-title">🌿 4대 전통이 공통으로 가리키는 나의 기질</div>
          <p>사주의 <strong>일간(${escapeHtml(dayPillar.element)})</strong>, 마하보테의 <strong>${escapeHtml(mahaboteChart?.birthDay?.animal || '')}</strong>, 호라삿의 <strong>${escapeHtml(horasatChart?.birthDay?.planet || '')}</strong>, 뜨비의 <strong>${escapeHtml(tuViChart?.menhPalace?.primaryStar?.name || '')}</strong>는 모두 당신의 타고난 지혜와 능동적인 추진력이 삶의 핵심 무기임을 일치되게 증명합니다.</p>
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

export const comparisonStateLabel = (state) => STATE_LABELS[state] || '상태 확인 필요';
