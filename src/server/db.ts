
import { createClient } from "@supabase/supabase-js";

export type Env = {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    OPENAI_API_KEY?: string;
};

export const createSupabaseClient = (env: Env, accessToken?: string) => {
    const options: any = {};
    if (accessToken) {
        options.global = {
            headers: {
                Authorization: accessToken,
            },
        };
    }
    return createClient(env.SUPABASE_URL, env.SUPABASE_KEY, options);
};
