import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const defaultMigrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations');

export async function migratePostgres({ connectionString, ssl = false, migrationsDir = defaultMigrationsDir }) {
  if (!connectionString) throw new TypeError('PostgreSQL connection string is required');
  const client = new Client({ connectionString, ssl });
  await client.connect();
  try {
    await client.query('select pg_advisory_lock($1)', [72613011]);
    await client.query(`create table if not exists public.saju_schema_migrations (
      migration_name text primary key,
      checksum text not null check (checksum ~ '^[a-f0-9]{64}$'),
      applied_at timestamptz not null default now()
    )`);
    const names = (await fs.readdir(migrationsDir)).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
    const applied = [];
    for (const name of names) {
      const sql = await fs.readFile(path.join(migrationsDir, name), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('select checksum from public.saju_schema_migrations where migration_name = $1', [name]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`applied migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public.saju_schema_migrations (migration_name, checksum) values ($1, $2)', [name, checksum]);
        await client.query('commit');
        applied.push(name);
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }
    return applied;
  } finally {
    try { await client.query('select pg_advisory_unlock($1)', [72613011]); } catch {}
    await client.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const connectionString = process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL;
  const ssl = process.env.PGSSLMODE === 'verify-full' ? { rejectUnauthorized: true } : false;
  const applied = await migratePostgres({ connectionString, ssl });
  console.log(applied.length ? `applied ${applied.join(', ')}` : 'database schema already current');
}
