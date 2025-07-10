// src/app/layout.js
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export default async function InterfaceFoundation({ children }) {
  const cookieStore = await cookies()
  
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${dmSans.className} min-h-screen`}>
        <ClientProviders initialSession={session}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}