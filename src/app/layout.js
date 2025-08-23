// =====  (src/app/layout.js) =====
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { createClient } from '@/utils/supabase/server'
import ClientProviders from '@/components/ClientProviders'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

// CRITICAL: Add metadata for mobile viewport
export const metadata = {
  title: 'Service Center',
  description: 'Professional services marketplace',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

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
        {/* CRITICAL: Explicit mobile viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        
        {/* Prevent zoom on input focus for iOS */}
        <meta name="format-detection" content="telephone=no" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const pathname = window.location.pathname;
                  
                  // Remove any existing theme classes
                  document.documentElement.classList.remove('light', 'dark', 'professional-workspace', 'customer-workspace');
                  
                  if (pathname.includes('/customer') || pathname === '/browse-services' || pathname.startsWith('/browse')) {
                    // 👤 CUSTOMER WORKSPACE + BROWSE PAGES - Force light theme (white background)
                    if (pathname.includes('/customer')) {
                      document.documentElement.classList.add('light', 'customer-workspace');
                      console.log('👤 Applied customer workspace theme (white)');
                    } else {
                      document.documentElement.classList.add('light');
                      console.log('🔍 Applied light theme for browse pages');
                    }
                    
                  } else if (pathname.includes('/professional')) {
                    // 🏢 PROFESSIONAL WORKSPACE - Add workspace class, default to light
                    document.documentElement.classList.add('professional-workspace');
                    
                    // Load professional workspace theme or DEFAULT TO LIGHT
                    const professionalTheme = localStorage.getItem('professional-ui-theme') || 'light';
                    
                    if (professionalTheme === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      document.documentElement.classList.add(systemTheme);
                      console.log('🏢 Applied professional system theme:', systemTheme);
                    } else {
                      document.documentElement.classList.add(professionalTheme);
                      console.log('🏢 Applied professional theme:', professionalTheme);
                    }
                    
                  } else {
                    // 🌍 PUBLIC AREAS - Use saved theme or default to light
                    const savedTheme = localStorage.getItem('ui-theme') || 'light';
                    
                    if (savedTheme === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      document.documentElement.classList.add(systemTheme);
                      console.log('🌎 Applied system theme:', systemTheme);
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
      <body className={`${dmSans.className} min-h-screen bg-background text-foreground antialiased`}>
        <ClientProviders initialSession={initialSession}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}