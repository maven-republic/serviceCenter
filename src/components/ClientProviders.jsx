// src/components/ClientProviders.jsx - FIXED
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { ThemeProvider } from '@/components/theme-provider'

export default function ClientProviders({ children, initialSession }) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  // Debug logging
  console.log('🔑 ClientProviders session:', { 
    hasInitialSession: !!initialSession,
    sessionEmail: initialSession?.user?.email,
    sessionId: initialSession?.user?.id
  })

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <ThemeProvider
        defaultTheme="light"
        storageKey="ui-theme"
        professionalStorageKey="professional-ui-theme"
      >
        {children}
      </ThemeProvider>
    </SessionContextProvider>
  )
}