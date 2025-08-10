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
        defaultTheme="light" // Default theme
        storageKey="ui-theme" // General storage key
        professionalStorageKey="professional-ui-theme" // Professional workspace storage
      >
        {children}
      </ThemeProvider>
    </SessionContextProvider>
  )
}