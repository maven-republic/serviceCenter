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
  // Get initial session safely without causing rate limits
  let initialSession = null
  
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    initialSession = session
  } catch (error) {
    console.warn('Failed to get initial session in layout:', error.message)
    // Don't throw - let the app load without initial session
    initialSession = null
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${dmSans.className} min-h-screen bg-background text-foreground`}>
        <ClientProviders initialSession={initialSession}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}