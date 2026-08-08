
-- 1. Ensure admin role can do everything on profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='admin_all_profiles') THEN
    CREATE POLICY admin_all_profiles ON profiles FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 2. Admin full access to bank_accounts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bank_accounts' AND policyname='admin_all_accounts') THEN
    CREATE POLICY admin_all_accounts ON bank_accounts FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 3. Admin full access to transactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='transactions' AND policyname='admin_all_transactions') THEN
    CREATE POLICY admin_all_transactions ON transactions FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 4. Admin full access to kyc_documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kyc_documents' AND policyname='admin_all_kyc') THEN
    CREATE POLICY admin_all_kyc ON kyc_documents FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 5. Admin full access to investments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investments' AND policyname='admin_all_investments') THEN
    CREATE POLICY admin_all_investments ON investments FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 6. Admin full access to contact_messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_messages' AND policyname='admin_all_contact') THEN
    CREATE POLICY admin_all_contact ON contact_messages FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 7. Admin access to newsletter_subscribers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='newsletter_subscribers' AND policyname='admin_all_newsletter') THEN
    CREATE POLICY admin_all_newsletter ON newsletter_subscribers FOR ALL TO authenticated
      USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- 8. SECURITY DEFINER helper to get role without RLS loop
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

-- 9. Add email_log table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email_to    text NOT NULL,
  email_type  text NOT NULL, -- 'welcome', 'login_alert', 'transfer', 'kyc_update'
  subject     text,
  status      text NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_email_logs ON email_logs FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Service role can insert logs
CREATE POLICY service_insert_email_logs ON email_logs FOR INSERT TO service_role WITH CHECK (true);

-- 10. Add notification_sent flag to kyc_documents for email dedup
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS admin_notes text;
