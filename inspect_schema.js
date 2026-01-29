import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

// Read from .dev.vars (manually parsing since it's just a few lines)
const envVars = fs.readFileSync('.dev.vars', 'utf8');
const SUPABASE_URL = envVars.match(/SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = envVars.match(/SUPABASE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log("Checking columns for 'categories' table...");
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Current user:", user?.id);

    const { data, error } = await supabase.from('categories').select('*').limit(1);

    if (error) {
        console.error("Error fetching categories:", error);
    } else {
        console.log("Existing category record keys:", data.length > 0 ? Object.keys(data[0]) : "No records");
    }

    console.log("\nTesting Insert WITHOUT is_pending...");
    const testCat = {
        name: "Test Root " + Date.now(),
        type: "despesa",
        user_id: user?.id
    };
    const { error: err1 } = await supabase.from('categories').insert(testCat);
    console.log("Insert 1 Error:", err1?.message || "Success");

    console.log("\nTesting Insert WITH is_pending...");
    const testCat2 = {
        name: "Test Pending " + Date.now(),
        type: "despesa",
        user_id: user?.id,
        is_pending: true
    };
    const { error: err2 } = await supabase.from('categories').insert(testCat2);
    console.log("Insert 2 Error:", err2?.message || "Success");
}

checkSchema();
