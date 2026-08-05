import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createAnnualReading } from '../server/domain/annual.mjs';
import { createAnnualStorage } from '../annual/storage.mjs';
import { calculateNatalChart } from '../chart/natal-engine.mjs';
import { calculateDaewoon } from '../chart/daewoon-engine.mjs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const adminAreaSource = fs.readFileSync(new URL('../data/admin-areas.js', import.meta.url), 'utf8');

assert.match(html, /data-action="record-open"/);
assert.match(html, /data-action="record-delete"/);
assert.match(html, /data-action="record-withdraw"/);
assert.match(html, /data-action="record-export"/);
assert.match(html, /data-action="records-clear"/);
assert.match(html, /createAnnualStorage/);
assert.match(html, /annualStorage\.listRecords\(\)/);
assert.match(html, /function openSavedRecord\(/);
assert.match(html, /function deleteSavedRecord\(/);
assert.match(html, /function withdrawTrainingUse\(/);
assert.match(html, /function updateCurrentRecord\(/);
assert.match(html, /currentRecordId/);
assert.match(html, /serverSubmissionId/);
assert.match(html, /state\.currentRecordId = newRecordId\(\)/);
assert.match(html, /minor: isMinorBirthDate\(state\.chart\.input\.date\)/);
assert.match(html, /window\.confirm\('이 저장 기록을 지울까요/);
assert.match(html, /window\.confirm\('이 기기의 모든 저장 기록을 지울까요/);
assert.doesNotMatch(html, /id: 'latest'/);
assert.match(html, /function buildReflectionAnswer\(/);
assert.match(html, /규칙 기반 질문 정리/);
assert.doesNotMatch(html, /Optional consultation|차트 상담/);
assert.doesNotMatch(html, /async function openDb\(\)/, 'IndexedDB mechanics live in the storage adapter');

const chatStart = html.indexOf('function onChatSubmit');
const chatEnd = html.indexOf('async function getStoredRecord', chatStart);
assert.ok(chatStart >= 0 && chatEnd > chatStart, 'chat update boundary is present');
assert.match(html.slice(chatStart, chatEnd), /updateCurrentRecord\(\)/);
assert.doesNotMatch(html.slice(chatStart, chatEnd), /persistRecord\(\)/, 'guidance questions do not create duplicate submissions');

const engineStart = html.indexOf('const STEMS');
const engineEnd = html.indexOf('function getFact');
assert.ok(engineStart >= 0 && engineEnd > engineStart, 'guidance engine boundary is present');
const sandbox = { calculateNatalChart, calculateDaewoon };
vm.runInNewContext(adminAreaSource, sandbox);
vm.runInNewContext(`${html.slice(engineStart, engineEnd)};
  globalThis.workAnswer = buildReflectionAnswer('올해 이직해도 될까요?', calculateChart({ date: '1990-10-10', time: '14:30', unknownTime: false, place: '서울', calendar: 'solar', sex: 'unset', samePerson: true }));
  globalThis.relationshipAnswer = buildReflectionAnswer('연인과 대화가 자꾸 엇갈려요', calculateChart({ date: '1990-10-10', time: '14:30', unknownTime: false, place: '서울', calendar: 'solar', sex: 'unset', samePerson: true }));
  globalThis.moneyAnswer = buildReflectionAnswer('투자해도 될까요?', calculateChart({ date: '1990-10-10', time: '14:30', unknownTime: false, place: '서울', calendar: 'solar', sex: 'unset', samePerson: true }));
  globalThis.healthAnswer = buildReflectionAnswer('요즘 잠과 피로를 어떻게 살펴볼까요?', calculateChart({ date: '1990-10-10', time: '14:30', unknownTime: false, place: '서울', calendar: 'solar', sex: 'unset', samePerson: true }));
  globalThis.adult = isMinorBirthDate('2000-01-01', new Date('2026-08-02T12:00:00+09:00'));
  globalThis.minor = isMinorBirthDate('2010-01-01', new Date('2026-08-02T12:00:00+09:00'));
  globalThis.invalidMinor = isMinorBirthDate('not-a-date', new Date('2026-08-02T12:00:00+09:00'));
`, sandbox);
assert.match(sandbox.workAnswer, /이직 여부를 대신 정하지는 않아요/);
assert.match(sandbox.workAnswer, /조건/);
assert.match(sandbox.relationshipAnswer, /상대의 마음을 대신 정하지는 않아요/);
assert.match(sandbox.moneyAnswer, /투자 결과를 예측하지는 않아요/);
assert.match(sandbox.healthAnswer, /질병을 진단하거나 치료 방법을 정하지는 않아요/);
assert.notEqual(sandbox.workAnswer, sandbox.relationshipAnswer);
assert.equal(sandbox.adult, false);
assert.equal(sandbox.minor, true);
assert.equal(sandbox.invalidMinor, 'unknown');

function createFakeIndexedDB() {
  const stores = new Map();
  let upgraded = false;
  const database = {
    objectStoreNames: { contains: (name) => stores.has(name) },
    createObjectStore(name) { stores.set(name, new Map()); },
    transaction(storeNames) {
      const names = Array.isArray(storeNames) ? storeNames : [storeNames];
      const transaction = { error: null, oncomplete: null, onerror: null, onabort: null };
      let pending = 0;
      const finish = () => {
        pending -= 1;
        if (pending === 0) setTimeout(() => transaction.oncomplete?.(), 0);
      };
      const request = (operation) => {
        pending += 1;
        const result = {};
        queueMicrotask(() => {
          try { result.result = operation(); result.onsuccess?.(); }
          catch (error) { result.error = error; transaction.error = error; result.onerror?.(); transaction.onerror?.(); }
          finally { finish(); }
        });
        return result;
      };
      transaction.objectStore = (name) => {
        if (!names.includes(name) || !stores.has(name)) throw new Error(`missing object store: ${name}`);
        const rows = stores.get(name);
        return {
          get: (id) => request(() => rows.has(id) ? structuredClone(rows.get(id)) : undefined),
          getAll: () => request(() => Array.from(rows.values(), (value) => structuredClone(value))),
          put: (value) => request(() => { rows.set(value.id, structuredClone(value)); return value.id; }),
          delete: (id) => request(() => rows.delete(id)),
          clear: () => request(() => rows.clear()),
        };
      };
      return transaction;
    },
    close() {},
  };
  return {
    open() {
      const request = {};
      queueMicrotask(() => {
        request.result = database;
        if (!upgraded) { upgraded = true; request.onupgradeneeded?.(); }
        request.onsuccess?.();
      });
      return request;
    },
  };
}

assert.throws(() => createAnnualStorage({ indexedDB: null }), /IndexedDB unavailable/);
const annualStorage = createAnnualStorage({ indexedDB: createFakeIndexedDB(), outboxBinding: 'test-purpose-receipt-bound' });
const annual = createAnnualReading({
  targetYear: 2026,
  natal: { dayStem: '戊', monthBranch: '戌', branches: ['午', '戌', '申', '未'], unknownTime: false },
  chartPolicy: { id: 'KR-CIVIL-1.0', version: '1.0.0', engine: 'gyeol-natal-core', engineVersion: '1.0.0' },
});
const storedRecord = { id: 'annual-record', annual, chart: { policy: annual.chartPolicy }, training: true, purposeReceipts: [{ purpose: 'model_training', decision: 'accepted' }], createdAt: '2026-08-04T00:00:00Z', updatedAt: '2026-08-04T00:00:00Z' };
await annualStorage.putPendingRecord(storedRecord, { annualResult: annual, purposeReceipts: storedRecord.purposeReceipts });
assert.deepEqual((await annualStorage.getRecord(storedRecord.id)).annual, annual, 'annual result survives an exact IndexedDB structured-clone round-trip');
assert.equal((await annualStorage.getOutboxEntry(storedRecord.id)).binding, 'test-purpose-receipt-bound');
assert.equal((await annualStorage.listRecords()).length, 1);
const withdrawnRecord = { ...storedRecord, training: false, purposeReceipts: [{ purpose: 'model_training', decision: 'withdrawn' }], updatedAt: '2026-08-04T01:00:00Z' };
await annualStorage.putRecord(withdrawnRecord);
await annualStorage.updateOutboxRecord(withdrawnRecord);
assert.equal((await annualStorage.getOutboxEntry(storedRecord.id)).purpose, 'service_storage');
assert.equal((await annualStorage.getOutboxEntry(storedRecord.id)).payload.purposeReceipts[0].decision, 'withdrawn');
await annualStorage.deleteRecord(storedRecord.id);
assert.equal(await annualStorage.getRecord(storedRecord.id), null);
assert.equal(await annualStorage.getOutboxEntry(storedRecord.id), null);
await annualStorage.putRecord({ ...storedRecord, id: 'clear-me' });
await annualStorage.clearAll();
assert.deepEqual(await annualStorage.listRecords(), []);

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`lifecycle smoke: ${assertionCount} assertions passed`);
