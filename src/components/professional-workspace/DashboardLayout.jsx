'use client'

import toggleStore from "@/store/toggleStore"
import DashboardHeader from "./header/DashboardHeader"
import DashboardSidebar from "./sidebar/DashboardSidebar"
import DashboardFooter from "./footer/DashboardFooter"
import { useUserStore } from "@/store/userStore"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect } from "react"

export default function DashboardLayout({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive)
  const { user, fetchUser } = useUserStore()
  const session = useSession()
  const supabase = useSupabaseClient()

  // 👇 Avoid log spam in production
  if (process.env.NODE_ENV === 'development') {
    console.log('🧠 user from userStore:', user)
  }

  // 👇 Fetch user only once session is available
  useEffect(() => {
    if (session?.user && user === null) {
      fetchUser(session.user, supabase)
    }
  }, [session?.user, user, fetchUser, supabase])

  // 👇 Guard rendering until user is loaded
  if (!user || !user.account?.account_id) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <DashboardHeader />
      <div className="dashboard_content_wrapper">
        <div
          className={`dashboard dashboard_wrapper pr30 pr0-xl ${
            isActive ? "dsh_board_sidebar_hidden" : ""
          }`}
        >
          <DashboardSidebar />
          <div className="dashboard__main pl0-md">
            {children}
            <DashboardFooter />
          </div>
        </div>
      </div>
    </>
  )
}
