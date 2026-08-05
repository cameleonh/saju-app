import assert from 'node:assert/strict';
import fs from 'node:fs';

const provision = fs.readFileSync(new URL('../../infra/lightsail/provision.sh', import.meta.url), 'utf8');
const configure = fs.readFileSync(new URL('../../deploy/bin/configure-managed-data.sh', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../../deploy/systemd/saju-app.service', import.meta.url), 'utf8');
const deletionFinalizeService = fs.readFileSync(new URL('../../deploy/systemd/saju-app-deletion-finalize.service', import.meta.url), 'utf8');
const deletionFinalizeTimer = fs.readFileSync(new URL('../../deploy/systemd/saju-app-deletion-finalize.timer', import.meta.url), 'utf8');
const updater = fs.readFileSync(new URL('../../deploy/bin/update-saju-app.sh', import.meta.url), 'utf8');
const apache = fs.readFileSync(new URL('../../deploy/apache/saju.blog-le-ssl.conf', import.meta.url), 'utf8');

assert.match(provision, /name=='Micro'/, 'the fixed-cost standard Micro bundle is selected explicitly');
assert.match(provision, /--no-publicly-accessible/, 'the managed database is private');
assert.doesNotMatch(provision, /put-role-policy --role-name AmazonLightsailInstanceRole/, 'the unassignable Lightsail internal role is not treated as an application role');
assert.match(provision, /create-user --user-name "\$SAJU_RUNTIME_IAM_USER"/, 'a dedicated no-console runtime identity is created');
assert.match(provision, /kms:EncryptionContext:purpose.*birth-vault/, 'runtime KMS access is bound to the non-PII application context');
assert.match(provision, /cognito-idp:AdminDeleteUser/, 'runtime identity deletion is limited to the selected Cognito pool');
assert.match(provision, /--mfa-configuration ON/, 'cloud accounts require Cognito MFA after the gated launch');
assert.match(provision, /MinimumLength=14/, 'cloud accounts require a strong minimum password length');
assert.match(configure, /SAJU_RUNTIME_DB_PASSWORD must be base64url-safe/, 'database password cannot alter environment-file parsing');
assert.match(configure, /SAJU_CLOUD_SAVE_APPROVED.*yes/, 'managed persistence requires an explicit post-signoff operator gate');
assert.match(configure, /LAUNCH-SIGNOFF\.md/, 'managed persistence refuses a repository sign-off that still contains blocked gates');
assert.match(configure, /install -o root -g www-data -m 640 "\$aws_tmp" \/etc\/saju-app-aws\.env/, 'runtime AWS credentials are installed outside the release with restricted permissions');
assert.match(service, /Environment=SAJU_STORAGE=local-only/, 'a fresh production deployment cannot silently enable cloud collection');
assert.match(service, /EnvironmentFile=-\/etc\/saju-app-aws\.env/, 'the runtime credential boundary is explicit');
assert.match(updater, /\. \/etc\/saju-app-migrate\.env[\s\S]*node scripts\/migrate-postgres\.mjs/, 'release updates run locked migrations using the root-only bootstrap environment');
assert.match(updater, /systemctl enable --now saju-app-deletion-finalize\.timer/, 'backup-expiry evidence is finalized by the deployed daily timer');
assert.match(deletionFinalizeService, /ConditionPathExists=\/etc\/saju-app-migrate\.env/, 'deletion finalization stays inactive until managed storage is configured');
assert.match(deletionFinalizeService, /EnvironmentFile=\/etc\/saju-app-migrate\.env/, 'deletion finalization uses the root-only administrative database boundary');
assert.match(deletionFinalizeTimer, /OnCalendar=daily/, 'deletion evidence finalization runs daily');
assert.match(apache, /LogFormat "%t \\"%m %U %H\\" %>s %b" saju_minimal/, 'access logs omit IP, user agent, referrer, and OAuth query strings');
assert.doesNotMatch(apache, /CustomLog .* combined/, 'the identifying default combined log is disabled');
assert.doesNotMatch(apache, /fonts\.googleapis\.com|fonts\.gstatic\.com/, 'the production CSP does not permit an undisclosed third-party font connection');

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`deployment unit: ${assertionCount} assertions passed`);
