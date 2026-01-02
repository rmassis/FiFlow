
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
} catch (e) { console.error(e); }

console.log(`URL: ${url}`);
// Não exibir a chave completa por segurança
console.log(`Key: ${key.substring(0, 10)}...`);

const supabase = createClient(url, key);

async function debug() {
    console.log('Tentando selecionar da tabela categories...');
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });

    console.log('status:', error ? 'Erro' : 'Sucesso');
    if (error) {
        console.log('Código do Erro:', error.code);
        console.log('Mensagem:', error.message);
        console.log('Detalhes:', error.details);
    } else {
        console.log('Data:', data);
    }
}

debug();
