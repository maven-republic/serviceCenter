'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { DM_Sans } from 'next/font/google'
import './globals.css'

import SupabaseProvider from '@/components/SupabaseProvider'
import SearchModal1 from '@/components/modal/SearchModal1'
import NavSidebar from '@/components/sidebar/NavSidebar'
import Loader from '@/components/loader/Loader'
import toggleStore from '@/store/toggleStore'
import 'react-tooltip/dist/react-tooltip.css'

// Setup Account Context
const AccountContext = createContext(null)

export function useAccount() {
  return useContext(AccountContext)
}

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

export default function RootLayout({ children }) {
  return (
    <SupabaseProvider>
      <InnerLayout>{children}</InnerLayout>
    </SupabaseProvider>
  )
}

// Handles session, account fetching
function InnerLayout({ children }) {
  const isListingActive = toggleStore((state) => state.isListingActive)
  const session = useSession()
  const supabase = useSupabaseClient()
  const [account, setAccount] = useState(null)

  useEffect(() => {
    if (!session || !session.user) {
      console.warn('⚠️ Session not ready yet...')
      return
    }

    const fetchAccount = async () => {
      console.log('🔍 Session user ID:', session?.user?.id)

      try {
        const { data, error } = await supabase
          .from('account')
          .select('*')
          .eq('account_id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('❌ Error fetching account:', error)
        } else if (!data) {
          console.warn('⚠️ No account found for user ID:', session.user.id)
        } else {
          console.log('✅ Successfully fetched account:', data)
          setAccount(data)
        }
      } catch (err) {
        console.error('🚨 Unexpected error fetching account:', err)
      }
    }

    fetchAccount()
  }, [session, supabase])

  return (
    <html lang="en">
      <body className={`${dmSans.className}`}>
        <Loader />
        <SearchModal1 />
        <AccountContext.Provider value={account}>
          {children}
        </AccountContext.Provider>
        <NavSidebar />
      </body>
    </html>
  )
}
