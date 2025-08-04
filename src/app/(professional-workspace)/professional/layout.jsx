// src/app/(professional-workspace)/professional/layout.jsx
'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace"

export default function ProfessionalWorkspaceLayout({ children }) {
  const { user } = useUserStore()
  const { setTheme } = useTheme()
  const [isThemeForced, setIsThemeForced] = useState(false)

  // 🎯 Theme forcing with modern approach
  useEffect(() => {
    if (!isThemeForced) {
      setTheme('dark')
      setIsThemeForced(true)
    }
    
    // Ensure DOM classes are applied
    const root = document.documentElement
    root.classList.add('dark')
    root.classList.remove('light')
    
    // Add professional workspace class to body
    document.body.classList.add('professional-workspace')
    
    return () => {
      document.body.classList.remove('professional-workspace')
    }
  }, [setTheme, isThemeForced])

  return (
    <div className={cn(
      "min-h-screen transition-none",
      "professional-workspace dark"
    )}>
      {/* Use the modernized ProfessionalWorkspace component */}
      <ProfessionalWorkspace>
        {children}
      </ProfessionalWorkspace>
    </div>
  )
}