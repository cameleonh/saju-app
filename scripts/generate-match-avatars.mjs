// scripts/generate-match-avatars.mjs
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('images/matches');
fs.mkdirSync(outDir, { recursive: true });

const avatars = [
  {
    key: 'match_wood_male',
    color: '#718d82',
    accent: '#a2c4b8',
    bg: '#172421',
    symbol: '木',
    gender: '남성',
    element: '목',
    hairPath: 'M 130 180 C 130 120, 180 90, 250 90 C 320 90, 370 120, 370 180 C 370 210, 360 250, 360 250 C 350 200, 330 140, 250 140 C 170 140, 150 200, 140 250 Z',
    decor: '<path d="M 210 80 Q 250 50 290 80 Q 250 110 210 80" fill="#a2c4b8" opacity="0.6"/>',
  },
  {
    key: 'match_wood_female',
    color: '#718d82',
    accent: '#a2c4b8',
    bg: '#172421',
    symbol: '木',
    gender: '여성',
    element: '목',
    hairPath: 'M 120 200 C 120 110, 180 80, 250 80 C 320 80, 380 110, 380 200 C 380 320, 370 380, 370 420 C 340 370, 340 220, 250 220 C 160 220, 160 370, 130 420 C 130 380, 120 320, 120 200 Z',
    decor: '<circle cx="250" cy="70" r="14" fill="#a2c4b8" opacity="0.5"/><path d="M 235 60 Q 250 40 265 60" stroke="#a2c4b8" stroke-width="2" fill="none"/>',
  },
  {
    key: 'match_fire_male',
    color: '#b55f4b',
    accent: '#f28d74',
    bg: '#2b1b19',
    symbol: '火',
    gender: '남성',
    element: '화',
    hairPath: 'M 135 180 C 135 110, 190 85, 250 85 C 310 85, 365 110, 365 180 C 365 210, 355 240, 355 240 C 345 190, 320 135, 250 135 C 180 135, 155 190, 145 240 Z',
    decor: '<path d="M 250 40 Q 270 80 250 100 Q 230 80 250 40" fill="#f28d74" opacity="0.7"/>',
  },
  {
    key: 'match_fire_female',
    color: '#b55f4b',
    accent: '#f28d74',
    bg: '#2b1b19',
    symbol: '火',
    gender: '여성',
    element: '화',
    hairPath: 'M 115 190 C 115 100, 175 75, 250 75 C 325 75, 385 100, 385 190 C 385 330, 375 390, 375 430 C 345 360, 345 210, 250 210 C 155 210, 155 360, 125 430 C 125 390, 115 330, 115 190 Z',
    decor: '<path d="M 230 65 Q 250 35 270 65 Q 250 85 230 65" fill="#f28d74" opacity="0.6"/>',
  },
  {
    key: 'match_earth_male',
    color: '#b48b4e',
    accent: '#e6bf7b',
    bg: '#292215',
    symbol: '土',
    gender: '남성',
    element: '토',
    hairPath: 'M 130 190 C 130 120, 185 95, 250 95 C 315 95, 370 120, 370 190 C 370 220, 360 260, 360 260 C 350 210, 330 150, 250 150 C 170 150, 150 210, 140 260 Z',
    decor: '<polygon points="250,55 275,90 225,90" fill="#e6bf7b" opacity="0.55"/>',
  },
  {
    key: 'match_earth_female',
    color: '#b48b4e',
    accent: '#e6bf7b',
    bg: '#292215',
    symbol: '土',
    gender: '여성',
    element: '토',
    hairPath: 'M 120 200 C 120 110, 180 85, 250 85 C 320 85, 380 110, 380 200 C 380 320, 370 390, 370 430 C 340 370, 340 220, 250 220 C 160 220, 160 370, 130 430 Z',
    decor: '<circle cx="250" cy="70" r="15" fill="#e6bf7b" opacity="0.5"/>',
  },
  {
    key: 'match_metal_male',
    color: '#829096',
    accent: '#c0d0d6',
    bg: '#1b2024',
    symbol: '金',
    gender: '남성',
    element: '금',
    hairPath: 'M 135 180 C 135 110, 190 85, 250 85 C 310 85, 365 110, 365 180 C 365 210, 355 240, 355 240 C 340 180, 320 130, 250 130 C 180 130, 160 180, 145 240 Z',
    decor: '<path d="M 230 65 L 250 45 L 270 65 L 250 85 Z" fill="#c0d0d6" opacity="0.6"/>',
  },
  {
    key: 'match_metal_female',
    color: '#829096',
    accent: '#c0d0d6',
    bg: '#1b2024',
    symbol: '金',
    gender: '여성',
    element: '금',
    hairPath: 'M 120 190 C 120 100, 180 75, 250 75 C 320 75, 380 100, 380 190 C 380 330, 370 400, 370 440 C 340 370, 340 210, 250 210 C 160 210, 160 370, 130 440 Z',
    decor: '<path d="M 235 55 L 250 40 L 265 55 L 250 70 Z" fill="#c0d0d6" opacity="0.6"/>',
  },
  {
    key: 'match_water_male',
    color: '#8589ae',
    accent: '#b5b9de',
    bg: '#181b2e',
    symbol: '水',
    gender: '남성',
    element: '수',
    hairPath: 'M 130 180 C 130 110, 185 85, 250 85 C 315 85, 370 110, 370 180 C 370 220, 360 250, 360 250 C 350 190, 325 140, 250 140 C 175 140, 150 190, 140 250 Z',
    decor: '<path d="M 215 75 Q 235 50 250 75 Q 265 100 285 75" stroke="#b5b9de" stroke-width="3" fill="none" opacity="0.7"/>',
  },
  {
    key: 'match_water_female',
    color: '#8589ae',
    accent: '#b5b9de',
    bg: '#181b2e',
    symbol: '水',
    gender: '여성',
    element: '수',
    hairPath: 'M 115 190 C 115 95, 175 70, 250 70 C 325 70, 385 95, 385 190 C 385 340, 375 410, 375 450 C 345 370, 345 200, 250 200 C 155 200, 155 370, 125 450 Z',
    decor: '<path d="M 220 60 Q 235 40 250 60 Q 265 80 280 60" stroke="#b5b9de" stroke-width="3" fill="none" opacity="0.7"/>',
  },
];

