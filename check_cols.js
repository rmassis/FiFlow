
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rltcwcywjgeyzjypqiby.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEfsDzx40U_Yl29AvAYfHw_rnKjx-aZ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const check = async () => {
    // Try to get one row from categories, even if empty, to see columns? 
    // Actually, let's try to insert with a known UUID to satisfy RLS if we know one, 
    // but we don't.

    // Let's try to get schema info via RPC if available, or just check the error message 
    // when we try to insert a fake column.

    console.log('--- Checking Columns via fake insert ---');
    const { error: colErr } = await supabase.from('categories').insert({
        name: 'Test',
        type: 'despesa',
        user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
        non_existent_column: 'value'
    });
    console.log('Error with fake column:', colErr?.message);

    console.log('--- Checking if is_pending exists ---');
    const { error: pendErr } = await supabase.from('categories').insert({
        name: 'Test',
        type: 'despesa',
        user_id: '00000000-0000-0000-0000-000000000000',
        is_pending: true
    });
    console.log('Error with is_pending:', pendErr?.message);
};

check();
