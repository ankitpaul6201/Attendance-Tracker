// Using @supabase/supabase-js directly (not ssr) so sessions are stored in
// localStorage — this is required for Capacitor/mobile apps where cookies
// are not persisted between app restarts.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export const createSupabaseClient = (): SupabaseClient => {
    if (client) return client;

    client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,        // save session to localStorage
                autoRefreshToken: true,     // auto-refresh before expiry
                detectSessionInUrl: true,   // handle OAuth redirect
                storageKey: 'attendance-tracker-auth', // unique key to avoid conflicts
            },
        }
    );

    return client;
};
