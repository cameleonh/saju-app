import { createIngestionServer } from './http.mjs';
import { KMSClient } from '@aws-sdk/client-kms';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createCognitoAuth } from './auth/cognito.mjs';
import { createCognitoIdentityAdmin } from './auth/cognito-admin.mjs';
import { loadRuntimeConfig } from './config.mjs';
import { createKmsVault } from './crypto/kms-vault.mjs';
import { createPostgresStorage } from './storage/postgres.mjs';
import { createSqliteStorage } from './storage/sqlite.mjs';
import { createReadingStore } from './storage/readings.mjs';

const port = Number(process.env.PORT || 4174);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = loadRuntimeConfig();
let storage = null;
let auth = null;
if (config.storageMode === 'postgres') {
  const vault = createKmsVault({ kmsClient: new KMSClient({ region: config.region }), keyId: config.kmsKeyId });
  storage = createPostgresStorage({ connectionString: config.databaseUrl, ssl: config.ssl, vault, identityHashSecret: config.sessionSecret });
  await storage.healthcheck();
  auth = createCognitoAuth({
    storage,
    identityAdmin: createCognitoIdentityAdmin({
      client: new CognitoIdentityProviderClient({ region: config.region }),
      userPoolId: config.cognitoUserPoolId,
    }),
    clientId: config.cognitoClientId,
    userPoolId: config.cognitoUserPoolId,
    cognitoDomain: config.cognitoDomain,
    publicBaseUrl: config.publicBaseUrl,
    sessionSecret: config.sessionSecret,
  });
} else if (config.storageMode === 'sqlite') {
  const storagePath = process.env.SAJU_DB_PATH || path.join(projectRoot, 'data', 'saju.sqlite');
  storage = createSqliteStorage(storagePath);
}
// Reading pattern DB is pure content (not user data) — always seeded from
// .mjs files at startup. Uses the existing SQLite file in SQLite mode, or an
// in-memory SQLite DB in PostgreSQL / local-only modes.  This keeps readings
// deterministic and decouples content from the governed user-data store.
const { DatabaseSync } = await import('node:sqlite');
const readingDbPath = (storage?.kind === 'sqlite' && storage.filePath)
  ? storage.filePath
  : ':memory:';
const readingStore = createReadingStore(new DatabaseSync(readingDbPath));
const server = createIngestionServer({ staticRoot: projectRoot, storage, auth, readingStore });
server.listen(port, '127.0.0.1', () => console.log(`saju ingestion adapter listening on http://127.0.0.1:${port} with ${storage?.kind || 'local-only'}`));

async function shutdown() {
  server.close(async () => {
    if (storage?.close) await storage.close();
    process.exit(0);
  });
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
