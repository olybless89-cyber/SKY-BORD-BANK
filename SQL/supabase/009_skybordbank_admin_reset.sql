-- ─────────────────────────────────────────────────────────────────────────────
-- SkyBordBank rebrand: reset admin credentials.
--
-- What this does (idempotent, safe to re-run):
--   1. Demotes every existing admin back to a regular user (the "reset").
--   2. Promotes the freshly created admin account admin@skybordbank.com to
--      role 'admin' and makes sure the account is active (the "recreate").
--
-- The account itself (email/password) is created through the site's public
-- registration endpoint; this migration only flips its role. It is a no-op
-- until the account exists.
--
-- Apply: run in the Supabase Dashboard SQL editor (Dashboard ▸ SQL Editor ▸
-- New query), or let the "Run Supabase Migrations" GitHub Action apply it if
-- SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF secrets are configured.
-- ─────────────────────────────────────────────────────────────────────────────

do $admin_reset$
declare
  new_admin_id uuid;
begin
  select id into new_admin_id
  from public.profiles
  where email = 'admin@skybordbank.com';

  if new_admin_id is null then
    raise notice 'admin@skybordbank.com not found in profiles yet — register it first, then re-run this migration.';
    return;
  end if;

  -- 1) Reset: demote every other admin to a regular user.
  update public.profiles
  set role = 'user'
  where role = 'admin'
    and id <> new_admin_id;

  -- 2) Recreate: elevate the new admin and ensure it is active.
  update public.profiles
  set role = 'admin',
      status = 'active'
  where id = new_admin_id;

  raise notice 'Admin reset complete: % is now the sole admin', new_admin_id;
end;
$admin_reset$;
