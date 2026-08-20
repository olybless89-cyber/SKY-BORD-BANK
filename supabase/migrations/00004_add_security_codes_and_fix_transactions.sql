
-- Security codes table (PIN, IMF, COT, TAC)
CREATE TABLE IF NOT EXISTS security_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_type text NOT NULL CHECK (code_type IN ('PIN','IMF','COT','TAC')),
  code text NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  issued_by uuid REFERENCES profiles(id),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE security_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admin_all_security_codes" ON security_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can only read their own unused codes
CREATE POLICY "user_read_own_security_codes" ON security_codes
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own codes as used
CREATE POLICY "user_update_own_security_codes" ON security_codes
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add transaction_pin column to profiles (optional per-user PIN)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS transaction_pin text;
