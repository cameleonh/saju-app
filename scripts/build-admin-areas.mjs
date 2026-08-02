import fs from 'node:fs';
import path from 'node:path';

const [administrativeInputPath, legalInputPath, outputPath = 'data/admin-areas.js'] = process.argv.slice(2);

if (!administrativeInputPath || !legalInputPath) {
  console.error('Usage: node scripts/build-admin-areas.mjs <KIKcd_H.YYYYMMDD> <KIKcd_B.YYYYMMDD> [output]');
  process.exit(1);
}

const decoder = new TextDecoder('euc-kr');

function readFixedWidthRows(inputPath, kind) {
  const source = fs.readFileSync(inputPath);
  const legal = kind === 'legal';
  const minimumLength = legal ? 153 : 122;
  const deletedAtStart = legal ? 144 : 113;
  const rows = [];

  let lineStart = 0;
  for (let index = 0; index <= source.length; index += 1) {
    if (index !== source.length && source[index] !== 0x0a) continue;
    const line = source.subarray(lineStart, index);
    lineStart = index + 1;
    if (line.length < minimumLength) continue;

    const code = line.subarray(0, 10).toString('ascii');
    if (!/^\d{10}$/.test(code)) continue;

    const parts = [
      decoder.decode(line.subarray(11, 42)).trim(),
      decoder.decode(line.subarray(42, 73)).trim(),
      decoder.decode(line.subarray(73, 104)).trim(),
    ];
    if (legal) parts.push(decoder.decode(line.subarray(104, 135)).trim());

    const deletedAt = decoder.decode(line.subarray(deletedAtStart, deletedAtStart + 9)).trim();
    const hasLocality = parts.slice(2).some(Boolean);
    if (!hasLocality || deletedAt) continue;

    rows.push([code, parts.filter(Boolean).join(' '), kind]);
  }

  const uniqueNames = new Set(rows.map(([, name]) => name));
  if (rows.length === 0 || uniqueNames.size !== rows.length) {
    throw new Error(`${kind} area import failed: ${rows.length} rows, ${uniqueNames.size} unique names`);
  }
  return rows;
}

const administrativeRows = readFixedWidthRows(administrativeInputPath, 'administrative');
const legalRows = readFixedWidthRows(legalInputPath, 'legal');
const placesByName = new Map(legalRows.map(([code, name, kind]) => [name, [code, name, kind]]));

for (const [code, name, kind] of administrativeRows) {
  if (!placesByName.has(name)) placesByName.set(name, [code, name, kind]);
}

const rows = [...placesByName.values()].sort((left, right) => left[1].localeCompare(right[1], 'ko'));
if (rows.length !== placesByName.size) throw new Error('Merged birthplace catalog contains duplicate names');

const versions = [administrativeInputPath, legalInputPath].map((inputPath) => {
  const match = path.basename(inputPath).match(/(\d{8})$/);
  return match ? match[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : 'unknown';
});
if (versions[0] !== versions[1]) throw new Error(`Dataset versions differ: ${versions.join(' / ')}`);

const body = rows.map(([code, name, kind]) => `  [${JSON.stringify(code)}, ${JSON.stringify(name)}, ${JSON.stringify(kind)}],`).join('\n');
const output = `/* Generated from the Ministry of the Interior and Safety KIKcd_H and KIKcd_B datasets.
 * Effective date: ${versions[0]}
 * Source: https://www.mois.go.kr/frt/bbs/type001/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000052&nttId=127979
 * Do not edit by hand; regenerate with scripts/build-admin-areas.mjs.
 */
globalThis.SAJU_BIRTH_PLACES = Object.freeze({
  version: ${JSON.stringify(versions[0])},
  source: 'Ministry of the Interior and Safety KIKcd_H + KIKcd_B',
  counts: Object.freeze({ administrative: ${administrativeRows.length}, legal: ${legalRows.length}, unique: ${rows.length} }),
  values: Object.freeze([
${body}
  ]),
});
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`wrote ${rows.length} unique birthplaces (${administrativeRows.length} administrative, ${legalRows.length} legal) to ${outputPath}`);
