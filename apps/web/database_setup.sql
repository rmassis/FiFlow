-- 1. Habilitar UUIDs (Identificadores únicos)
create extension if not exists "uuid-ossp";

-- 2. Tabela de Categorias
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- 3. Tabela de Transações
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('INCOME', 'EXPENSE')) not null,
  category text not null,
  date date not null,
  status text default 'PAID',
  account text,
  created_at timestamptz default now()
);

-- 4. Tabela de Orçamentos
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references categories(id),
  planned numeric default 0,
  actual numeric default 0,
  created_at timestamptz default now()
);

-- 5. Tabela de Metas (Goals)
create table if not exists goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target numeric not null,
  current numeric default 0,
  deadline timestamptz,
  created_at timestamptz default now()
);

-- 6. Tabela de Contas Bancárias (Accounts)
create table if not exists accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  bankName text,
  type text,
  balance numeric default 0,
  accountNumber text,
  color text,
  created_at timestamptz default now()
);

-- 7. Tabela de Cartões de Crédito (Credit Cards)
create table if not exists credit_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  brand text,
  lastDigits text,
  "limit" numeric default 0,
  usedLimit numeric default 0,
  currentInvoice numeric default 0,
  closingDay integer,
  dueDay integer,
  color text,
  created_at timestamptz default now()
);

-- 8. Tabela de Investimentos
create table if not exists investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  symbol text,
  type text,
  value numeric default 0,
  change24h numeric default 0,
  allocation numeric default 0,
  created_at timestamptz default now()
);

-- 9. Habilitar Segurança (RLS - Row Level Security) para todas
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table accounts enable row level security;
alter table credit_cards enable row level security;
alter table investments enable row level security;

-- 10. Criar Políticas de Acesso (Dono vê tudo, outros não veem nada)
-- (Usamos DO block para evitar erro se política ja existir, ou drop/create)
drop policy if exists "Manage categories" on categories;
create policy "Manage categories" on categories for all using (auth.uid() = user_id);

drop policy if exists "Manage transactions" on transactions;
create policy "Manage transactions" on transactions for all using (auth.uid() = user_id);

drop policy if exists "Manage budgets" on budgets;
create policy "Manage budgets" on budgets for all using (auth.uid() = user_id);

drop policy if exists "Manage goals" on goals;
create policy "Manage goals" on goals for all using (auth.uid() = user_id);

drop policy if exists "Manage accounts" on accounts;
create policy "Manage accounts" on accounts for all using (auth.uid() = user_id);

drop policy if exists "Manage credit_cards" on credit_cards;
create policy "Manage credit_cards" on credit_cards for all using (auth.uid() = user_id);

drop policy if exists "Manage investments" on investments;
create policy "Manage investments" on investments for all using (auth.uid() = user_id);
