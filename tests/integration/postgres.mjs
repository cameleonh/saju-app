import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';
import { migratePostgres } from '../../scripts/migrate-postgres.mjs';
import { configurePostgresRole } from '../../scripts/configure-postgres-role.mjs';
import { finalizeExpiredDeletions } from '../../scripts/finalize-deletions.mjs';
import { createPostgresStorage } from '../../server/storage/postgres.mjs';
import { createKmsVault } from '../../server/crypto/kms-vault.mjs';
import { calculateNatalChart } from '../../chart/natal-engine.mjs';
import { calculateDaewoon } from '../../chart/daewoon-engine.mjs';

const { Pool } = pg;
const adminUrl = process.env.TEST_POSTGRES_URL;
if (!adminUrl) throw new Error('TEST_POSTGRES_URL is required');
assert.deepEqual(await migratePostgres({ connectionString: adminUrl }), ['001_initial_contract.sql', '002_identity_sessions_rls.sql', '003_account_lifecycle.sql']);
assert.deepEqual(await migratePostgres({ connectionString: adminUrl }), [], 'migrations are checksum-locked and idempotent');

const admin = new Pool({ connectionString: adminUrl });
const runtimePassword = 'runtime-test-password-at-least-24';
await configurePostgresRole({ connectionString: adminUrl, password: runtimePassword });
const runtimeUrl = new URL(adminUrl);
runtimeUrl.username = 'saju_runtime';
runtimeUrl.password = runtimePassword;
const runtimePool = new Pool({ connectionString: runtimeUrl.toString() });

const dataKey = Buffer.alloc(32, 9);
const vault = createKmsVault({
  keyId: 'alias/saju-test',
  kmsClient: {
    async send(command) {
      if (command.constructor.name === 'GenerateDataKeyCommand') return { Plaintext: dataKey, CiphertextBlob: Buffer.from('encrypted-key'), KeyId: 'test-key-id' };
      if (command.constructor.name === 'DecryptCommand') return { Plaintext: dataKey, KeyId: 'test-key-id' };
      throw new Error('unexpected KMS command');
    },
  },
});
const storage = createPostgresStorage({ pool: runtimePool, vault, identityHashSecret: 'test-identity-hash-secret-at-least-thirty-two-bytes' });
const account = await storage.upsertAccount({ provider: 'cognito', providerSubject: 'subject-one', email: 'adult@example.test' });
assert.match(account.userId, /^[a-f0-9-]{36}$/);
assert.equal(account.status, 'active');
assert.equal((await admin.query('select count(*)::int as count from ops.identity_links where provider_subject = $1', ['subject-one'])).rows[0].count, 1);
const storedEmailHash = (await admin.query('select email_hash from ops.identity_links where provider_subject = $1', ['subject-one'])).rows[0].email_hash;
assert.equal(storedEmailHash.includes('@'), false, 'email plaintext is not stored');
assert.notEqual(storedEmailHash, crypto.createHash('sha256').update('adult@example.test').digest('hex'), 'email lookup evidence uses a keyed HMAC rather than a dictionary-attackable plain hash');

const tokenHash = crypto.createHash('sha256').update('session-token').digest('hex');
await storage.createSession({ tokenHash, userId: account.userId, expiresAt: '2099-08-05T01:00:00Z' });
const session = await storage.getSession(tokenHash);
assert.equal(session.userId, account.userId);
assert.equal(session.status, 'active');

