
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.account_type AS ENUM ('savings', 'checking', 'corporate', 'student', 'joint', 'fixed');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'interest');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.investment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table (synced from auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  role public.user_role NOT NULL DEFAULT 'user',
  first_name text,
  last_name text,
  username text UNIQUE,
  gender text,
  dob date,
  country text,
  login_pin text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Bank accounts
CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_number text UNIQUE NOT NULL,
  account_type public.account_type NOT NULL DEFAULT 'savings',
  currency text NOT NULL DEFAULT 'USD',
  balance numeric(15,2) NOT NULL DEFAULT 0.00,
  branch text,
  apy numeric(5,2) DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  recipient_account text,
  reference text UNIQUE NOT NULL DEFAULT 'TXN-' || upper(substring(uuid_generate_v4()::text, 1, 12)),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Investments
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  amount numeric(15,2) NOT NULL,
  roi_percent numeric(6,2) NOT NULL,
  roi_type text NOT NULL DEFAULT 'total',
  duration_days integer NOT NULL,
  status public.investment_status NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- KYC documents
CREATE TABLE public.kyc_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_card_type text NOT NULL,
  front_url text,
  back_url text,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contact messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Function: auto-generate account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS text AS $$
DECLARE
  num text;
BEGIN
  num := 'SKB' || lpad(floor(random() * 10000000000)::bigint::text, 10, '0');
  RETURN num;
END;
$$ LANGUAGE plpgsql;

-- Trigger: set account_number on insert
CREATE OR REPLACE FUNCTION set_account_number()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
    NEW.account_number := generate_account_number();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER before_insert_bank_account
  BEFORE INSERT ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION set_account_number();

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER kyc_documents_updated_at BEFORE UPDATE ON public.kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user signup: sync to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role,
    first_name, last_name, username, gender, dob, country, login_pin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'user'::public.user_role,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'dob')::date,
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'login_pin'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: get user role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- Helper: get user's primary account id
CREATE OR REPLACE FUNCTION public.get_user_account_id(uid uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.bank_accounts WHERE user_id = uid ORDER BY created_at LIMIT 1;
$$;

-- ============ RLS POLICIES ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Admin full access to profiles" ON public.profiles FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

-- bank_accounts
CREATE POLICY "Admin full access to accounts" ON public.bank_accounts FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users view own accounts" ON public.bank_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own accounts" ON public.bank_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own accounts" ON public.bank_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "Admin full access to transactions" ON public.transactions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT TO authenticated
  USING (account_id IN (SELECT id FROM public.bank_accounts WHERE user_id = auth.uid()));
CREATE POLICY "Users insert own transactions" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (account_id IN (SELECT id FROM public.bank_accounts WHERE user_id = auth.uid()));

-- investments
CREATE POLICY "Admin full access to investments" ON public.investments FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users view own investments" ON public.investments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- kyc_documents
CREATE POLICY "Admin full access to kyc" ON public.kyc_documents FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Users view own kyc" ON public.kyc_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own kyc" ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- contact_messages: anyone can insert, admin can view
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin views contact messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- newsletter: anyone can subscribe
CREATE POLICY "Anyone can subscribe newsletter" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin views newsletter" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

-- Public profiles view
CREATE VIEW public.public_profiles AS SELECT id, role, first_name, last_name, username FROM public.profiles;
