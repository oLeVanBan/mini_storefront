'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase browser client for Client Components.
 * Uses anon key — respects RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
