import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey &&
    supabaseUrl !== 'your_supabase_url' &&
    supabaseKey !== 'your_supabase_anon_key')

export function createClient() {
    if (!isSupabaseConfigured) {
        // Return a mock client for demo mode
        return null
    }

    return createBrowserClient<Database>(
        supabaseUrl!,
        supabaseKey!
    )
}
