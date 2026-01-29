
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rltcwcywjgeyzjypqiby.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEfsDzx40U_Yl29AvAYfHw_rnKjx-aZ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const check = async () => {
    console.log('--- Testing SELECT ---');
    const { data, error } = await supabase.from('categories').select('*').limit(5);
    if (error) {
        console.error('Error selecting:', error);
    } else {
        console.log('Categories:', data);
    }

    console.log('--- Testing INSERT ---');
    const { error: insErr } = await supabase.from('categories').insert({
        name: 'Test Category ' + Date.now(),
        type: 'despesa'
    });
    if (insErr) {
        console.error('Insert Error:', insErr);
    } else {
        console.log('Insert success!');
    }
};

check();
