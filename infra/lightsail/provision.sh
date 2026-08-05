#!/bin/sh
set -eu

: "${SAJU_DB_MASTER_PASSWORD:?required}"
: "${SAJU_COGNITO_DOMAIN_PREFIX:?required}"
: "${SAJU_BUDGET_EMAIL:?required}"

SAJU_AWS_REGION="${SAJU_AWS_REGION:-ap-northeast-2}"
SAJU_DB_RESOURCE_NAME="${SAJU_DB_RESOURCE_NAME:-saju-prod-postgres}"
SAJU_DB_NAME="${SAJU_DB_NAME:-saju}"
SAJU_DB_MASTER_USER="${SAJU_DB_MASTER_USER:-sajuadmin}"
SAJU_KMS_ALIAS="${SAJU_KMS_ALIAS:-alias/saju-prod-vault}"
SAJU_USER_POOL_NAME="${SAJU_USER_POOL_NAME:-saju-prod-users}"
SAJU_PUBLIC_BASE_URL="${SAJU_PUBLIC_BASE_URL:-https://saju.blog}"
SAJU_RUNTIME_IAM_USER="${SAJU_RUNTIME_IAM_USER:-saju-runtime}"
export AWS_DEFAULT_REGION="$SAJU_AWS_REGION"

account_id=$(aws sts get-caller-identity --query Account --output text)

if ! aws lightsail get-relational-database --relational-database-name "$SAJU_DB_RESOURCE_NAME" >/dev/null 2>&1; then
  blueprint_id=$(aws lightsail get-relational-database-blueprints --query "blueprints[?engine=='postgres' && starts_with(engineVersion, '16')]|[0].blueprintId" --output text)
  bundle_id=$(aws lightsail get-relational-database-bundles --query "bundles[?isActive==\`true\` && name=='Micro']|[0].bundleId" --output text)
  [ -n "$blueprint_id" ] && [ "$blueprint_id" != "None" ] || { echo "PostgreSQL 16 Lightsail blueprint not found" >&2; exit 1; }
  [ -n "$bundle_id" ] && [ "$bundle_id" != "None" ] || { echo "USD 15 Lightsail database bundle not found" >&2; exit 1; }
  aws lightsail create-relational-database \
    --relational-database-name "$SAJU_DB_RESOURCE_NAME" \
    --availability-zone "${SAJU_AWS_REGION}a" \
    --relational-database-blueprint-id "$blueprint_id" \
    --relational-database-bundle-id "$bundle_id" \
    --master-database-name "$SAJU_DB_NAME" \
    --master-username "$SAJU_DB_MASTER_USER" \
    --master-user-password "$SAJU_DB_MASTER_PASSWORD" \
    --no-publicly-accessible \
    --tags key=application,value=saju key=environment,value=production >/dev/null
fi

key_id=$(aws kms describe-key --key-id "$SAJU_KMS_ALIAS" --query KeyMetadata.KeyId --output text 2>/dev/null || true)
if [ -z "$key_id" ]; then
  key_id=$(aws kms create-key --description "Saju production birth-data envelope key" --key-usage ENCRYPT_DECRYPT --origin AWS_KMS --tags TagKey=application,TagValue=saju TagKey=environment,TagValue=production --query KeyMetadata.KeyId --output text)
  aws kms create-alias --alias-name "$SAJU_KMS_ALIAS" --target-key-id "$key_id"
  aws kms enable-key-rotation --key-id "$key_id"
fi
key_arn=$(aws kms describe-key --key-id "$key_id" --query KeyMetadata.Arn --output text)

user_pool_id=$(aws cognito-idp list-user-pools --max-results 60 --query "UserPools[?Name=='$SAJU_USER_POOL_NAME']|[0].Id" --output text)
if [ -z "$user_pool_id" ] || [ "$user_pool_id" = "None" ]; then
  user_pool_id=$(aws cognito-idp create-user-pool \
    --pool-name "$SAJU_USER_POOL_NAME" \
    --username-attributes email \
    --auto-verified-attributes email \
    --mfa-configuration ON \
    --software-token-mfa-configuration Enabled=true \
    --account-recovery-setting 'RecoveryMechanisms=[{Priority=1,Name=verified_email}]' \
    --deletion-protection ACTIVE \
    --user-pool-tier ESSENTIALS \
    --policies 'PasswordPolicy={MinimumLength=14,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true,TemporaryPasswordValidityDays=1}' \
    --admin-create-user-config AllowAdminCreateUserOnly=false \
    --user-pool-tags application=saju,environment=production \
    --query UserPool.Id --output text)
fi

client_id=$(aws cognito-idp list-user-pool-clients --user-pool-id "$user_pool_id" --max-results 60 --query "UserPoolClients[?ClientName=='saju-web']|[0].ClientId" --output text)
if [ -z "$client_id" ] || [ "$client_id" = "None" ]; then
  client_id=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$user_pool_id" \
    --client-name saju-web \
    --no-generate-secret \
    --allowed-o-auth-flows code \
    --allowed-o-auth-scopes openid email \
    --allowed-o-auth-flows-user-pool-client \
    --supported-identity-providers COGNITO \
    --callback-urls "${SAJU_PUBLIC_BASE_URL}/auth/callback" \
    --logout-urls "${SAJU_PUBLIC_BASE_URL}/" \
    --enable-token-revocation \
    --prevent-user-existence-errors ENABLED \
    --access-token-validity 60 --id-token-validity 60 --refresh-token-validity 1 \
    --token-validity-units AccessToken=minutes,IdToken=minutes,RefreshToken=days \
    --query UserPoolClient.ClientId --output text)
