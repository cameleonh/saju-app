import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;

export async function finalizeExpiredDeletions(database) {
  const result = await database.query(`update governance.deletion_requests
    set state = 'completed', completed_at = now(), failure_code = null, external_identity_failure_code = null
    where state = 'backup_expiry_pending'
      and external_identity_state = 'deleted'
      and backup_expiry_deadline <= now()
    returning deletion_request_id`);
  return result.rowCount;
}

async function main() {
  const connectionString = process.env.DATABASE_ADMIN_URL;
  if (!connectionString) throw new Error('DATABASE_ADMIN_URL is required');
  const database = new Client({
    connectionString,
    ssl: process.env.PGSSLMODE === 'verify-full' ? { rejectUnauthorized: true } : false,
  });
  await database.connect();
  try {
    const count = await finalizeExpiredDeletions(database);
    console.log(`deletion finalization complete: ${count} completed`);
  } finally {
    await database.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
