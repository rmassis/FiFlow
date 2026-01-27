import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rltcwcywjgeyzjypqiby.supabase.co';
const supabaseKey = 'sb_publishable_zEfsDzx40U_Yl29AvAYfHw_rnKjx-aZ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Supabase Diagnostic ---');
    console.log('Testing categories table...');
    const { data: cats, error: catError } = await supabase.from('categories').select('*').limit(1);

    if (catError) {
        console.error('Categories Error:', catError.code, catError.message, catError.hint);
    } else {
        console.log('Categories table exists. Count:', cats?.length);
    }

    console.log('\nTesting transactions table...');
    const { data: trans, error: transError } = await supabase.from('transactions').select('*').limit(1);

    if (transError) {
        console.error('Transactions Error:', transError.code, transError.message, transError.hint);
    } else {
        console.log('Transactions table exists. Count:', trans?.length);
    }
}

check().catch(console.error);
