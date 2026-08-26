// web/couple-compatibility.mjs
// 아시아 4대 전통 커플 궁합 프레젠테이션 렌더러

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

/**
 * 4대 전통 커플 궁합 UI 렌더링
 * @param {object} compResult calculateFourSystemCompatibility 결과
 * @returns {string} HTML 마크업
 */
export function renderFourSystemCompatibility(compResult) {
  if (!compResult) return '';

  const { personA, personB, saju, mahabote, horasat, tuVi, synthesis } = compResult;

  return `
    <section class="panel couple-compatibility-panel" aria-labelledby="couple-comp-title">
      <div class="section-heading">
        <div>
          <div class="eyebrow">아시아 4대 전통 다각도 궁합</div>
          <h2 id="couple-comp-title">${escapeHtml(personA.name)} & ${escapeHtml(personB.name)}님의 인연 분석</h2>
        </div>
        <p class="section-desc">한국 사주의 오행 상생, 미얀마 마하보테의 수호령, 태국 호라삿의 라시 원소, 베트남 뜨비의 주성 배합이 전하는 종합 인연 리포트입니다.</p>
      </div>

      <div class="couple-summary-banner">
        <div class="banner-badge">✦ 종합 인연 케미스트리</div>
        <h3 class="banner-headline">${escapeHtml(synthesis.headline)}</h3>
        <p class="banner-desc">${escapeHtml(synthesis.coreMessage)}</p>
      </div>

      <div class="comparison-4grid">
        <!-- 1. 한국 사주 궁합 -->
        <div class="comparison-side-card saju-side">
          <div class="side-header">
            <span class="side-flag">🇰🇷</span>
            <div>
              <h3>한국 사주 궁합</h3>
              <span class="side-sub">일간 오행과 일지 조화</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">오행 케미스트리</div>
            <div class="highlight-value">${escapeHtml(saju.stemSynergy)}</div>
          </div>
          <ul class="side-details">
            <li><strong>본질 상호작용:</strong> ${escapeHtml(saju.stemDetail)}</li>
            <li><strong>일지 교감:</strong> ${escapeHtml(saju.branchSynergy)}</li>
          </ul>
        </div>

        <!-- 2. 미얀마 마하보테 궁합 -->
        <div class="comparison-side-card mahabote-side">
          <div class="side-header">
            <span class="side-flag">🇲🇲</span>
            <div>
              <h3>미얀마 마하보테</h3>
              <span class="side-sub">탄생 요일 수호령(Mittā)</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">수호 동물 조합</div>
            <div class="highlight-value">${escapeHtml(mahabote.animalPair)}</div>
          </div>
          <ul class="side-details">
            <li><strong>관계 유형:</strong> ${escapeHtml(mahabote.animalSynergy)}</li>
            <li><strong>마하보테 조언:</strong> ${escapeHtml(mahabote.advice)}</li>
          </ul>
        </div>

        <!-- 3. 태국 호라삿 궁합 -->
        <div class="comparison-side-card horasat-side">
          <div class="side-header">
            <span class="side-flag">🇹🇭</span>
            <div>
              <h3>태국 호라삿</h3>
              <span class="side-sub">황도 12 라시 & 원소 배합</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">라시 페어링</div>
            <div class="highlight-value">${escapeHtml(horasat.rasiPair)}</div>
          </div>
          <ul class="side-details">
            <li><strong>원소 시너지:</strong> ${escapeHtml(horasat.rasiSynergy)}</li>
            <li><strong>정서적 교감:</strong> ${escapeHtml(horasat.harmonyTone)}</li>
          </ul>
        </div>

        <!-- 4. 베트남 뜨비 궁합 -->
        <div class="comparison-side-card tuvi-side">
          <div class="side-header">
            <span class="side-flag">🇻🇳</span>
            <div>
              <h3>베트남 뜨비</h3>
              <span class="side-sub">명궁 14주성 & 5국 조화</span>
            </div>
          </div>
          <div class="side-highlight">
            <div class="highlight-label">주성 배합</div>
            <div class="highlight-value">${escapeHtml(tuVi.starPair)}</div>
          </div>
          <ul class="side-details">
            <li><strong>인생의 국(Cục):</strong> ${escapeHtml(tuVi.cucPair)}</li>
            <li><strong>주성 시너지:</strong> ${escapeHtml(tuVi.starSynergy)}</li>
          </ul>
        </div>
      </div>

      <div class="comparison-insights-grid">
        <div class="insight-box unique">
          <div class="insight-title">🌿 두 분을 위한 4대 전통 인연 실천 조언</div>
          <p>${escapeHtml(synthesis.advice)}</p>
        </div>
      </div>
    </section>
  `;
}
