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

  console.log('🧠 user from userStore:', user)

  useEffect(() => {
    if (session?.user && user === null) {
      console.log("✅ session.user from context:", session.user)
      fetchUser(session.user, supabase)
      console.log(session.user)
    }
  }, [session?.user])

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
