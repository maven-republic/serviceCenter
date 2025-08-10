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
                  const pathname = window.location.pathname;
                  
                  // Remove any existing theme classes
                  document.documentElement.classList.remove('light', 'dark', 'professional-workspace', 'customer-workspace');
                  
                  if (pathname.includes('/professional')) {
                    // 🔒 PROFESSIONAL WORKSPACE - Force dark theme
                    document.documentElement.classList.add('dark', 'professional-workspace');
                    console.log('🏢 Applied professional workspace theme (dark)');
                    
                  } else if (pathname.includes('/customer')) {
                    // 🔒 CUSTOMER WORKSPACE - Force light theme (white background)
                    document.documentElement.classList.add('light', 'customer-workspace');
                    console.log('👤 Applied customer workspace theme (white)');
                    
                  } else {
                    // 🌍 PUBLIC AREAS - Use saved theme or default to light
                    const savedTheme = localStorage.getItem('ui-theme') || 'light';
                    
                    if (savedTheme === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      document.documentElement.classList.add(systemTheme);
                      console.log('🌓 Applied system theme:', systemTheme);
                    } else {
                      document.documentElement.classList.add(savedTheme);
                      console.log('🎨 Applied saved theme:', savedTheme);
                    }
                  }
                } catch (e) {
                  console.warn('Theme initialization error:', e);
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