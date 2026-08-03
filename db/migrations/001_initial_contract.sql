-- Saju central-ingestion contract v0.2.
-- This migration is a schema contract, not proof that a production database is connected.
create schema if not exists ops;
create schema if not exists vault;
create schema if not exists governance;
create schema if not exists training;

create table if not exists ops.account_users (
  user_id uuid primary key,
  status text not null default 'active' check (status in ('active', 'deleted', 'blocked')),
  locale text not null default 'ko-KR',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists ops.data_subjects (
  data_subject_id uuid primary key,
  owner_user_id uuid references ops.account_users(user_id),
  relationship_code text not null check (relationship_code in ('self', 'partner', 'third_party')),
  authority_verified boolean not null default false,
  minor_state text not null default 'unknown' check (minor_state in ('unknown', 'adult', 'minor')),
  authority_attested_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ops.profiles (
  profile_id uuid primary key,
  owner_user_id uuid not null references ops.account_users(user_id),
  data_subject_id uuid not null references ops.data_subjects(data_subject_id),
  lifecycle_state text not null default 'active',
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists governance.purpose_authorization_events (
  authorization_event_id uuid primary key,
  account_user_id uuid not null references ops.account_users(user_id),
  data_subject_id uuid not null references ops.data_subjects(data_subject_id),
  purpose_code text not null check (purpose_code in ('service_storage', 'model_training', 'third_party_ai_transfer', 'human_quality_review')),
  disclosure_version text not null,
  lawful_basis_code text not null,
  consent_decision text check (consent_decision in ('accepted', 'declined', 'withdrawn')),
  scope text not null default 'submission',
  recorded_at timestamptz not null,
  effective_at timestamptz not null,
  expires_at timestamptz,
  client_request_id text not null
);

create table if not exists ops.submissions (
  submission_id uuid primary key,
  client_request_id text not null,
  profile_id uuid not null references ops.profiles(profile_id),
  actor_user_id uuid not null references ops.account_users(user_id),
  data_subject_id uuid not null references ops.data_subjects(data_subject_id),
  service_storage_authorization_id uuid not null references governance.purpose_authorization_events(authorization_event_id),
  model_training_authorization_id uuid references governance.purpose_authorization_events(authorization_event_id),
  payload_version text not null,
  status_code text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_user_id, client_request_id)
);

-- A couple submission has two independently addressable subjects. The primary
-- `data_subject_id` above remains the account user's subject for compatibility;
-- this join records the partner role, authority receipt, and subject-level
-- lifecycle for the second birth record.
create table if not exists ops.submission_subjects (
  submission_id uuid not null references ops.submissions(submission_id),
  data_subject_id uuid not null references ops.data_subjects(data_subject_id),
  subject_role text not null check (subject_role in ('self', 'partner')),
  authority_authorization_id uuid references governance.purpose_authorization_events(authorization_event_id),
  created_at timestamptz not null default now(),
  primary key (submission_id, data_subject_id),
  unique (submission_id, subject_role)
);

create table if not exists vault.birth_records (
  birth_record_id uuid primary key,
  submission_id uuid not null unique references ops.submissions(submission_id),
  original_ciphertext bytea not null,
  normalized_ciphertext bytea not null,
  key_id text not null,
  payload_version text not null,
  integrity_hash text not null,
  created_at timestamptz not null default now(),
  purge_at timestamptz not null
);

create table if not exists vault.partner_birth_records (
  partner_birth_record_id uuid primary key,
  submission_id uuid not null references ops.submissions(submission_id),
  data_subject_id uuid not null references ops.data_subjects(data_subject_id),
  original_ciphertext bytea not null,
  normalized_ciphertext bytea not null,
  key_id text not null,
  payload_version text not null,
  integrity_hash text not null,
  created_at timestamptz not null default now(),
  purge_at timestamptz not null,
  unique (submission_id, data_subject_id)
);

create table if not exists ops.chart_results (
  chart_result_id uuid primary key,
  submission_id uuid not null references ops.submissions(submission_id),
  engine_version text not null,
  calculation_policy_version text not null,
  source_data_version text not null,
  schema_version text not null,
  result_json jsonb not null,
  facts_json jsonb not null,
  content_hash text not null,
  boundary_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (submission_id, engine_version, calculation_policy_version, source_data_version)
);

create table if not exists ops.annual_readings (
  submission_id uuid primary key references ops.submissions(submission_id) on delete cascade,
  target_year smallint not null check (target_year between 1900 and 2099),
  annual_policy jsonb not null,
  interpretation_profile jsonb not null,
  annual_facts jsonb not null check (jsonb_typeof(annual_facts) = 'array'),
  annual_cards jsonb not null check (jsonb_typeof(annual_cards) = 'array' and jsonb_array_length(annual_cards) = 8),
  monthly_flow jsonb not null check (jsonb_typeof(monthly_flow) = 'array' and jsonb_array_length(monthly_flow) = 12),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);

create table if not exists governance.processing_events (
  processing_event_id uuid primary key,
  source_type text not null,
  source_id uuid not null,
  operation_code text not null,
  purpose_code text not null,
  actor_service text not null,
  transformation_version text,
  input_hash text,
  output_hash text,
  metadata_redacted jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists ops.integration_outbox (
  event_id uuid primary key,
  originating_context text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  aggregate_version integer not null,
  event_type text not null,
  schema_version text not null,
  payload jsonb not null,
  publication_state text not null default 'pending',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists training.dataset_snapshots (
  dataset_id uuid primary key,
  purpose_code text not null,
  status_code text not null default 'draft',
  transformation_version text not null,
  consent_policy_version text not null,
  privacy_filter_version text not null,
  quality_policy_version text not null,
  manifest_checksum text,
  created_at timestamptz not null default now(),
  finalized_at timestamptz,
  retention_deadline timestamptz
);

create table if not exists training.dataset_members (
  dataset_id uuid not null references training.dataset_snapshots(dataset_id),
  source_type text not null,
  source_id uuid not null,
  pseudonymous_subject_key text not null,
  inclusion_status text not null,
  exclusion_reason text,
  consent_receipt_id uuid references governance.purpose_authorization_events(authorization_event_id),
  source_hash text not null,
  transformed_row_hash text not null,
  created_at timestamptz not null default now(),
  primary key (dataset_id, source_type, source_id)
);

create index if not exists submissions_subject_created_idx on ops.submissions (data_subject_id, created_at desc);
create index if not exists processing_source_idx on governance.processing_events (source_type, source_id, occurred_at desc);
create index if not exists purpose_subject_idx on governance.purpose_authorization_events (data_subject_id, purpose_code, recorded_at desc);

-- Production deployment must add application-specific RLS policies before any API role is granted table access.
