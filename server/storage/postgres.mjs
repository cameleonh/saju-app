import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const ACCEPTED = new Set(['accepted', 'granted']);

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function hmacSha256(secret, value) {
  const key = crypto.createHmac('sha256', secret).update('saju-identity-email-v1').digest();
  try { return crypto.createHmac('sha256', key).update(String(value)).digest('hex'); }
  finally { key.fill(0); }
}

function serviceReceipt(input) {
  return input.purposeReceipts.find((receipt) => receipt?.purpose === 'service_storage' && ACCEPTED.has(receipt?.decision));
}

function chartWithoutBirthInput(chart) {
  const { input: _input, partnerInput: _partnerInput, daewoon, ...stored } = chart || {};
  if (!daewoon) return stored;
  const { input: _daewoonInput, ...storedDaewoon } = daewoon;
  return { ...stored, daewoon: storedDaewoon };
}

function chartWithBirthInput(chart, birth) {
  const restored = { ...chart, input: birth };
  if (!chart?.daewoon) return restored;
  const yearPillar = chart.pillars?.[0];
  const monthPillar = chart.pillars?.[1];
  return {
    ...restored,
    daewoon: {
      ...chart.daewoon,
      input: {
        date: birth.date,
        time: birth.unknownTime ? '12:00' : birth.time,
        unknownTime: Boolean(birth.unknownTime),
        yearStem: yearPillar?.stem,
        monthStem: monthPillar?.stem,
        monthBranch: monthPillar?.branch,
      },
    },
  };
}

