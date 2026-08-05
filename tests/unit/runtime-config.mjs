import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRuntimeConfig } from '../../server/config.mjs';

assert.deepEqual(loadRuntimeConfig({ NODE_ENV: 'development' }), { storageMode: 'sqlite' });
assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production' }), /SAJU_STORAGE=postgres/);
assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production', SAJU_STORAGE: 'sqlite' }), /SQLite is not allowed/);
assert.deepEqual(loadRuntimeConfig({ NODE_ENV: 'production', SAJU_STORAGE: 'local-only' }), { storageMode: 'local-only' });
assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production', SAJU_STORAGE: 'postgres', DATABASE_URL: 'secret-value' }), /missing required production configuration/);
assert.doesNotThrow(() => loadRuntimeConfig({
  NODE_ENV: 'production',
  SAJU_STORAGE: 'postgres',
  DATABASE_URL: 'postgresql://example.invalid/saju',
  AWS_REGION: 'ap-northeast-2',
  SAJU_KMS_KEY_ID: 'alias/saju-vault',
  SAJU_COGNITO_USER_POOL_ID: 'ap-northeast-2_example',
  SAJU_COGNITO_CLIENT_ID: 'client',
  SAJU_COGNITO_DOMAIN: 'https://auth.example.test',
  SAJU_PUBLIC_BASE_URL: 'https://example.test',
  SAJU_SESSION_SECRET: 'long-random-session-secret-at-least-thirty-two-bytes',
}));
const complete = {
  NODE_ENV: 'production', SAJU_STORAGE: 'postgres', DATABASE_URL: 'postgresql://example.invalid/saju', AWS_REGION: 'ap-northeast-2',
  SAJU_KMS_KEY_ID: 'alias/saju-vault', SAJU_COGNITO_USER_POOL_ID: 'ap-northeast-2_example', SAJU_COGNITO_CLIENT_ID: 'client',
  SAJU_COGNITO_DOMAIN: 'https://auth.example.test', SAJU_PUBLIC_BASE_URL: 'https://example.test',
  SAJU_SESSION_SECRET: 'long-random-session-secret-at-least-thirty-two-bytes',
};
assert.throws(() => loadRuntimeConfig({ ...complete, SAJU_PUBLIC_BASE_URL: 'http://example.test' }), /HTTPS/);
assert.throws(() => loadRuntimeConfig({ ...complete, SAJU_COGNITO_DOMAIN: 'javascript:alert(1)' }), /HTTPS/);
assert.throws(() => loadRuntimeConfig({ ...complete, DATABASE_URL: 'https://example.test/db' }), /PostgreSQL/);

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`runtime config unit: ${assertionCount} assertions passed`);
