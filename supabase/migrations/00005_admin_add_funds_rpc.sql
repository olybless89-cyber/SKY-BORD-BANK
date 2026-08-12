
-- Admin RPC: add funds to any user's bank account
-- Called only by admin users (enforced by RLS + role check inside function)
CREATE OR REPLACE FUNCTION admin_add_funds(
  p_account_id  UUID,
  p_amount      NUMERIC,
  p_note        TEXT DEFAULT 'Admin deposit'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_account     bank_accounts%ROWTYPE;
  v_new_balance NUMERIC;
BEGIN
  -- Check caller is admin
  SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Lock and fetch account
  SELECT * INTO v_account FROM bank_accounts WHERE id = p_account_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;

  v_new_balance := v_account.balance + p_amount;

  -- Update balance
  UPDATE bank_accounts SET balance = v_new_balance WHERE id = p_account_id;

  -- Record transaction
  INSERT INTO transactions (
    account_id, type, status, amount, currency, description
  ) VALUES (
    p_account_id, 'deposit', 'completed', p_amount, v_account.currency, p_note
  );

  RETURN json_build_object(
    'success',      true,
    'new_balance',  v_new_balance,
    'currency',     v_account.currency
  );
END;
$$;

-- Grant execute to authenticated users (role check is inside the function)
GRANT EXECUTE ON FUNCTION admin_add_funds(UUID, NUMERIC, TEXT) TO authenticated;
