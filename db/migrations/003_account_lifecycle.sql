-- Idempotent account deletion boundary. Active data is removed immediately;
-- deletion evidence remains until the managed seven-day backup window expires.
alter table governance.deletion_requests
  add column if not exists external_identity_state text not null default 'pending'
    check (external_identity_state in ('pending', 'deleted', 'failed')),
  add column if not exists external_identity_failure_code text;

alter table governance.deletion_requests
  drop constraint if exists deletion_requests_submission_id_fkey;
alter table governance.deletion_requests
  add constraint deletion_requests_submission_id_fkey
  foreign key (submission_id) references ops.submissions(submission_id) on delete set null;

create or replace function ops.account_begin_deletion(p_user_id uuid)
returns table (deletion_request_id uuid, provider_subject text)
language plpgsql
security definer
set search_path = pg_catalog, ops, governance, vault, training
as $$
declare
  v_request_id uuid;
  v_provider_subject text;
  v_submission_ids uuid[];
  v_profile_ids uuid[];
  v_subject_ids uuid[];
  v_authorization_ids uuid[];
begin
  if p_user_id is null
     or nullif(current_setting('app.user_id', true), '')::uuid is distinct from p_user_id then
    raise exception 'account ownership check failed';
  end if;

  select link.provider_subject into v_provider_subject
    from ops.identity_links link
   where link.user_id = p_user_id and link.identity_provider = 'cognito';
  if v_provider_subject is null then raise exception 'identity link not found'; end if;

  select request.deletion_request_id into v_request_id
    from governance.deletion_requests request
   where request.account_user_id = p_user_id and request.request_scope = 'account'
   order by request.requested_at desc
   limit 1;
  if v_request_id is not null then
    return query select v_request_id, v_provider_subject;
    return;
  end if;

  update ops.account_users
     set status = 'blocked'
   where user_id = p_user_id and status = 'active';
  if not found then raise exception 'active account not found'; end if;

  select coalesce(array_agg(submission_id), '{}') into v_submission_ids
    from ops.submissions where actor_user_id = p_user_id;
  select coalesce(array_agg(profile_id), '{}') into v_profile_ids
    from ops.profiles where owner_user_id = p_user_id;
  select coalesce(array_agg(data_subject_id), '{}') into v_subject_ids
    from ops.data_subjects where owner_user_id = p_user_id;
  select coalesce(array_agg(authorization_event_id), '{}') into v_authorization_ids
    from governance.purpose_authorization_events where account_user_id = p_user_id;

  delete from training.dataset_members where source_type = 'submission' and source_id = any(v_submission_ids);
  delete from ops.integration_outbox where aggregate_id = any(v_submission_ids);
  delete from governance.processing_events where source_type = 'submission' and source_id = any(v_submission_ids);
  delete from vault.partner_birth_records where submission_id = any(v_submission_ids);
  delete from vault.birth_records where submission_id = any(v_submission_ids);
  delete from ops.annual_readings where submission_id = any(v_submission_ids);
  delete from ops.chart_results where submission_id = any(v_submission_ids);
  delete from ops.submission_subjects where submission_id = any(v_submission_ids);
  delete from ops.submissions where actor_user_id = p_user_id;
  delete from ops.profiles where profile_id = any(v_profile_ids);
  delete from governance.purpose_authorization_events where authorization_event_id = any(v_authorization_ids);
  delete from ops.data_subjects where data_subject_id = any(v_subject_ids);
  update ops.auth_sessions set revoked_at = coalesce(revoked_at, now()) where user_id = p_user_id;
  update ops.account_users set status = 'deleted', deleted_at = now() where user_id = p_user_id;

  v_request_id := gen_random_uuid();
  insert into governance.deletion_requests
    (deletion_request_id, account_user_id, request_scope, state, requested_at, active_deleted_at, backup_expiry_deadline, external_identity_state)
  values
    (v_request_id, p_user_id, 'account', 'backup_expiry_pending', now(), now(), now() + interval '7 days', 'pending');
  return query select v_request_id, v_provider_subject;
end;
$$;

create or replace function ops.account_complete_identity_deletion(
  p_deletion_request_id uuid,
  p_succeeded boolean,
  p_failure_code text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, ops, governance
as $$
declare
  v_user_id uuid;
begin
  select request.account_user_id into v_user_id
    from governance.deletion_requests request
   where request.deletion_request_id = p_deletion_request_id
     and request.request_scope = 'account';
  if v_user_id is null
     or nullif(current_setting('app.user_id', true), '')::uuid is distinct from v_user_id then
    raise exception 'account deletion request not found';
  end if;
  if p_succeeded then
    update governance.deletion_requests
       set external_identity_state = 'deleted', external_identity_failure_code = null
     where deletion_request_id = p_deletion_request_id;
    delete from ops.identity_links where user_id = v_user_id;
  else
    update governance.deletion_requests
       set external_identity_state = 'failed',
           external_identity_failure_code = left(coalesce(p_failure_code, 'identity_delete_failed'), 120)
     where deletion_request_id = p_deletion_request_id;
  end if;
end;
$$;

revoke all on function ops.account_begin_deletion(uuid) from public;
revoke all on function ops.account_complete_identity_deletion(uuid, boolean, text) from public;
grant execute on function ops.account_begin_deletion(uuid) to saju_app;
grant execute on function ops.account_complete_identity_deletion(uuid, boolean, text) to saju_app;

-- The runtime writes immutable events by insert and removes them only during
-- an authorized erasure transaction. It cannot rewrite their history in place.
revoke update on ops.account_users from saju_app;
revoke update on ops.data_subjects, ops.profiles, ops.submissions, ops.submission_subjects, ops.chart_results, ops.annual_readings from saju_app;
grant update (status_code) on ops.submissions to saju_app;
revoke update on vault.birth_records, vault.partner_birth_records from saju_app;
revoke update on governance.purpose_authorization_events, governance.processing_events from saju_app;
revoke update, delete on governance.deletion_requests from saju_app;
