-- Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'receita', 'despesa'
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- NULL = Category, NOT NULL = Subcategory
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" 
ON public.categories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" 
ON public.categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
ON public.categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
ON public.categories FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
