// src/app/layout.js
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { createClient } from '@/utils/supabase/server'
import ClientProviders from '@/components/ClientProviders'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export default async function InterfaceFoundation({ children }) {
  // Get initial session safely
  let initialSession = null
  
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    initialSession = session
  } catch (error) {
    console.warn('Failed to get initial session in layout:', error.message)
    initialSession = null
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Minimal script - only prevent flash, let ThemeProvider handle themes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Only set a basic light theme to prevent flash
                  // ThemeProvider will handle the real theme logic
                  document.documentElement.classList.add('light');
                  console.log('🌟 Basic theme set, ThemeProvider will take over');
                } catch (e) {
                  console.warn('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${dmSans.className} min-h-screen bg-background text-foreground`}>
        <ClientProviders initialSession={initialSession}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}