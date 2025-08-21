import { createClient } from "@supabase/supabase-js";


export function supabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, serviceRole, { auth: { persistSession: false } });
}


export function supabaseAnon() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, anon, { auth: { persistSession: false } });
}