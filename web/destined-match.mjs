// web/destined-match.mjs
// 운명의 상대(보완하는 오행의 인연) UI 렌더러 및 카드뉴스 내보내기 모듈.
// 순수 함수형 컴포넌트로 구성되어 있으며, 결(saju-app) 디자인 시스템을 준수합니다.

import { MATCH_ARCHETYPES } from '../chart/destined-match.mjs';

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * 운명의 상대 패널 마크업을 렌더링합니다.
 * @param {object} match deriveDestinedMatch(chart) 결과
 * @param {object} options { selectedGender = 'female' | 'male' }
 */
export function renderDestinedMatch(match, { selectedGender = 'female' } = {}) {
  if (!match || !match.archetype) return '';

  const { archetype, reason, targetElement, myElement, dayStem } = match;
  const isFemale = selectedGender === 'female';
  const avatarPath = isFemale ? archetype.avatarFemale : archetype.avatarMale;
  const genderLabel = isFemale ? '여성 인연' : '남성 인연';

  const impressions = (archetype.impressions || []).map((imp) => `<span class="match-chip">${escapeHtml(imp)}</span>`).join('');
  const personalities = (archetype.personality || []).map((p) => `<li><span class="match-bullet">✦</span> <span>${escapeHtml(p)}</span></li>`).join('');

  return `
    <section class="panel match-panel" aria-labelledby="match-panel-title">
      <div class="section-heading match-heading">
        <div>
          <div class="eyebrow">오행 상생과 궁합 프로필</div>
          <h2 id="match-panel-title">나를 완성하는 운명의 인연</h2>
        </div>
        <div class="match-gender-toggle" role="group" aria-label="추천 인연 성별 선택">
          <button type="button" class="match-gender-btn ${isFemale ? 'active' : ''}" data-action="match-gender" data-gender="female" aria-pressed="${isFemale}">여성 인연 보기</button>
          <button type="button" class="match-gender-btn ${!isFemale ? 'active' : ''}" data-action="match-gender" data-gender="male" aria-pressed="${!isFemale}">남성 인연 보기</button>
        </div>
      </div>

      <div class="match-reason-banner" style="border-left-color: ${archetype.color};">
        <strong>💡 사주 보완 근거</strong>
        <p>${escapeHtml(reason)}</p>
      </div>

      <div class="match-card-layout">
        <div class="match-avatar-col">
          <div class="match-avatar-wrapper" style="border-color: ${archetype.color};">
            <img src="${escapeHtml(avatarPath)}" alt="${escapeHtml(archetype.title)} ${genderLabel}" class="match-avatar-img" width="500" height="500" loading="lazy" />
          </div>
          <button type="button" class="button secondary small match-card-download" data-action="match-card-png">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            인연 카드뉴스 PNG 저장
          </button>
        </div>

        <div class="match-info-col">
          <div class="match-title-group">
            <span class="match-element-badge" style="background-color: ${archetype.color};">${archetype.elementHanja} · ${archetype.element}의 기운</span>
            <h3 class="match-archetype-title">${escapeHtml(archetype.title)}</h3>
            <p class="match-tagline">“${escapeHtml(archetype.tagline)}”</p>
          </div>

          <div class="match-section">
            <h4>외모 및 첫인상 무드</h4>
            <div class="match-chips-grid">${impressions}</div>
          </div>

          <div class="match-section">
            <h4>성향 및 매력 포인트</h4>
            <ul class="match-personality-list">${personalities}</ul>
          </div>

          <div class="match-meta-grid">
            <div class="match-meta-item">
              <strong>어울리는 라이프스타일</strong>
              <p>${escapeHtml(archetype.lifestyle)}</p>
            </div>
            <div class="match-meta-item">
              <strong>추천 만남의 계절과 장소</strong>
              <p>${escapeHtml(archetype.seasonVenue)}</p>
            </div>
          </div>

          <div class="match-synergy-box">
            <strong>함께할 때 생기는 시너지</strong>
            <p>${escapeHtml(archetype.synergy)}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * 운명의 상대 카드뉴스 Canvas PNG 생성 및 다운로드 함수
 */
export function downloadMatchCardPng(match, selectedGender = 'female') {
  if (!match || !match.archetype) return;

  const { archetype, reason } = match;
  const isFemale = selectedGender === 'female';
  const genderLabel = isFemale ? '여성 인연' : '남성 인연';
  const W = 1080;
  const H = 1440;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#14162a';
  ctx.fillRect(0, 0, W, H);

  // Outer Border Frame
  ctx.strokeStyle = 'rgba(211, 173, 92, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  // Top Brand Header
  ctx.fillStyle = '#d3ad5c';
  ctx.font = 'bold 32px "Noto Serif KR", serif';
  ctx.fillText('결 (結) · 나를 완성하는 운명의 인연', 60, 90);

  ctx.fillStyle = '#a9a3ae';
  ctx.font = '22px "Noto Sans KR", sans-serif';
  ctx.fillText(`${genderLabel} · 오행 상생 프로필`, 60, 126);

  // Title Box
  ctx.fillStyle = archetype.color || '#718d82';
  ctx.beginPath();
  ctx.roundRect(60, 160, 220, 48, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Noto Sans KR", sans-serif';
  ctx.fillText(`${archetype.elementHanja} · ${archetype.element} 기운의 상대`, 80, 194);

  ctx.fillStyle = '#f5eee2';
  ctx.font = 'bold 44px "Noto Serif KR", serif';
  ctx.fillText(archetype.title, 60, 260);

  ctx.fillStyle = '#d7cfc4';
  ctx.font = 'italic 26px "Noto Serif KR", serif';
  ctx.fillText(`“${archetype.tagline}”`, 60, 305);

  // Avatar Image Draw
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = isFemale ? archetype.avatarFemale : archetype.avatarMale;
  img.onload = () => {
    // Draw Avatar Image Box (Square 420x420 at x=60, y=340)
    ctx.drawImage(img, 60, 340, 420, 420);
    ctx.strokeStyle = archetype.color || '#718d82';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 340, 420, 420);

    // Right Side Info Box (x=520, y=340)
    ctx.fillStyle = 'rgba(37, 40, 66, 0.85)';
    ctx.fillRect(520, 340, 500, 420);
    ctx.strokeStyle = 'rgba(220, 205, 177, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(520, 340, 500, 420);

    ctx.fillStyle = '#d3ad5c';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('외모 및 첫인상 무드', 550, 385);

    let cy = 430;
    (archetype.impressions || []).slice(0, 4).forEach((imp) => {
      ctx.fillStyle = '#f5eee2';
      ctx.font = '22px "Noto Sans KR", sans-serif';
      ctx.fillText(`✦ ${imp}`, 550, cy);
      cy += 40;
    });

    cy += 15;
    ctx.fillStyle = '#d3ad5c';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('성향 및 매력 포인트', 550, cy);
    cy += 45;

    (archetype.personality || []).slice(0, 3).forEach((p) => {
      ctx.fillStyle = '#d7cfc4';
      ctx.font = '20px "Noto Sans KR", sans-serif';
      const truncated = p.length > 22 ? `${p.slice(0, 22)}...` : p;
      ctx.fillText(`• ${truncated}`, 550, cy);
      cy += 36;
    });

    // Lower Card: Reason & Synergy Box
    ctx.fillStyle = 'rgba(28, 30, 53, 0.95)';
    ctx.fillRect(60, 790, 960, 440);
    ctx.strokeStyle = 'rgba(216, 196, 155, 0.3)';
    ctx.strokeRect(60, 790, 960, 440);

    ctx.fillStyle = '#d3ad5c';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('💡 사주 보완 근거', 90, 840);

    ctx.fillStyle = '#f5eee2';
    ctx.font = '24px "Noto Sans KR", sans-serif';
    wrapText(ctx, reason, 90, 880, 900, 36);

    ctx.fillStyle = '#d3ad5c';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('🌿 함께할 때 생기는 시너지', 90, 990);

    ctx.fillStyle = '#d7cfc4';
    ctx.font = '23px "Noto Sans KR", sans-serif';
    wrapText(ctx, archetype.synergy, 90, 1030, 900, 36);

    ctx.fillStyle = '#d3ad5c';
    ctx.font = 'bold 26px "Noto Sans KR", sans-serif';
    ctx.fillText('☕ 어울리는 만남의 계절과 장소', 90, 1140);

    ctx.fillStyle = '#f5eee2';
    ctx.font = '23px "Noto Sans KR", sans-serif';
    wrapText(ctx, archetype.seasonVenue, 90, 1180, 900, 36);

    // Footer Watermark
    ctx.fillStyle = '#7d7b8e';
    ctx.font = '20px ui-monospace, monospace';
    ctx.fillText('결(結) · saju.blog · 근거 중심 사주 명리', 60, 1380);

    // Trigger Download
    const a = document.createElement('a');
    a.download = `saju-destined-match-${archetype.element}-${selectedGender}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
