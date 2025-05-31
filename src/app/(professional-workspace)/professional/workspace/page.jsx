'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useSession } from '@supabase/auth-helpers-react'
import DashboardInfo from '@/components/professional-workspace/section/DashboardInfo'

export default function WorkspaceInterface() {
  const { user } = useUserStore()
  const router = useRouter()
  const session = useSession()

  // 🛑 Wait for session to hydrate
  if (session === null) {
    return (
      <div className="text-center mt-10">
        <div className="spinner-border text-secondary" role="status" />
        <p className="mt-2">Checking session...</p>
      </div>
    )
  }

  // 🛑 Show loading until user is fully hydrated
  if (!user) {
    return (
      <div className="text-center mt-10">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">🔄 Loading workspace...</p>
      </div>
    )
  }

  // 🚫 Redirect if role is incorrect
  if (user?.primaryRole !== 'professional') {
    router.replace('/login')
    return null
  }

  return <DashboardInfo />
}