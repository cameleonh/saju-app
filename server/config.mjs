const REQUIRED_POSTGRES = [
  'DATABASE_URL',
  'AWS_REGION',
  'SAJU_KMS_KEY_ID',
  'SAJU_COGNITO_USER_POOL_ID',
  'SAJU_COGNITO_CLIENT_ID',
  'SAJU_COGNITO_DOMAIN',
  'SAJU_PUBLIC_BASE_URL',
  'SAJU_SESSION_SECRET',
];

function validateHttpsOrigin(name, value) {
  let url;
  try { url = new URL(value); }
  catch { throw new Error(`${name} must be an HTTPS origin`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS origin`);
  }
}

function validatePostgresUrl(value) {
  let url;
  try { url = new URL(value); }
  catch { throw new Error('DATABASE_URL must be a PostgreSQL URL'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must be a PostgreSQL URL');
}

export function loadRuntimeConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const storageMode = env.SAJU_STORAGE || (production ? '' : 'sqlite');
  if (production && !storageMode) throw new Error('production requires SAJU_STORAGE=postgres');
  if (production && storageMode === 'sqlite') throw new Error('SQLite is not allowed in production');
  if (storageMode === 'local-only') return { storageMode };
  if (storageMode === 'sqlite') return { storageMode };
  if (storageMode !== 'postgres') throw new Error('SAJU_STORAGE must be local-only, sqlite, or postgres');
  const missing = REQUIRED_POSTGRES.filter((name) => !env[name]);
  if (missing.length || String(env.SAJU_SESSION_SECRET || '').length < 32) throw new Error('missing required production configuration');
  validatePostgresUrl(env.DATABASE_URL);
  validateHttpsOrigin('SAJU_COGNITO_DOMAIN', env.SAJU_COGNITO_DOMAIN);
  validateHttpsOrigin('SAJU_PUBLIC_BASE_URL', env.SAJU_PUBLIC_BASE_URL);
  return {
    storageMode,
    databaseUrl: env.DATABASE_URL,
    region: env.AWS_REGION,
    kmsKeyId: env.SAJU_KMS_KEY_ID,
    cognitoUserPoolId: env.SAJU_COGNITO_USER_POOL_ID,
    cognitoClientId: env.SAJU_COGNITO_CLIENT_ID,
    cognitoDomain: env.SAJU_COGNITO_DOMAIN,
    publicBaseUrl: env.SAJU_PUBLIC_BASE_URL,
    sessionSecret: env.SAJU_SESSION_SECRET,
    ssl: env.PGSSLMODE === 'verify-full' ? { rejectUnauthorized: true } : false,
  };
}
