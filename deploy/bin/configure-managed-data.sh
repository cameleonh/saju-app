#!/bin/sh
set -eu

: "${DATABASE_ADMIN_URL:?required}"
: "${SAJU_RUNTIME_DB_PASSWORD:?required}"
: "${SAJU_DB_HOST:?required}"
: "${SAJU_DB_NAME:?required}"
: "${SAJU_KMS_KEY_ID:?required}"
: "${SAJU_COGNITO_USER_POOL_ID:?required}"
: "${SAJU_COGNITO_CLIENT_ID:?required}"
: "${SAJU_COGNITO_DOMAIN:?required}"
: "${SAJU_PUBLIC_BASE_URL:?required}"
: "${SAJU_SESSION_SECRET:?required}"
: "${AWS_ACCESS_KEY_ID:?required}"
: "${AWS_SECRET_ACCESS_KEY:?required}"
: "${SAJU_CLOUD_SAVE_APPROVED:?set to yes only after every launch sign-off gate is approved}"

[ "$SAJU_CLOUD_SAVE_APPROVED" = yes ] || { echo 'SAJU_CLOUD_SAVE_APPROVED must equal yes' >&2; exit 1; }
[ "${#SAJU_RUNTIME_DB_PASSWORD}" -ge 24 ]
[ "${#SAJU_SESSION_SECRET}" -ge 32 ]
case "$SAJU_RUNTIME_DB_PASSWORD" in *[!A-Za-z0-9_-]*) echo 'SAJU_RUNTIME_DB_PASSWORD must be base64url-safe' >&2; exit 1;; esac
case "$SAJU_SESSION_SECRET" in *[!A-Za-z0-9_-]*) echo 'SAJU_SESSION_SECRET must be base64url-safe' >&2; exit 1;; esac

write_env() {
  env_name="$1"
  env_value="$2"
  line_count=$(printf '%s' "$env_value" | wc -l)
  [ "$line_count" -eq 0 ] || { echo "$env_name must not contain newlines" >&2; exit 1; }
  escaped=$(printf '%s' "$env_value" | sed 's/[\\"$`]/\\&/g')
  printf '%s="%s"\n' "$env_name" "$escaped"
}

project_root="${SAJU_PROJECT_ROOT:-/var/www/saju-app}"
signoff_path="$project_root/docs/legal/LAUNCH-SIGNOFF.md"
[ -f "$signoff_path" ] || { echo 'LAUNCH-SIGNOFF.md is missing' >&2; exit 1; }
if grep -q '| BLOCKED |' "$signoff_path"; then
  echo 'Cloud save remains blocked by LAUNCH-SIGNOFF.md' >&2
  exit 1
fi
ca_path=/etc/ssl/certs/aws-rds-global-bundle.pem
curl -fsS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o "$ca_path"
chmod 644 "$ca_path"

cd "$project_root"
PGSSLMODE=verify-full NODE_EXTRA_CA_CERTS="$ca_path" DATABASE_ADMIN_URL="$DATABASE_ADMIN_URL" node scripts/migrate-postgres.mjs
PGSSLMODE=verify-full NODE_EXTRA_CA_CERTS="$ca_path" DATABASE_ADMIN_URL="$DATABASE_ADMIN_URL" SAJU_RUNTIME_DB_PASSWORD="$SAJU_RUNTIME_DB_PASSWORD" node scripts/configure-postgres-role.mjs

umask 077
runtime_tmp=$(mktemp)
migrate_tmp=$(mktemp)
aws_tmp=$(mktemp)
trap 'rm -f "$runtime_tmp" "$migrate_tmp" "$aws_tmp"' EXIT
runtime_url="postgresql://saju_runtime:${SAJU_RUNTIME_DB_PASSWORD}@${SAJU_DB_HOST}:5432/${SAJU_DB_NAME}"
{
  write_env SAJU_STORAGE postgres
  write_env DATABASE_URL "$runtime_url"
  write_env AWS_REGION "${AWS_REGION:-ap-northeast-2}"
  write_env PGSSLMODE verify-full
  write_env NODE_EXTRA_CA_CERTS "$ca_path"
  write_env SAJU_KMS_KEY_ID "$SAJU_KMS_KEY_ID"
  write_env SAJU_COGNITO_USER_POOL_ID "$SAJU_COGNITO_USER_POOL_ID"
  write_env SAJU_COGNITO_CLIENT_ID "$SAJU_COGNITO_CLIENT_ID"
  write_env SAJU_COGNITO_DOMAIN "$SAJU_COGNITO_DOMAIN"
  write_env SAJU_PUBLIC_BASE_URL "$SAJU_PUBLIC_BASE_URL"
  write_env SAJU_SESSION_SECRET "$SAJU_SESSION_SECRET"
} >"$runtime_tmp"
{
  write_env DATABASE_ADMIN_URL "$DATABASE_ADMIN_URL"
  write_env PGSSLMODE verify-full
  write_env NODE_EXTRA_CA_CERTS "$ca_path"
} >"$migrate_tmp"
{
  write_env AWS_ACCESS_KEY_ID "$AWS_ACCESS_KEY_ID"
  write_env AWS_SECRET_ACCESS_KEY "$AWS_SECRET_ACCESS_KEY"
} >"$aws_tmp"
install -o root -g www-data -m 640 "$runtime_tmp" /etc/saju-app.env
install -o root -g root -m 600 "$migrate_tmp" /etc/saju-app-migrate.env
install -o root -g www-data -m 640 "$aws_tmp" /etc/saju-app-aws.env
systemctl daemon-reload
systemctl restart saju-app
systemctl is-active --quiet saju-app
curl -fsS http://127.0.0.1:4174/health >/dev/null
echo 'managed data runtime configured'
