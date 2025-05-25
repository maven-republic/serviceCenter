'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { createClient } from '@/utils/supabase/client'
import { DM_Sans } from 'next/font/google'
import './globals.css'

import SupabaseProvider from '@/components/SupabaseProvider'
import SearchModal1 from '@/components/modal/SearchModal1'
import NavSidebar from '@/components/sidebar/NavSidebar'
import Loader from '@/components/loader/Loader'
import toggleStore from '@/store/toggleStore'
import { useUserStore } from '@/store/userStore'

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

function InnerLayout({ children }) {
  const isListingActive = toggleStore((state) => state.isListingActive)
  const session = useSession()
  const supabase = useSupabaseClient()
  const fetchUser = useUserStore((s) => s.fetchUser)
  const hasFetchedUser = useRef(false)

  // 🧠 Primary hydration: useSession()
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!session?.user) {
      if (!hasFetchedUser.current) console.log('⏳ Waiting for session...')
      return
    }

    if (hasFetchedUser.current) return

    console.log('✅ session.user:', session.user)
    fetchUser(session.user, supabase)
    hasFetchedUser.current = true
  }, [session?.user])

  // 🔄 Optional fallback hydration
  useEffect(() => {
    if (typeof window === 'undefined') return

    const restoreSession = async () => {
      const client = createClient()
      const { data } = await client.auth.getSession()

      console.log('🔥 Manual fallback session:', data.session)

      if (data.session?.user && !hasFetchedUser.current) {
        fetchUser(data.session.user, client)
        hasFetchedUser.current = true
      }
    }

    if (!session?.user && !hasFetchedUser.current) {
      restoreSession()
    }
  }, [])

  return (
    <html lang="en">
      <body className={`${dmSans.className}`}>
        <Loader />
        <SearchModal1 />
        <AccountContext.Provider value={null}>
          {children}
        </AccountContext.Provider>
        <NavSidebar />
      </body>
    </html>
  )
}
