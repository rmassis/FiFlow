
-- Create Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  cpf TEXT,
  phone TEXT,
  birth_date DATE,
  address_zip TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT DEFAULT 'Brasil',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create Bank Accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'corrente', 'poupanca', etc.
  bank TEXT,
  balance NUMERIC(15, 2) DEFAULT 0,
  agency TEXT,
  number TEXT,
  currency TEXT DEFAULT 'BRL',
  color TEXT,
  icon TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Bank Accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank accounts" 
ON public.bank_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts" 
ON public.bank_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" 
ON public.bank_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts" 
ON public.bank_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- Create Credit Cards table
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  network TEXT, -- 'visa', 'mastercard', etc.
  last_four_digits TEXT,
  credit_limit NUMERIC(15, 2) DEFAULT 0,
  used_limit NUMERIC(15, 2) DEFAULT 0,
  closing_day INTEGER,
  due_day INTEGER,
  color TEXT,
  icon TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Credit Cards
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit cards" 
ON public.credit_cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards" 
ON public.credit_cards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" 
ON public.credit_cards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" 
ON public.credit_cards FOR DELETE 
USING (auth.uid() = user_id);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE CASCADE NOT NULL,
  reference_month TEXT NOT NULL, -- 'YYYY-MM'
  closing_date DATE,
  due_date DATE,
  total_amount NUMERIC(15, 2) DEFAULT 0,
  paid_amount NUMERIC(15, 2) DEFAULT 0,
  remaining_amount NUMERIC(15, 2) DEFAULT 0,
  status TEXT, -- 'aberta', 'fechada', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices of own cards" 
ON public.invoices FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_cards 
    WHERE id = invoices.credit_card_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert invoices for own cards" 
ON public.invoices FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.credit_cards 
    WHERE id = invoices.credit_card_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update invoices of own cards" 
ON public.invoices FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_cards 
    WHERE id = invoices.credit_card_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete invoices of own cards" 
ON public.invoices FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_cards 
    WHERE id = invoices.credit_card_id 
    AND user_id = auth.uid()
  )
);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
