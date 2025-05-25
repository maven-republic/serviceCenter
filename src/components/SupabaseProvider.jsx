'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/userStore'

export default function SupabaseProvider({ children }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())
  const fetchUser = useUserStore((state) => state.fetchUser)

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          console.log('💥 Rehydrating session from onAuthStateChange')
          fetchUser(session.user, supabaseClient)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabaseClient, fetchUser])

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
}
