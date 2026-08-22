-- ─────────────────────────────────────────────────────────────────────────────
-- Owner admin: promote owner@skybordbank.com and force a password change.
--
-- What this does (idempotent, safe to re-run):
--   1. Adds profiles.must_change_password (default false) if missing.
--   2. Promotes owner@skybordbank.com to role 'admin' (active) and sets
--      must_change_password = true so admin-login.html forces a password
--      change on first sign in. The client clears the flag after
--      sb.auth.updateUser({password}) succeeds.
--
-- Ordered AFTER 009 (demotes all other admins) so this account ends up admin.
-- ─────────────────────────────────────────────────────────────────────────────

do $owner_admin$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'public.profiles does not exist yet — skipping 010.';
    return;
  end if;

  alter table public.profiles
    add column if not exists must_change_password boolean not null default false;

  update public.profiles
  set role = 'admin',
      status = 'active',
      must_change_password = true
  where email = 'owner@skybordbank.com';

  if not found then
    raise notice 'owner@skybordbank.com not found in profiles yet — register it first, then re-run this migration.';
  end if;
end;
$owner_admin$;
