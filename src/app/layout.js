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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check if we're in professional workspace
                  const isProfessional = window.location.pathname.includes('/professional');
                  
                  if (isProfessional) {
                    // Force dark theme for professional workspace
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark', 'professional-workspace');
                  } else {
                    // For all other pages, use saved theme or default to light
                    const savedTheme = localStorage.getItem('ui-theme') || 'light';
                    document.documentElement.classList.remove('dark', 'professional-workspace');
                    
                    if (savedTheme === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      document.documentElement.classList.add(systemTheme);
                    } else {
                      document.documentElement.classList.add(savedTheme);
                    }
                  }
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.classList.add('light');
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