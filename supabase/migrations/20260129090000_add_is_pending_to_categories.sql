-- Add is_pending column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_pending BOOLEAN DEFAULT false;
