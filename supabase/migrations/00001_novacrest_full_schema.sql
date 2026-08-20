
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.account_type AS ENUM ('checking', 'savings', 'business');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'hold', 'release', 'admin_credit');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'held');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  role public.user_role NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_type public.account_type NOT NULL,
  account_number text UNIQUE NOT NULL,
  balance numeric(15,2) NOT NULL DEFAULT 0.00,
  available_balance numeric(15,2) NOT NULL DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_account_id uuid REFERENCES public.accounts(id),
  to_account_id uuid REFERENCES public.accounts(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  transaction_type public.transaction_type NOT NULL,
  amount numeric(15,2) NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  description text,
  reference_number text UNIQUE NOT NULL DEFAULT 'TXN-' || upper(substr(replace(uuid_generate_v4()::text,'-',''),1,12)),
  performed_by_admin uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HOLDS
-- ============================================================
CREATE TABLE public.holds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric(15,2) NOT NULL,
  reason text NOT NULL,
  is_released boolean NOT NULL DEFAULT false,
  placed_by_admin uuid NOT NULL REFERENCES public.profiles(id),
  released_by_admin uuid REFERENCES public.profiles(id),
  placed_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DEPOSIT REQUESTS
-- ============================================================
CREATE TABLE public.deposit_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  account_id uuid NOT NULL REFERENCES public.accounts(id),
  amount numeric(15,2) NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- WITHDRAWAL REQUESTS
-- ============================================================
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  account_id uuid NOT NULL REFERENCES public.accounts(id),
  amount numeric(15,2) NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ADMIN MESSAGES (Webmail inbox)
-- ============================================================
CREATE TABLE public.admin_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id uuid REFERENCES public.profiles(id),
  from_name text,
  from_email text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ACCOUNT NUMBER GENERATOR
-- ============================================================
CREATE OR REPLACE FUNCTION generate_account_number(acct_type public.account_type)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  prefix text;
  num text;
BEGIN
  prefix := CASE acct_type
    WHEN 'checking' THEN 'CHK'
    WHEN 'savings'  THEN 'SAV'
    WHEN 'business' THEN 'BIZ'
  END;
  num := prefix || '-' || lpad(floor(random() * 9000000000 + 1000000000)::text, 10, '0');
  RETURN num;
END;
$$;

-- ============================================================
-- HANDLE NEW USER TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');

  -- Auto-create three accounts for new users
  INSERT INTO public.accounts (user_id, account_type, account_number)
  VALUES
    (NEW.id, 'checking', generate_account_number('checking')),
    (NEW.id, 'savings',  generate_account_number('savings')),
    (NEW.id, 'business', generate_account_number('business'));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROLE HELPER (SECURITY DEFINER to avoid RLS self-loop)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- ============================================================
-- PROFILES RLS
-- ============================================================
CREATE POLICY "Admins full access to profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

-- ============================================================
-- ACCOUNTS RLS
-- ============================================================
CREATE POLICY "Admins full access to accounts"
  ON public.accounts FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS RLS
-- ============================================================
CREATE POLICY "Admins full access to transactions"
  ON public.transactions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HOLDS RLS
-- ============================================================
CREATE POLICY "Admins full access to holds"
  ON public.holds FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own holds"
  ON public.holds FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- DEPOSIT REQUESTS RLS
-- ============================================================
CREATE POLICY "Admins full access to deposit_requests"
  ON public.deposit_requests FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own deposit_requests"
  ON public.deposit_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own deposit_requests"
  ON public.deposit_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WITHDRAWAL REQUESTS RLS
-- ============================================================
CREATE POLICY "Admins full access to withdrawal_requests"
  ON public.withdrawal_requests FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own withdrawal_requests"
  ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own withdrawal_requests"
  ON public.withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS RLS
-- ============================================================
CREATE POLICY "Admins full access to notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ADMIN MESSAGES RLS
-- ============================================================
CREATE POLICY "Admins full access to admin_messages"
  ON public.admin_messages FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can insert admin_messages"
  ON public.admin_messages FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can insert admin_messages"
  ON public.admin_messages FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- PUBLIC PROFILES VIEW
-- ============================================================
CREATE VIEW public.public_profiles AS
  SELECT id, full_name, role FROM public.profiles;