const birthInput = { calendar: 'solar', date: '1990-10-10', time: '14:30', place: '서울특별시', placeCode: '1100000000', unknownTime: false };
const chartResult = { ...calculateNatalChart(birthInput), facts: [], reading: [] };
chartResult.daewoon = calculateDaewoon({
  date: birthInput.date,
  time: birthInput.time,
  unknownTime: birthInput.unknownTime,
  yearStem: chartResult.pillars[0].stem,
  monthStem: chartResult.pillars[1].stem,
  monthBranch: chartResult.pillars[1].branch,
});
const input = {
  schemaVersion: 'submission.v1',
  clientRequestId: 'postgres-request-one',
  relationshipMode: 'single',
  dataSubject: { relationship: 'self', authorityVerified: true, minor: false },
  birthInput,
  chartResult,
  purposeReceipts: [{ receiptId: 'service-one', purpose: 'service_storage', decision: 'accepted', disclosureVersion: 'service-storage.v2', recordedAt: '2026-08-05T00:00:00Z' }],
};
const submissionId = crypto.randomUUID();
assert.deepEqual(await storage.saveSubmission({ submissionId, input, status: 'accepted', actorUserId: account.userId }), { submissionId, created: true });
assert.deepEqual(await storage.saveSubmission({ submissionId: crypto.randomUUID(), input, status: 'accepted', actorUserId: account.userId }), { submissionId, created: false }, 'actor/client request id is idempotent');
const vaultRow = (await admin.query('select original_ciphertext, normalized_ciphertext, key_id, purge_at, retention_mode from vault.birth_records where submission_id = $1', [submissionId])).rows[0];
assert.equal(vaultRow.key_id, 'test-key-id');
assert.equal(vaultRow.purge_at, null);
assert.equal(vaultRow.retention_mode, 'account_lifecycle');
assert.doesNotMatch(Buffer.concat([vaultRow.original_ciphertext, vaultRow.normalized_ciphertext]).toString('utf8'), /1990-10-10|14:30|서울/);
assert.equal((await admin.query('select lawful_basis_code, consent_decision from governance.purpose_authorization_events where client_request_id = $1', [input.clientRequestId])).rows[0].lawful_basis_code, 'contract_performance');
await assert.rejects(() => runtimePool.query("update governance.purpose_authorization_events set lawful_basis_code = 'consent' where client_request_id = $1", [input.clientRequestId]), /permission denied/, 'runtime cannot rewrite immutable legal-basis evidence');
await assert.rejects(() => runtimePool.query('select * from ops.identity_links'), /permission denied/, 'runtime cannot directly enumerate identity links');
const chartJson = JSON.stringify((await admin.query('select result_json from ops.chart_results where submission_id = $1', [submissionId])).rows[0].result_json);
assert.doesNotMatch(chartJson, /1990-10-10|14:30|서울특별시/, 'plaintext chart storage excludes birth input');
const history = await storage.listSubmissions(account.userId);
assert.equal(history.length, 1);
assert.equal(history[0].submissionId, submissionId);
assert.equal(history[0].birthDate, '1990-10-10');
const reopened = await storage.getSubmission(submissionId, account.userId);
assert.equal(reopened.chart.input.date, birthInput.date);
assert.equal(reopened.chart.input.place, birthInput.place);
assert.deepEqual(reopened.chart.daewoon.input, chartResult.daewoon.input, 'encrypted birth data reconstructs the nested daewoon input');

const other = await storage.upsertAccount({ provider: 'cognito', providerSubject: 'subject-two', email: 'other@example.test' });
assert.equal(await storage.getSubmission(submissionId, other.userId), null, 'another account cannot read the record');
assert.equal(await storage.deleteSubmission(submissionId, other.userId), false, 'another account cannot delete the record');
assert.equal(await storage.deleteSubmission(submissionId, account.userId), true, 'the owning account can delete an individual record');
const secondInput = { ...input, clientRequestId: 'postgres-request-two' };
const secondSubmissionId = crypto.randomUUID();
assert.deepEqual(await storage.saveSubmission({ submissionId: secondSubmissionId, input: secondInput, status: 'accepted', actorUserId: account.userId }), { submissionId: secondSubmissionId, created: true });
const accountDeletion = await storage.deleteAccount(account.userId);
assert.equal(accountDeletion.providerSubject, 'subject-one');
assert.match(accountDeletion.deletionRequestId, /^[a-f0-9-]{36}$/);
await storage.completeAccountDeletion(accountDeletion.deletionRequestId, account.userId, true);
assert.equal((await admin.query('select status from ops.account_users where user_id = $1', [account.userId])).rows[0].status, 'deleted');
assert.equal((await admin.query('select count(*)::int as count from ops.submissions where actor_user_id = $1', [account.userId])).rows[0].count, 0);
assert.deepEqual((await admin.query("select state, external_identity_state from governance.deletion_requests where deletion_request_id = $1", [accountDeletion.deletionRequestId])).rows[0], { state: 'backup_expiry_pending', external_identity_state: 'deleted' });
assert.equal(await storage.getSession(tokenHash), null, 'account deletion revokes all app sessions');
assert.equal(await storage.deleteSubmission(submissionId, account.userId), false);
assert.equal((await admin.query('select count(*)::int as count from ops.submissions where submission_id = $1', [submissionId])).rows[0].count, 0);
assert.equal((await admin.query("select count(*)::int as count from governance.deletion_requests where account_user_id = $1 and request_scope = 'account'", [account.userId])).rows[0].count, 1);
assert.equal(await storage.deleteSession(tokenHash), false);
assert.equal(await storage.getSession(tokenHash), null);
await admin.query("update governance.deletion_requests set backup_expiry_deadline = now() - interval '1 second'");
assert.equal(await finalizeExpiredDeletions(admin), 2, 'expired deletion evidence is finalized only after active and identity deletion');
assert.equal((await admin.query("select count(*)::int as count from governance.deletion_requests where state = 'completed'")).rows[0].count, 2);

await runtimePool.end();
await admin.end();
const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`postgres integration: ${assertionCount} assertions passed`);
