// src/utils/supabase/server.js - FIXED VERSION
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Async version for Server Components
export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Handle cookie setting errors gracefully
            console.warn('Failed to set cookie:', error)
          }
        },
      },
      auth: {
        // Disable automatic refresh on server
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}

// Synchronous version for API routes (RECOMMENDED)
export function createClientForAPI() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          // For API routes, we use a simpler approach
          return []
        },
        setAll: () => {
          // No-op for API routes since we can't modify cookies in most API responses
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}