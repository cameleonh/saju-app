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
  target_year INTEGER NOT NULL,
  calculation_policy_json TEXT NOT NULL,
  interpretation_profile_json TEXT NOT NULL,
  annual_facts_json TEXT NOT NULL,
  annual_cards_json TEXT NOT NULL,
  monthly_flow_json TEXT NOT NULL,
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

export function createSqliteStorage(filePath = ':memory:') {
  if (filePath !== ':memory:') fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec(SCHEMA);
  // Keep a development database created by an earlier prototype readable after
  // the source/normalized-input contract was introduced.
  for (const [column, type] of COMPAT_COLUMNS) {
    try {
      db.exec(`ALTER TABLE submissions ADD COLUMN ${column} ${type}`);
    } catch (error) {
      if (!/duplicate column name/i.test(error.message)) throw error;
    }
  }
  const insert = db.prepare(`INSERT INTO submissions (submission_id, client_request_id, relationship_mode, data_subject_json, partner_subject_json, birth_input_json, source_birth_input_json, partner_birth_input_json, partner_source_birth_input_json, chart_result_json, purpose_receipts_json, partner_purpose_receipts_json, training_projection_json, status_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const findById = db.prepare('SELECT * FROM submissions WHERE submission_id = ?');
  const insertAnnual = db.prepare('INSERT INTO annual_readings (submission_id, target_year, calculation_policy_json, interpretation_profile_json, annual_facts_json, annual_cards_json, monthly_flow_json, content_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
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
          insertAnnual.run(submissionId, input.targetYear, JSON.stringify(input.annualResult.calculationPolicy), JSON.stringify(input.annualResult.interpretationProfile), JSON.stringify(input.annualResult.facts), JSON.stringify(input.annualResult.cards), JSON.stringify(input.annualResult.monthlyFlow), input.annualResult.contentHash, createdAt);
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