for (const item of avatars) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="${item.color}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${item.bg}" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${item.color}" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="inkGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Circle & Frame -->
  <rect width="500" height="500" rx="36" fill="${item.bg}"/>
  <rect width="492" height="492" x="4" y="4" rx="32" fill="url(#bgGrad)" stroke="${item.color}" stroke-width="1.5" stroke-opacity="0.4"/>

  <!-- Celestial Ring / Moon Aura -->
  <circle cx="250" cy="230" r="160" fill="none" stroke="${item.color}" stroke-width="1" stroke-dasharray="4 6" opacity="0.45"/>
  <circle cx="250" cy="230" r="145" fill="url(#auraGrad)" opacity="0.3"/>

  <!-- Element Symbol Seal (Top Right) -->
  <g transform="translate(400, 36)">
    <rect width="64" height="64" rx="14" fill="${item.color}" opacity="0.85"/>
    <text x="32" y="44" fill="#ffffff" font-family="'Noto Serif KR', serif" font-size="28" font-weight="700" text-anchor="middle">${item.symbol}</text>
  </g>

  <!-- Silhouette Figure & Facial Structure -->
  <!-- Shoulders & Upper Body -->
  <path d="M 120 480 C 120 380, 180 340, 250 340 C 320 340, 380 380, 380 480 Z" fill="#202235" opacity="0.9"/>
  <path d="M 170 480 L 250 365 L 330 480 Z" fill="${item.color}" opacity="0.25"/>

  <!-- Neck -->
  <path d="M 220 270 L 220 345 L 280 345 L 280 270 Z" fill="#ecdcc4"/>

  <!-- Face Contour -->
  <path d="M 175 190 C 175 285, 210 320, 250 320 C 290 320, 325 285, 325 190 C 325 130, 290 120, 250 120 C 210 120, 175 130, 175 190 Z" fill="#f7ece0"/>

  <!-- Hair Silhouette -->
  <path d="${item.hairPath}" fill="#161521"/>

  <!-- Eyes & Facial Features (Aesthetic Minimalist Lines) -->
  <g stroke="#3a3238" stroke-width="2.5" stroke-linecap="round" fill="none">
    <!-- Left Eye & Brow -->
    <path d="M 205 182 Q 220 176 232 184"/>
    <path d="M 202 168 Q 218 162 234 170" stroke-width="2" opacity="0.6"/>

    <!-- Right Eye & Brow -->
    <path d="M 268 184 Q 280 176 295 182"/>
    <path d="M 266 170 Q 282 162 298 168" stroke-width="2" opacity="0.6"/>

    <!-- Nose Bridge & Tip -->
    <path d="M 250 188 L 248 232 Q 250 236 254 234" stroke-width="1.8" opacity="0.55"/>

    <!-- Lips (Subtle Coral Tint) -->
    <path d="M 234 265 Q 250 272 266 265" stroke="${item.color}" stroke-width="2.8"/>
  </g>

  <!-- Element Aesthetic Decor -->
  ${item.decor}

  <!-- Bottom Label Overlay Badge -->
  <g transform="translate(50, 420)">
    <rect width="400" height="52" rx="16" fill="rgba(20, 22, 42, 0.85)" stroke="${item.color}" stroke-width="1.2"/>
    <text x="200" y="32" fill="#f5eee2" font-family="'Noto Sans KR', sans-serif" font-size="16" font-weight="700" text-anchor="middle">${item.gender} · ${item.element}(${item.symbol})의 인연</text>
  </g>
</svg>`;

  const filePath = path.join(outDir, `${item.key}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
}

console.log(`Generated 10 match avatar SVGs in ${outDir}`);
