// src/app/(professional-workspace)/professional/layout.jsx
'use client'

import { useEffect, useState } from 'react'
import '../professional.css'
import { useUserStore } from '@/store/userStore'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace"

export default function ProfessionalWorkspaceLayout({ children }) {
  const { user } = useUserStore()
  const { theme, setTheme } = useTheme()
  const [isThemeForced, setIsThemeForced] = useState(false)

  // 🎯 Simple theme forcing without loops
  useEffect(() => {
    if (theme !== 'dark' && !isThemeForced) {
      setTheme('dark')
      setIsThemeForced(true)
    }
    
    // Ensure DOM classes are applied
    const root = document.documentElement
    root.classList.add('dark')
    root.classList.remove('light')
  }, [theme, setTheme, isThemeForced])

  return (
    <div className={cn(
      "min-h-screen transition-none",
      "professional-workspace dark"
    )}>
      <ProfessionalWorkspace>
        {children}
      </ProfessionalWorkspace>
    </div>
  )
}