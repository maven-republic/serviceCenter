'use client'

import SupabaseProvider from '@/components/SupabaseProvider'
import SearchModal1 from '@/components/modal/SearchModal1'
import NavSidebar from '@/components/sidebar/NavSidebar'
import Loader from '@/components/loader/Loader'

export default function ClientProviders({ children, initialSession }) {
  return (
    <SupabaseProvider initialSession={initialSession}>
      <Loader />
      <SearchModal1 />
      {children}
      <NavSidebar />
    </SupabaseProvider>
  )
}