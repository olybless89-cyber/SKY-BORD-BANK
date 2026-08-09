
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@skybordbank.com';

  IF admin_id IS NULL THEN
    -- Create the admin auth user; PIN 1234 → password skb_1234
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, role, aud, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    )
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@skybordbank.com',
      crypt('skb_1234', gen_salt('bf')),
      now(),
      jsonb_build_object(
        'first_name', 'Admin',
        'last_name', 'SKY-BORD',
        'username', 'admin',
        'login_pin', '1234'
      ),
      'authenticated', 'authenticated',
      now(), now(),
      '', '', '', ''
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Ensure profile exists and is admin
  INSERT INTO public.profiles (id, email, role, first_name, last_name, username, login_pin)
  VALUES (admin_id, 'admin@skybordbank.com', 'admin'::public.user_role, 'Admin', 'SKY-BORD', 'admin', '1234')
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;

END $$;
