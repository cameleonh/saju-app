-- Deployable account/session boundary and row isolation for the governed release.
create extension if not exists pgcrypto;

create table if not exists ops.identity_links (
  identity_provider text not null check (identity_provider = 'cognito'),
  provider_subject text not null,
  user_id uuid not null references ops.account_users(user_id) on delete cascade,
  email_hash text not null check (email_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (identity_provider, provider_subject),
  unique (user_id, identity_provider)
);

create table if not exists ops.auth_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references ops.account_users(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_expiry_idx on ops.auth_sessions (user_id, expires_at desc);

create table if not exists governance.deletion_requests (
  deletion_request_id uuid primary key,
  account_user_id uuid not null references ops.account_users(user_id),
  request_scope text not null check (request_scope in ('submission', 'account')),
  submission_id uuid references ops.submissions(submission_id),
  state text not null default 'requested' check (state in ('requested', 'active_deleted', 'backup_expiry_pending', 'completed', 'failed')),
  requested_at timestamptz not null default now(),
  active_deleted_at timestamptz,
  backup_expiry_deadline timestamptz,
  completed_at timestamptz,
  failure_code text
);

alter table vault.birth_records alter column purge_at drop not null;
alter table vault.partner_birth_records alter column purge_at drop not null;
alter table vault.birth_records add column if not exists retention_mode text not null default 'account_lifecycle' check (retention_mode = 'account_lifecycle');
alter table vault.partner_birth_records add column if not exists retention_mode text not null default 'account_lifecycle' check (retention_mode = 'account_lifecycle');

create or replace function ops.auth_upsert_cognito(p_provider_subject text, p_email_hash text)
returns table (user_id uuid, status text)
language plpgsql
security definer
set search_path = pg_catalog, ops
as $$
declare
  v_user_id uuid;
begin
  if p_provider_subject is null or length(p_provider_subject) < 1 or p_email_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid identity attributes';
  end if;
  select link.user_id into v_user_id
    from ops.identity_links link
   where link.identity_provider = 'cognito' and link.provider_subject = p_provider_subject;
  if v_user_id is null then
    v_user_id := gen_random_uuid();
    begin
      insert into ops.account_users (user_id) values (v_user_id);
      insert into ops.identity_links (identity_provider, provider_subject, user_id, email_hash)
      values ('cognito', p_provider_subject, v_user_id, p_email_hash);
    exception when unique_violation then
      delete from ops.account_users where ops.account_users.user_id = v_user_id;
      select link.user_id into v_user_id
        from ops.identity_links link
       where link.identity_provider = 'cognito' and link.provider_subject = p_provider_subject;
    end;
  else
    update ops.identity_links set email_hash = p_email_hash, updated_at = now()
     where identity_provider = 'cognito' and provider_subject = p_provider_subject;
  end if;
  return query select account.user_id, account.status from ops.account_users account where account.user_id = v_user_id;
end;
$$;

create or replace function ops.auth_create_session(p_token_hash text, p_user_id uuid, p_expires_at timestamptz)
returns void
language plpgsql
security definer
set search_path = pg_catalog, ops
as $$
begin
  if p_token_hash !~ '^[a-f0-9]{64}$' or p_expires_at <= now() then raise exception 'invalid session'; end if;
  if not exists (select 1 from ops.account_users where user_id = p_user_id and status = 'active') then raise exception 'inactive account'; end if;
  insert into ops.auth_sessions (token_hash, user_id, expires_at) values (p_token_hash, p_user_id, p_expires_at)
  on conflict (token_hash) do nothing;
end;
$$;

create or replace function ops.auth_get_session(p_token_hash text)
returns table (user_id uuid, status text, expires_at timestamptz)
language sql
security definer
set search_path = pg_catalog, ops
as $$
  select account.user_id, account.status, session.expires_at
    from ops.auth_sessions session
    join ops.account_users account on account.user_id = session.user_id
   where session.token_hash = p_token_hash
     and session.revoked_at is null
     and session.expires_at > now()
     and account.status = 'active'
$$;

create or replace function ops.auth_delete_session(p_token_hash text)
returns boolean
language sql
security definer
set search_path = pg_catalog, ops
as $$
  with revoked as (
    update ops.auth_sessions set revoked_at = now()
     where token_hash = p_token_hash and revoked_at is null
     returning 1
  ) select exists(select 1 from revoked)
$$;

revoke all on function ops.auth_upsert_cognito(text, text) from public;
revoke all on function ops.auth_create_session(text, uuid, timestamptz) from public;
revoke all on function ops.auth_get_session(text) from public;
revoke all on function ops.auth_delete_session(text) from public;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'saju_app') then create role saju_app nologin; end if;
end $$;

grant usage on schema ops, vault, governance to saju_app;
grant execute on function ops.auth_upsert_cognito(text, text) to saju_app;
grant execute on function ops.auth_create_session(text, uuid, timestamptz) to saju_app;
grant execute on function ops.auth_get_session(text) to saju_app;
grant execute on function ops.auth_delete_session(text) to saju_app;
grant select, update on ops.account_users to saju_app;
grant select, insert, update, delete on ops.data_subjects, ops.profiles, ops.submissions, ops.submission_subjects, ops.chart_results, ops.annual_readings to saju_app;
grant select, insert, update, delete on vault.birth_records, vault.partner_birth_records to saju_app;
grant select, insert, update, delete on governance.purpose_authorization_events, governance.processing_events, governance.deletion_requests to saju_app;

alter table ops.account_users enable row level security;
alter table ops.data_subjects enable row level security;
alter table ops.profiles enable row level security;
alter table ops.submissions enable row level security;
alter table ops.submission_subjects enable row level security;
alter table ops.chart_results enable row level security;
alter table ops.annual_readings enable row level security;
alter table vault.birth_records enable row level security;
alter table vault.partner_birth_records enable row level security;
alter table governance.purpose_authorization_events enable row level security;
alter table governance.processing_events enable row level security;
alter table governance.deletion_requests enable row level security;

drop policy if exists account_owner on ops.account_users;
create policy account_owner on ops.account_users using (user_id = nullif(current_setting('app.user_id', true), '')::uuid);
drop policy if exists subject_owner on ops.data_subjects;
create policy subject_owner on ops.data_subjects using (owner_user_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_user_id = nullif(current_setting('app.user_id', true), '')::uuid);
drop policy if exists profile_owner on ops.profiles;
create policy profile_owner on ops.profiles using (owner_user_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_user_id = nullif(current_setting('app.user_id', true), '')::uuid);
drop policy if exists submission_owner on ops.submissions;
create policy submission_owner on ops.submissions using (actor_user_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (actor_user_id = nullif(current_setting('app.user_id', true), '')::uuid);
drop policy if exists authorization_owner on governance.purpose_authorization_events;
create policy authorization_owner on governance.purpose_authorization_events using (account_user_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (account_user_id = nullif(current_setting('app.user_id', true), '')::uuid);
drop policy if exists deletion_owner on governance.deletion_requests;
create policy deletion_owner on governance.deletion_requests using (account_user_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (account_user_id = nullif(current_setting('app.user_id', true), '')::uuid);

drop policy if exists submission_subject_owner on ops.submission_subjects;
create policy submission_subject_owner on ops.submission_subjects using (exists (select 1 from ops.submissions s where s.submission_id = submission_subjects.submission_id)) with check (exists (select 1 from ops.submissions s where s.submission_id = submission_subjects.submission_id));
drop policy if exists chart_owner on ops.chart_results;
create policy chart_owner on ops.chart_results using (exists (select 1 from ops.submissions s where s.submission_id = chart_results.submission_id)) with check (exists (select 1 from ops.submissions s where s.submission_id = chart_results.submission_id));
drop policy if exists annual_owner on ops.annual_readings;
create policy annual_owner on ops.annual_readings using (exists (select 1 from ops.submissions s where s.submission_id = annual_readings.submission_id)) with check (exists (select 1 from ops.submissions s where s.submission_id = annual_readings.submission_id));
drop policy if exists birth_owner on vault.birth_records;
create policy birth_owner on vault.birth_records using (exists (select 1 from ops.submissions s where s.submission_id = birth_records.submission_id)) with check (exists (select 1 from ops.submissions s where s.submission_id = birth_records.submission_id));
drop policy if exists partner_birth_owner on vault.partner_birth_records;
create policy partner_birth_owner on vault.partner_birth_records using (exists (select 1 from ops.submissions s where s.submission_id = partner_birth_records.submission_id)) with check (exists (select 1 from ops.submissions s where s.submission_id = partner_birth_records.submission_id));
drop policy if exists processing_owner on governance.processing_events;
create policy processing_owner on governance.processing_events using (source_type = 'submission' and exists (select 1 from ops.submissions s where s.submission_id = processing_events.source_id)) with check (source_type = 'submission' and exists (select 1 from ops.submissions s where s.submission_id = processing_events.source_id));
