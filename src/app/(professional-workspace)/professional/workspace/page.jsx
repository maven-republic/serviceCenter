'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import DashboardInfo from "@/components/professional-workspace/section/DashboardInfo"

export default function WorkspaceInterface() {
  const user = useUserStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (user === null) return // still loading
    if (user?.primaryRole !== 'professional') {
      router.replace('/login')
    }
  }, [user])

  if (!user) return <div className="text-center mt-10">🔄 Loading workspace...</div>

  return <DashboardInfo />
}

