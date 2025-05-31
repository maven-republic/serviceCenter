// src/app/layout.js
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { DM_Sans } from 'next/font/google'
import './globals.css'

import SupabaseProvider from '@/components/SupabaseProvider'
import SearchModal1 from '@/components/modal/SearchModal1'
import NavSidebar from '@/components/sidebar/NavSidebar'
import Loader from '@/components/loader/Loader'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export default async function RootLayout({ children }) {
  // 🔧 FIX: Await cookies() to prevent the sync API error
  const cookieStore = await cookies()
  
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={`${dmSans.className}`}>
        <SupabaseProvider initialSession={session}>
          <Loader />
          <SearchModal1 />
          {children}
          <NavSidebar />
        </SupabaseProvider>
      </body>
    </html>
  )
}