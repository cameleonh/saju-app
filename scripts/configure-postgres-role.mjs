import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_ADMIN_URL;
const password = process.env.SAJU_RUNTIME_DB_PASSWORD;
if (!connectionString || !password || password.length < 24) throw new Error('DATABASE_ADMIN_URL and a 24+ character SAJU_RUNTIME_DB_PASSWORD are required');
const client = new Client({ connectionString, ssl: process.env.PGSSLMODE === 'verify-full' ? { rejectUnauthorized: true } : false });
await client.connect();
try {
  await client.query(`do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'saju_runtime') then
      create role saju_runtime login in role saju_app;
    end if;
  end $$`);
  const statement = await client.query("select format('alter role saju_runtime password %L', $1::text) as sql", [password]);
  await client.query(statement.rows[0].sql);
  await client.query('alter role saju_runtime connection limit 12');
} finally {
  await client.end();
}
console.log('saju_runtime role configured');
