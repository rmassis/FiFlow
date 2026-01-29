
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load from various possible .env locations
const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local')
];

envPaths.forEach(p => {
    if (fs.existsSync(p)) {
        const envConfig = dotenv.parse(fs.readFileSync(p));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
});

const supabaseUrl = process.env.SUPABASE_URL || 'https://rodri.supabase.co'; // Fallback if known
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
    console.log('--- Database Diagnostic (ESM) ---');

    const tables = ['transactions', 'categories', 'bank_accounts', 'credit_cards', 'budgets', 'goals'];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`Table ${table} Error:`, error.message);
            } else {
                console.log(`Table ${table} Count:`, count);
            }
        } catch (e) {
            console.log(`Table ${table} CRASH:`, e.message);
        }
    }

    console.log('\n--- Attempting Trial Insert ---');
    try {
        const { error: insertError } = await supabase.from('transactions').insert({
            date: '2026-01-28',
            description: 'Test Transaction',
            amount: 100,
            type: 'despesa',
            category: 'Outros'
        });

        if (insertError) {
            console.log('Insert FAILED:', JSON.stringify(insertError, null, 2));
        } else {
            console.log('Insert SUCCESS');
            // Cleanup
            await supabase.from('transactions').delete().eq('description', 'Test Transaction');
        }
    } catch (e) {
        console.log('Insert CRASH:', e.message);
    }
}

diagnostic();
