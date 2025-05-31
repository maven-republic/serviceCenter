'use client'

import { useState, useEffect } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function SupabaseProvider({ children, initialSession }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())
  const [isHydrated, setIsHydrated] = useState(false)

  // 🔄 Handle hydration and quick reloads
  useEffect(() => {
    // Small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 🛡️ Prevent hydration mismatch on quick reloads
  if (!isHydrated) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-secondary" role="status" />
        <p className="mt-2">Initializing...</p>
      </div>
    )
  }

  return (
    <SessionContextProvider 
      supabaseClient={supabaseClient} 
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  )
}