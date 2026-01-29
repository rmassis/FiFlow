
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rltcwcywjgeyzjypqiby.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEfsDzx40U_Yl29AvAYfHw_rnKjx-aZ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const check = async () => {
    console.log('--- Checking Columns of transactions ---');
    const { error: colErr } = await supabase.from('transactions').insert({
        date: '2026-01-28',
        description: 'Test',
        amount: 0,
        type: 'despesa',
        user_id: '00000000-0000-0000-0000-000000000000'
    });
    console.log('Error with user_id in transactions:', colErr?.message);
};

check();
