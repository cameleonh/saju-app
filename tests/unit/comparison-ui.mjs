import assert from 'node:assert/strict';
import { getComparisonEligibility, renderComparisonEligibility } from '../../web/multi-system-comparison.mjs';

const exactProfile = {
  date: '1990-10-10',
  time: '14:30',
  unknownTime: false,
  place: '서울특별시 종로구 청운효자동',
  placeCode: '1111051500',
};

const exact = getComparisonEligibility(exactProfile);
assert.deepEqual(exact.map(({ systemId, state }) => [systemId, state]), [
  ['saju', 'ready'],
  ['horasat', 'policy-blocked'],
  ['tu-vi', 'policy-blocked'],
  ['mahabote', 'policy-blocked'],
]);
assert.equal(exact[0].label, '준비됨');
assert.ok(exact[1].reason.includes('정책'));

const unknown = getComparisonEligibility({ ...exactProfile, unknownTime: true, time: '' });
assert.equal(unknown[0].state, 'partial');
assert.equal(unknown[0].label, '부분 결과');

const markup = renderComparisonEligibility(exact);
assert.match(markup, /data-system-id="saju"/);
assert.match(markup, /한국 사주/);
assert.match(markup, /정책 차단/);
assert.match(markup, /호라삿|Tử Vi|마하보테/);
assert.doesNotMatch(markup, /점수|정확도|순위|승자/);

console.log('comparison UI: 10 assertions passed');
