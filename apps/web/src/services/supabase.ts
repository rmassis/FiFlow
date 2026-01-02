import { createClient } from '@supabase/supabase-js';

// As chaves devem estar no arquivo .env na raiz do projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL ou Key não encontrados. Verifique seu arquivo .env');
}

// Cria uma instância única do cliente para ser usada em toda a app
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