async function inTransaction(pool, userId, operation) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    if (userId) await client.query("select set_config('app.user_id', $1, true)", [userId]);
    const result = await operation(client);
    await client.query('commit');
    return result;
  } catch (error) {
    try { await client.query('rollback'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export function createPostgresStorage({ connectionString = null, ssl = false, pool = null, vault, identityHashSecret }) {
  if (!vault?.encryptJson) throw new TypeError('KMS vault is required');
  if (!identityHashSecret || String(identityHashSecret).length < 32) throw new TypeError('identity hash secret is required');
  const database = pool || new Pool({ connectionString, ssl, max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
  return {
    kind: 'postgres',

    async upsertAccount({ provider, providerSubject, email }) {
      if (provider !== 'cognito' || !providerSubject || !email) throw new TypeError('verified Cognito identity is required');
      const result = await database.query('select * from ops.auth_upsert_cognito($1, $2)', [providerSubject, hmacSha256(identityHashSecret, email.trim().toLowerCase())]);
      if (!result.rowCount) throw new Error('account upsert failed');
      return { userId: result.rows[0].user_id, status: result.rows[0].status };
    },

    async createSession({ tokenHash, userId, expiresAt }) {
      await database.query('select ops.auth_create_session($1, $2, $3)', [tokenHash, userId, expiresAt]);
    },

    async getSession(tokenHash) {
      const result = await database.query('select * from ops.auth_get_session($1)', [tokenHash]);
      if (!result.rowCount) return null;
      return { userId: result.rows[0].user_id, status: result.rows[0].status, expiresAt: result.rows[0].expires_at.toISOString() };
    },

    async deleteSession(tokenHash) {
      const result = await database.query('select ops.auth_delete_session($1) as deleted', [tokenHash]);
      return result.rows[0]?.deleted === true;
    },

    async saveSubmission({ submissionId, input, status, actorUserId }) {
      if (!actorUserId) throw new TypeError('actorUserId is required');
      const receipt = serviceReceipt(input);
      if (!receipt) throw new TypeError('service storage disclosure is required');
      const originalBirth = await vault.encryptJson(input.sourceBirthInput || input.birthInput);
      const normalizedBirth = await vault.encryptJson(input.birthInput);
      const chart = input.relationshipMode === 'couple' ? input.chartResult.self : input.chartResult;
      const storedChart = chartWithoutBirthInput(chart);
      const ids = {
        subject: crypto.randomUUID(),
        profile: crypto.randomUUID(),
        authorization: crypto.randomUUID(),
        birth: crypto.randomUUID(),
        chart: crypto.randomUUID(),
        processing: crypto.randomUUID(),
      };
      return inTransaction(database, actorUserId, async (client) => {
        const existing = await client.query('select submission_id from ops.submissions where actor_user_id = $1 and client_request_id = $2', [actorUserId, input.clientRequestId]);
        if (existing.rowCount) return { submissionId: existing.rows[0].submission_id, created: false };
        await client.query(`insert into ops.data_subjects
          (data_subject_id, owner_user_id, relationship_code, authority_verified, minor_state, authority_attested_at)
          values ($1, $2, 'self', true, 'adult', $3)`, [ids.subject, actorUserId, receipt.recordedAt]);
        await client.query(`insert into governance.purpose_authorization_events
          (authorization_event_id, account_user_id, data_subject_id, purpose_code, disclosure_version, lawful_basis_code, consent_decision, scope, recorded_at, effective_at, client_request_id)
          values ($1, $2, $3, 'service_storage', $4, 'contract_performance', null, 'submission', $5, $5, $6)`,
        [ids.authorization, actorUserId, ids.subject, receipt.disclosureVersion, receipt.recordedAt, input.clientRequestId]);
        await client.query('insert into ops.profiles (profile_id, owner_user_id, data_subject_id) values ($1, $2, $3)', [ids.profile, actorUserId, ids.subject]);
        await client.query(`insert into ops.submissions
          (submission_id, client_request_id, profile_id, actor_user_id, data_subject_id, service_storage_authorization_id, payload_version, status_code)
          values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [submissionId, input.clientRequestId, ids.profile, actorUserId, ids.subject, ids.authorization, input.schemaVersion, status]);
        await client.query(`insert into ops.submission_subjects (submission_id, data_subject_id, subject_role, authority_authorization_id)
          values ($1, $2, 'self', $3)`, [submissionId, ids.subject, ids.authorization]);
        await client.query(`insert into vault.birth_records
          (birth_record_id, submission_id, original_ciphertext, normalized_ciphertext, key_id, payload_version, integrity_hash, purge_at, retention_mode)
          values ($1, $2, $3, $4, $5, $6, $7, null, 'account_lifecycle')`,
        [ids.birth, submissionId, originalBirth.ciphertext, normalizedBirth.ciphertext, normalizedBirth.keyId, 'birth-input.v1', normalizedBirth.integrityHash]);
        await client.query(`insert into ops.chart_results
          (chart_result_id, submission_id, engine_version, calculation_policy_version, source_data_version, schema_version, result_json, facts_json, content_hash, boundary_flags)
          values ($1, $2, $3, $4, $5, 'natal-chart.v1', $6, $7, $8, $9)`, [
          ids.chart,
          submissionId,
          chart.policy?.engineVersion || 'unknown',
          chart.policy?.version || 'unknown',
          chart.policy?.solarTermSource?.version || chart.sourceVersion || 'embedded',
          storedChart,
          storedChart.facts || [],
          sha256(storedChart),
          storedChart.boundaryFlags || [],
        ]);
        if (input.readingScope === 'annual' && input.annualResult) {
          const annual = input.annualResult;
          await client.query(`insert into ops.annual_readings
            (submission_id, reading_scope, schema_version, target_year, annual_policy, interpretation_profile, annual_facts, annual_cards, monthly_flow, annual_result, content_hash)
            values ($1, 'annual', $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
            submissionId, annual.schemaVersion, input.targetYear, annual.calculationPolicy, annual.interpretationProfile,
            annual.facts, annual.cards, annual.monthlyFlow, annual, annual.contentHash,
          ]);
        }
        await client.query(`insert into governance.processing_events
          (processing_event_id, source_type, source_id, operation_code, purpose_code, actor_service, transformation_version, input_hash, output_hash, metadata_redacted)
          values ($1, 'submission', $2, 'persist', 'service_storage', 'saju-ingestion', $3, $4, $5, $6)`, [
          ids.processing, submissionId, input.schemaVersion, sha256(normalizedBirth.ciphertext), sha256(chart), { relationshipMode: 'single', minorState: 'adult' },
        ]);
        return { submissionId, created: true };
      });
    },

    async listSubmissions(actorUserId) {
      if (!actorUserId) return [];
      return inTransaction(database, actorUserId, async (client) => {
        const result = await client.query(`select submission.submission_id, submission.client_request_id, submission.created_at, birth.normalized_ciphertext
          from ops.submissions submission
          join vault.birth_records birth on birth.submission_id = submission.submission_id
          where submission.actor_user_id = $1
          order by submission.created_at desc
          limit 100`, [actorUserId]);
        return Promise.all(result.rows.map(async (row) => {
          const birth = await vault.decryptJson(row.normalized_ciphertext);
          return {
            submissionId: row.submission_id,
            clientRequestId: row.client_request_id,
            createdAt: row.created_at.toISOString(),
            birthDate: birth.date,
            place: birth.place,
            mode: 'single',
          };
        }));
      });
    },

    async getSubmission(submissionId, actorUserId) {
      if (!actorUserId) return null;
      return inTransaction(database, actorUserId, async (client) => {
        const result = await client.query(`select submission.submission_id, submission.client_request_id, submission.created_at,
            chart.result_json, annual.annual_result, birth.normalized_ciphertext
          from ops.submissions submission
          join ops.chart_results chart on chart.submission_id = submission.submission_id
          join vault.birth_records birth on birth.submission_id = submission.submission_id
          left join ops.annual_readings annual on annual.submission_id = submission.submission_id
          where submission.submission_id = $1 and submission.actor_user_id = $2`, [submissionId, actorUserId]);
        if (!result.rowCount) return null;
        const row = result.rows[0];
        const birth = await vault.decryptJson(row.normalized_ciphertext);
        return {
          submissionId: row.submission_id,
          clientRequestId: row.client_request_id,
          mode: 'single',
          chart: chartWithBirthInput(row.result_json, birth),
          annual: row.annual_result || null,
          createdAt: row.created_at.toISOString(),
        };
      });
    },

    async deleteSubmission(submissionId, actorUserId) {
      if (!actorUserId) return false;
      return inTransaction(database, actorUserId, async (client) => {
        const found = await client.query(`select submission_id, profile_id, data_subject_id, service_storage_authorization_id
          from ops.submissions where submission_id = $1 and actor_user_id = $2 for update`, [submissionId, actorUserId]);
        if (!found.rowCount) return false;
        const row = found.rows[0];
        await client.query(`insert into governance.deletion_requests
          (deletion_request_id, account_user_id, request_scope, submission_id, state, requested_at, active_deleted_at, backup_expiry_deadline, external_identity_state)
          values ($1, $2, 'submission', $3, 'backup_expiry_pending', now(), now(), now() + interval '7 days', 'deleted')`, [crypto.randomUUID(), actorUserId, submissionId]);
        await client.query("delete from governance.processing_events where source_type = 'submission' and source_id = $1", [submissionId]);
        await client.query('delete from vault.partner_birth_records where submission_id = $1', [submissionId]);
        await client.query('delete from vault.birth_records where submission_id = $1', [submissionId]);
        await client.query('delete from ops.annual_readings where submission_id = $1', [submissionId]);
        await client.query('delete from ops.chart_results where submission_id = $1', [submissionId]);
        await client.query('delete from ops.submission_subjects where submission_id = $1', [submissionId]);
        await client.query('delete from ops.submissions where submission_id = $1 and actor_user_id = $2', [submissionId, actorUserId]);
        await client.query('delete from ops.profiles where profile_id = $1', [row.profile_id]);
        await client.query('delete from governance.purpose_authorization_events where authorization_event_id = $1', [row.service_storage_authorization_id]);
        await client.query('delete from ops.data_subjects where data_subject_id = $1', [row.data_subject_id]);
        return true;
      });
    },

    async deleteAccount(actorUserId) {
      if (!actorUserId) throw new TypeError('actorUserId is required');
      return inTransaction(database, actorUserId, async (client) => {
        const result = await client.query('select * from ops.account_begin_deletion($1)', [actorUserId]);
        if (!result.rowCount) throw new Error('account deletion did not start');
        return {
          deletionRequestId: result.rows[0].deletion_request_id,
          providerSubject: result.rows[0].provider_subject,
        };
      });
    },

    async completeAccountDeletion(deletionRequestId, actorUserId, succeeded, failureCode = null) {
      if (!actorUserId) throw new TypeError('actorUserId is required');
      return inTransaction(database, actorUserId, async (client) => {
        await client.query('select ops.account_complete_identity_deletion($1, $2, $3)', [deletionRequestId, succeeded, failureCode]);
      });
    },

    async withdrawTraining() { return false; },

    async healthcheck() {
      const result = await database.query('select 1 as ok');
      return result.rows[0]?.ok === 1;
    },

    async close() { if (!pool) await database.end(); },
  };
}
