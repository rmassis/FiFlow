
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.dev.vars' });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || ''
);

async function verifyRLS() {
    console.log("--- Verificando RLS e Tabelas ---");

    const tables = ['profiles', 'categories', 'bank_accounts', 'credit_cards', 'transactions'];

    for (const table of tables) {
        // Tentamos inserir um dado sem estar logado (o cliente usa o KEY anon que deve disparar o RLS se ativo)
        // Como não estamos logados, o auth.uid() será NULL. Se o RLS estiver ativo e a política for auth.uid() = id/user_id, o INSERT deve falhar ou retornar erro 42501.

        console.log(`\nVerificando tabela: ${table}`);
        const { error } = await supabase.from(table).insert({ name: 'Teste RLS' }).select();

        if (error) {
            console.log(`Status ${table}: Erro esperado/RLS Ativo (Code: ${error.code})`);
            console.log(`Mensagem: ${error.message}`);
        } else {
            console.warn(`AVISO: Consegui inserir na tabela ${table} sem login. RLS pode estar desativado ou política aberta!`);
        }
    }
}

verifyRLS();
