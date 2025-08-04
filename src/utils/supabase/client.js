'use client';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Global singleton instance
let clientInstance = null

// Simple session cache to reduce API calls
let sessionCache = {
  session: null,
  timestamp: 0,
  ttl: 10000 // 10 seconds cache
}

// Auth state listeners
let authListeners = []

export function createClient() {
  // Return existing instance if it exists
  if (clientInstance) {
    return clientInstance
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  console.log('🔧 Creating new Supabase client instance')

  // Create the client with standard configuration
  clientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })

  // Set up auth state change listener once
  clientInstance.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user')
    
    // Update cache when auth state changes
    sessionCache.session = session
    sessionCache.timestamp = Date.now()
    
    // Notify any listeners
    authListeners.forEach(listener => {
      try {
        listener(event, session)
      } catch (error) {
        console.error('Auth listener error:', error)
      }
    })
  })

  console.log('✅ Supabase client created successfully')
  return clientInstance
}

// Enhanced session getter with caching
export async function getSession() {
  try {
    const supabase = createClient()
    const now = Date.now()
    
    // Return cached session if it's fresh
    if (sessionCache.session && (now - sessionCache.timestamp) < sessionCache.ttl) {
      console.log('📋 Returning cached session')
      return sessionCache.session
    }
    
    console.log('🔍 Fetching fresh session')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session fetch error:', error)
      return null
    }
    
    // Update cache
    sessionCache.session = session
    sessionCache.timestamp = now
    
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

// Enhanced user getter with caching
export async function getUser() {
  try {
    const session = await getSession()
    return session?.user || null
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

// Auth state listener manager
export function onAuthStateChange(callback) {
  authListeners.push(callback)
  
  // Return unsubscribe function
  return () => {
    const index = authListeners.indexOf(callback)
    if (index > -1) {
      authListeners.splice(index, 1)
    }
  }
}

// Sign out function
export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { error }
    }
    
    // Clear cache
    sessionCache.session = null
    sessionCache.timestamp = 0
    
    console.log('✅ Successfully signed out')
    return { error: null }
  } catch (error) {
    console.error('Sign out failed:', error)
    return { error }
  }
}

// Sign in function
export async function signInWithPassword(credentials) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    
    if (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
    
    // Update cache immediately
    if (data?.session) {
      sessionCache.session = data.session
      sessionCache.timestamp = Date.now()
    }
    
    console.log('✅ Successfully signed in:', data.user?.email)
    return { data, error: null }
  } catch (error) {
    console.error('Sign in failed:', error)
    return { data: null, error }
  }
}

// Refresh session function
export async function refreshSession() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Session refresh error:', error)
      return { data: null, error }
    }
    
    // Update cache
    if (data?.session) {
      sessionCache.session = data.session
      sessionCache.timestamp = Date.now()
    }
    
    console.log('✅ Session refreshed successfully')
    return { data, error: null }
  } catch (error) {
    console.error('Session refresh failed:', error)
    return { data: null, error }
  }
}

// Clear session cache (useful for testing)
export function clearSessionCache() {
  sessionCache.session = null
  sessionCache.timestamp = 0
  console.log('🗑️ Session cache cleared')
}

// Debug function to check client state
export function debugClient() {
  console.log('🔍 Supabase Client Debug:', {
    hasInstance: !!clientInstance,
    cacheAge: Date.now() - sessionCache.timestamp,
    hasSession: !!sessionCache.session,
    userEmail: sessionCache.session?.user?.email,
    listenersCount: authListeners.length
  })
  
  return {
    hasInstance: !!clientInstance,
    cacheAge: Date.now() - sessionCache.timestamp,
    hasSession: !!sessionCache.session,
    userEmail: sessionCache.session?.user?.email,
    listenersCount: authListeners.length
  }
}

// Reset client instance (useful for testing)
export function resetClient() {
  console.log('🔄 Resetting Supabase client')
  clientInstance = null
  sessionCache.session = null
  sessionCache.timestamp = 0
  authListeners = []
}

// Export the client instance directly for advanced usage
export { clientInstance }
