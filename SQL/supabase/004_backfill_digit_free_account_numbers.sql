-- 004_backfill_digit_free_account_numbers.sql
-- Idempotent. Safe to run in the Supabase SQL editor any number of times.
--
-- Background: migration 003 made `handle_new_user` mint letters-only
-- (digit-free) account numbers for NEW signups. But users created BEFORE 003
-- was applied still carry the old `MV` + 8 random DIGITS format (e.g.
-- MV26121579). The UI now surfaces the real account_number in the dashboard
-- and admin "All Users" table, so those legacy digit-bearing numbers are
-- visible again and break the "no digits in account number" requirement.
--
-- This migration normalizes every existing profile whose account_number
-- still contains a digit into a fresh letters-only `MV` + 8 lowercase letters
-- value, retrying until it does not collide with an existing account_number.

do $$
declare
  r record;
  acct text;
begin
  for r in select id from public.profiles where account_number ~ '[0-9]' loop
    loop
      acct := 'MV';
      for i in 1..8 loop
        acct := acct || chr(97 + floor(random() * 26)::int);  -- 'a'..'z'
      end loop;
      exit when not exists (select 1 from public.profiles where account_number = acct);
    end loop;
    update public.profiles set account_number = acct, updated_at = now() where id = r.id;
  end loop;
end;
$$;

-- Verify: every account_number is now digits-free.
-- select email, account_number, (account_number ~ '[0-9]') as has_digits
--   from public.profiles order by email;
