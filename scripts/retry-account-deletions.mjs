import { AdminDeleteUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_ADMIN_URL;
const userPoolId = process.env.SAJU_COGNITO_USER_POOL_ID;
const region = process.env.AWS_REGION;
if (!connectionString || !userPoolId || !region) throw new Error('DATABASE_ADMIN_URL, SAJU_COGNITO_USER_POOL_ID, and AWS_REGION are required');

const database = new Client({ connectionString, ssl: process.env.PGSSLMODE === 'verify-full' ? { rejectUnauthorized: true } : false });
const cognito = new CognitoIdentityProviderClient({ region });
await database.connect();
let completed = 0;
let failed = 0;
try {
  const pending = await database.query(`select request.deletion_request_id, request.account_user_id, link.provider_subject
    from governance.deletion_requests request
    join ops.identity_links link on link.user_id = request.account_user_id and link.identity_provider = 'cognito'
    where request.request_scope = 'account' and request.external_identity_state in ('pending', 'failed')
    order by request.requested_at
    limit 100`);
  for (const row of pending.rows) {
    try {
      await cognito.send(new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: row.provider_subject }));
    } catch (error) {
      if (error?.name !== 'UserNotFoundException') {
        failed += 1;
        await database.query(`update governance.deletion_requests
          set external_identity_state = 'failed', external_identity_failure_code = $2
          where deletion_request_id = $1`, [row.deletion_request_id, String(error?.name || 'identity_delete_failed').slice(0, 120)]);
        continue;
      }
    }
    await database.query('begin');
    try {
      await database.query(`update governance.deletion_requests
        set external_identity_state = 'deleted', external_identity_failure_code = null
        where deletion_request_id = $1`, [row.deletion_request_id]);
      await database.query('delete from ops.identity_links where user_id = $1', [row.account_user_id]);
      await database.query('commit');
      completed += 1;
    } catch (error) {
      await database.query('rollback');
      throw error;
    }
  }
} finally {
  await database.end();
}
console.log(`account deletion retry complete: ${completed} completed, ${failed} pending`);
