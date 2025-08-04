// src/components/ClientProviders.jsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { ThemeProvider } from '@/components/theme-provider'

export default function ClientProviders({ children, initialSession }) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="light" // CHANGED: Set to light instead of dark
        enableSystem={true} // Allow system theme option
        disableTransitionOnChange={false} // Allow smooth transitions
        storageKey="ui-theme"
      >
        {children}
      </ThemeProvider>
    </SessionContextProvider>
  )
}