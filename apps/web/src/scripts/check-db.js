
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Caminho para o .env na raiz do apps/web
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

async function check() {
    console.log('🔍 Verificando conexão com Supabase...');

    // Tenta fazer um select simples na tabela de categorias
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') {
            console.log('❌ Tabela "categories" NÃO encontrada.');
            console.log('⚠️  IMPORTANTE: Você precisa ir no Supabase > SQL Editor e rodar o script de criação das tabelas.');
            process.exit(1);
        } else {
            console.log('❌ Erro de conexão:', error.message);
            process.exit(1);
        }
    } else {
        console.log('✅ Conexão bem sucedida! Tabelas encontradas.');
        process.exit(0);
    }
}

check();
