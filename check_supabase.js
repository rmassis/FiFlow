import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const check = async () => {
    console.log('Checking categories table...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Categories data:', data);
    }

    console.log('Checking transactions table...');
    const { data: tData, error: tError } = await supabase.from('transactions').select('*').limit(1);
    if (tError) {
        console.error('Transactions Supabase Error:', tError);
    } else {
        console.log('Transactions data:', tData);
    }
};

check();
