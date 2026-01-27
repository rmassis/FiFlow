
import { createClient } from '@supabase/supabase-js';

// Fallback values for immediate fix
const FALLBACK_URL = "https://rltcwcywjgeyzjypqiby.supabase.co";
const FALLBACK_KEY = "sb_publishable_zEfsDzx40U_Yl29AvAYfHw_rnKjx-aZ";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || FALLBACK_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY");
} else {
    console.log("Supabase Client Initialized", { url: supabaseUrl });
}

export const supabase = createClient(supabaseUrl, supabaseKey);
