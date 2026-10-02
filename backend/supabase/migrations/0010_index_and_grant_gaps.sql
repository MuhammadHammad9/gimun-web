-- Indexes for the access paths the admin panel actually uses, and the two
-- trigger functions that were left with a default PUBLIC execute grant.
--
-- Every index below is justified by a specific query in the codebase, not by
-- theory. The tables are still small (pre-event), so a plain CREATE INDEX is
-- safe here; after go-live the same statements would want CONCURRENTLY, which
-- cannot run inside a migration transaction.

-- --- Hot filters and sorts ------------------------------------------------

-- src/app/admin/registrations/[reference]/page.tsx reads the audit trail for
-- one registration on every detail view. The table had only its primary key,
-- so each view seq-scanned a table that grows with every status change.
create index if not exists registration_history_ref_idx
  on public.registration_history(registration_ref);

-- /admin/audit pages through this newest-first with count:'exact', and it is
-- appended to by every admin_operation plus two triggers. PK only until now.
create index if not exists audit_log_created_at_idx
  on public.audit_log(created_at desc);

-- src/app/admin/[section]/page.tsx sorts every section that has no special
-- case by created_at desc. contact_messages was indexed on submitted_at, which
-- that ORDER BY never touches, so the existing index could not be used.
create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at desc);
create index if not exists email_outbox_created_at_idx
  on public.email_outbox(created_at desc);
create index if not exists media_assets_created_at_idx
  on public.media_assets(created_at desc);

-- The certificates section sorts on issued_at.
create index if not exists certificates_issued_at_idx
  on public.certificates(issued_at desc);

-- --- Foreign keys without a supporting index ------------------------------
-- Unindexed referencing columns make every delete on the parent seq-scan the
-- child to enforce the constraint, and make joins from the parent slow.

create index if not exists audit_log_actor_idx
  on public.audit_log(actor);
create index if not exists contact_messages_assignee_idx
  on public.contact_messages(assignee);
create index if not exists content_entries_updated_by_idx
  on public.content_entries(updated_by);
create index if not exists content_revisions_actor_idx
  on public.content_revisions(actor);
create index if not exists event_archives_created_by_idx
  on public.event_archives(created_by);
create index if not exists media_assets_uploaded_by_idx
  on public.media_assets(uploaded_by);
create index if not exists participants_checked_in_by_idx
  on public.participants(checked_in_by);
create index if not exists registration_history_actor_idx
  on public.registration_history(actor);
create index if not exists registrations_duplicate_of_idx
  on public.registrations(duplicate_of);

-- --- Grants ---------------------------------------------------------------
-- Both are trigger functions with search_path pinned, so they are not usefully
-- callable directly -- but every other function in this schema is explicitly
-- restricted, and leaving two on the default PUBLIC grant makes the audit
-- output noisy enough that a real exposure could hide in it.
revoke execute on function public.audit_admin_tables() from public, anon, authenticated;
revoke execute on function public.normalize_participants() from public, anon, authenticated;
