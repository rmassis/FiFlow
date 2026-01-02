
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

let url = '';
let key = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (urlMatch) url = urlMatch[1].trim();
    if (keyMatch) key = keyMatch[1].trim();
} catch (e) {
    console.error('Erro ao ler .env:', e);
}

if (!url || !key) {
    console.error('❌ Credenciais não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkTable(tableName) {
    const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
    if (error && error.code === '42P01') {
        return false;
    }
    return true;
}

async function checkAll() {
    console.log('🔍 Auditoria de Tabelas no Supabase...\n');

    const tables = [
        'categories',
        'transactions',
        'budgets',
        'goals',
        'accounts',
        'credit_cards',
        'investments'
    ];

    const missing = [];

    for (const table of tables) {
        process.stdout.write(`Verificando '${table}'... `);
        const exists = await checkTable(table);
        if (exists) {
            console.log('✅ OK');
        } else {
            console.log('❌ Ausente');
            missing.push(table);
        }
    }

    console.log('\n-----------------------------------');
    if (missing.length === 0) {
        console.log('🎉 Todas as tabelas estão criadas!');
    } else {
        console.log(`⚠️  Tabelas faltando: ${missing.join(', ')}`);
        console.log('👉 Vou gerar o SQL para criar as tabelas faltantes.');
    }
}

checkAll();
