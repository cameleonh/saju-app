import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  submission_id TEXT PRIMARY KEY,
  client_request_id TEXT NOT NULL UNIQUE,
  relationship_mode TEXT NOT NULL DEFAULT 'single',
  data_subject_json TEXT NOT NULL,
  partner_subject_json TEXT,
  birth_input_json TEXT NOT NULL,
  source_birth_input_json TEXT,
  partner_birth_input_json TEXT,
  partner_source_birth_input_json TEXT,
  chart_result_json TEXT NOT NULL,
  purpose_receipts_json TEXT NOT NULL,
  partner_purpose_receipts_json TEXT,
  training_projection_json TEXT,
  status_code TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS submissions_created_idx ON submissions(created_at DESC);
CREATE TABLE IF NOT EXISTS annual_readings (
  submission_id TEXT PRIMARY KEY REFERENCES submissions(submission_id) ON DELETE CASCADE,
  reading_scope TEXT NOT NULL DEFAULT 'annual',
  schema_version TEXT NOT NULL DEFAULT 'annual-reading.v1',
  target_year INTEGER NOT NULL,
  calculation_policy_json TEXT NOT NULL,
  interpretation_profile_json TEXT NOT NULL,
  annual_facts_json TEXT NOT NULL,
  annual_cards_json TEXT NOT NULL,
  monthly_flow_json TEXT NOT NULL,
  annual_result_json TEXT NOT NULL DEFAULT '{}',
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const COMPAT_COLUMNS = [
  ['source_birth_input_json', 'TEXT'],
  ['partner_birth_input_json', 'TEXT'],
  ['partner_source_birth_input_json', 'TEXT'],
  ['partner_purpose_receipts_json', 'TEXT'],
  ['training_projection_json', 'TEXT'],
];

const ANNUAL_COMPAT_COLUMNS = [
  ['reading_scope', "TEXT NOT NULL DEFAULT 'annual'"],
  ['schema_version', "TEXT NOT NULL DEFAULT 'annual-reading.v1'"],
  ['annual_result_json', "TEXT NOT NULL DEFAULT '{}'"],
];

function addMissingColumns(db, table, columns) {
  for (const [column, type] of columns) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch (error) {
      if (!/duplicate column name/i.test(error.message)) throw error;
    }
  }
}

export function createSqliteStorage(filePath = ':memory:') {
  if (filePath !== ':memory:') fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  // Keep a development database created by an earlier prototype readable after
  // the source/normalized-input contract was introduced.
  addMissingColumns(db, 'submissions', COMPAT_COLUMNS);
  addMissingColumns(db, 'annual_readings', ANNUAL_COMPAT_COLUMNS);
  const insert = db.prepare(`INSERT INTO submissions (submission_id, client_request_id, relationship_mode, data_subject_json, partner_subject_json, birth_input_json, source_birth_input_json, partner_birth_input_json, partner_source_birth_input_json, chart_result_json, purpose_receipts_json, partner_purpose_receipts_json, training_projection_json, status_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const findById = db.prepare('SELECT * FROM submissions WHERE submission_id = ?');
  const insertAnnual = db.prepare('INSERT INTO annual_readings (submission_id, reading_scope, schema_version, target_year, calculation_policy_json, interpretation_profile_json, annual_facts_json, annual_cards_json, monthly_flow_json, annual_result_json, content_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const findAnnualById = db.prepare('SELECT * FROM annual_readings WHERE submission_id = ?');
  const deleteById = db.prepare('DELETE FROM submissions WHERE submission_id = ?');
  const withdrawById = db.prepare('UPDATE submissions SET purpose_receipts_json = ?, training_projection_json = NULL, status_code = ? WHERE submission_id = ?');
  return {
    kind: 'sqlite',
    filePath,
    saveSubmission({ submissionId, input, projection, status }) {
      const createdAt = new Date().toISOString();
      db.exec('BEGIN IMMEDIATE');
      try {
        insert.run(submissionId, input.clientRequestId, input.relationshipMode || 'single', JSON.stringify(input.dataSubject), input.partnerSubject ? JSON.stringify(input.partnerSubject) : null, JSON.stringify(input.birthInput), input.sourceBirthInput ? JSON.stringify(input.sourceBirthInput) : null, input.partnerBirthInput ? JSON.stringify(input.partnerBirthInput) : null, input.partnerSourceBirthInput ? JSON.stringify(input.partnerSourceBirthInput) : null, JSON.stringify(input.chartResult), JSON.stringify(input.purposeReceipts), input.partnerPurposeReceipts ? JSON.stringify(input.partnerPurposeReceipts) : null, projection ? JSON.stringify(projection) : null, status, createdAt);
        if (input.readingScope === 'annual' && input.annualResult) {
          insertAnnual.run(submissionId, 'annual', input.annualResult.schemaVersion, input.targetYear, JSON.stringify(input.annualResult.calculationPolicy), JSON.stringify(input.annualResult.interpretationProfile), JSON.stringify(input.annualResult.facts), JSON.stringify(input.annualResult.cards), JSON.stringify(input.annualResult.monthlyFlow), JSON.stringify(input.annualResult), input.annualResult.contentHash, createdAt);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    getSubmission(submissionId) {
      return findById.get(submissionId) || null;
    },
    getAnnualReading(submissionId) {
      return findAnnualById.get(submissionId) || null;
    },
    getAnnualReadingResult(submissionId) {
      const row = findAnnualById.get(submissionId);
      if (!row) return null;
      const result = JSON.parse(row.annual_result_json || '{}');
      if (result?.schemaVersion === 'annual-reading.v1') return result;
      return {
        schemaVersion: row.schema_version,
        readingScope: row.reading_scope,
        targetYear: row.target_year,
        calculationPolicy: JSON.parse(row.calculation_policy_json),
        interpretationProfile: JSON.parse(row.interpretation_profile_json),
        facts: JSON.parse(row.annual_facts_json),
        cards: JSON.parse(row.annual_cards_json),
        monthlyFlow: JSON.parse(row.monthly_flow_json),
        contentHash: row.content_hash,
      };
    },
    deleteSubmission(submissionId) {
      return deleteById.run(submissionId).changes > 0;
    },
    withdrawTraining(submissionId, recordedAt) {
      const row = findById.get(submissionId);
      if (!row) return null;
      const receipts = JSON.parse(row.purpose_receipts_json);
      if (!Array.isArray(receipts)) throw new TypeError('purpose_receipts_json must contain an array');
      const updatedReceipts = receipts.map((receipt) => receipt?.purpose === 'model_training' && ['accepted', 'granted'].includes(receipt.decision)
        ? { ...receipt, decision: 'withdrawn', withdrawnAt: recordedAt }
        : receipt);
      withdrawById.run(JSON.stringify(updatedReceipts), 'training-withdrawn', submissionId);
      return findById.get(submissionId) || null;
    },
    close() { db.close(); },
  };
}