fi

if ! aws cognito-idp describe-user-pool-domain --domain "$SAJU_COGNITO_DOMAIN_PREFIX" >/dev/null 2>&1; then
  aws cognito-idp create-user-pool-domain --domain "$SAJU_COGNITO_DOMAIN_PREFIX" --user-pool-id "$user_pool_id" --managed-login-version 2 >/dev/null
fi

if ! aws iam get-user --user-name "$SAJU_RUNTIME_IAM_USER" >/dev/null 2>&1; then
  aws iam create-user --user-name "$SAJU_RUNTIME_IAM_USER" >/dev/null
  aws iam tag-user --user-name "$SAJU_RUNTIME_IAM_USER" --tags Key=application,Value=saju Key=environment,Value=production
fi
user_pool_arn="arn:aws:cognito-idp:${SAJU_AWS_REGION}:${account_id}:userpool/${user_pool_id}"
runtime_policy=$(jq -nc --arg key "$key_arn" --arg pool "$user_pool_arn" '{Version:"2012-10-17",Statement:[{Sid:"UseSajuVaultKey",Effect:"Allow",Action:["kms:GenerateDataKey","kms:Decrypt"],Resource:$key,Condition:{StringEquals:{"kms:EncryptionContext:service":"saju-app","kms:EncryptionContext:purpose":"birth-vault","kms:EncryptionContext:version":"v1"}}},{Sid:"DescribeSajuVaultKey",Effect:"Allow",Action:["kms:DescribeKey"],Resource:$key},{Sid:"DeleteOwnCognitoAccounts",Effect:"Allow",Action:["cognito-idp:AdminDeleteUser"],Resource:$pool}]}')
aws iam put-user-policy --user-name "$SAJU_RUNTIME_IAM_USER" --policy-name SajuRuntimeLeastPrivilege --policy-document "$runtime_policy"

access_key_count=$(aws iam list-access-keys --user-name "$SAJU_RUNTIME_IAM_USER" --query 'length(AccessKeyMetadata)' --output text)
if [ "$access_key_count" -eq 0 ]; then
  : "${SAJU_RUNTIME_CREDENTIALS_FILE:?required when creating the runtime IAM access key}"
  [ ! -e "$SAJU_RUNTIME_CREDENTIALS_FILE" ] || { echo "Runtime credentials target already exists" >&2; exit 1; }
  credential_json=$(aws iam create-access-key --user-name "$SAJU_RUNTIME_IAM_USER")
  umask 077
  {
    printf 'AWS_ACCESS_KEY_ID=%s\n' "$(printf '%s' "$credential_json" | jq -r '.AccessKey.AccessKeyId')"
    printf 'AWS_SECRET_ACCESS_KEY=%s\n' "$(printf '%s' "$credential_json" | jq -r '.AccessKey.SecretAccessKey')"
  } >"$SAJU_RUNTIME_CREDENTIALS_FILE"
  unset credential_json
fi

budget_file=$(mktemp)
subscriber_file=$(mktemp)
trap 'rm -f "$budget_file" "$subscriber_file"' EXIT
jq -nc '{BudgetName:"saju-monthly",BudgetLimit:{Amount:"25",Unit:"USD"},TimeUnit:"MONTHLY",BudgetType:"COST"}' >"$budget_file"
jq -nc --arg email "$SAJU_BUDGET_EMAIL" '[{Notification:{NotificationType:"ACTUAL",ComparisonOperator:"GREATER_THAN",Threshold:50,ThresholdType:"PERCENTAGE"},Subscribers:[{SubscriptionType:"EMAIL",Address:$email}]},{Notification:{NotificationType:"FORECASTED",ComparisonOperator:"GREATER_THAN",Threshold:80,ThresholdType:"PERCENTAGE"},Subscribers:[{SubscriptionType:"EMAIL",Address:$email}]},{Notification:{NotificationType:"ACTUAL",ComparisonOperator:"GREATER_THAN",Threshold:100,ThresholdType:"PERCENTAGE"},Subscribers:[{SubscriptionType:"EMAIL",Address:$email}]}]' >"$subscriber_file"
if ! aws budgets describe-budget --account-id "$account_id" --budget-name saju-monthly >/dev/null 2>&1; then
  aws budgets create-budget --account-id "$account_id" --budget "file://$budget_file" --notifications-with-subscribers "file://$subscriber_file"
fi

database_endpoint=$(aws lightsail get-relational-database --relational-database-name "$SAJU_DB_RESOURCE_NAME" --query 'relationalDatabase.masterEndpoint.address' --output text)
printf '%s\n' "Resources ready (secrets omitted):"
printf 'SAJU_DB_ENDPOINT=%s\n' "$database_endpoint"
printf 'SAJU_KMS_KEY_ID=%s\n' "$SAJU_KMS_ALIAS"
printf 'SAJU_COGNITO_USER_POOL_ID=%s\n' "$user_pool_id"
printf 'SAJU_COGNITO_CLIENT_ID=%s\n' "$client_id"
printf 'SAJU_COGNITO_DOMAIN=https://%s.auth.%s.amazoncognito.com\n' "$SAJU_COGNITO_DOMAIN_PREFIX" "$SAJU_AWS_REGION"
printf 'SAJU_RUNTIME_IAM_USER=%s\n' "$SAJU_RUNTIME_IAM_USER"
