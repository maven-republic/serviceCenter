// src/app/(professional-workspace)/professional/layout.jsx
'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace"

export default function ProfessionalWorkspaceLayout({ children }) {
  const { user } = useUserStore()
  const { isProfessionalWorkspace } = useTheme()

  // 🎯 Only add workspace classes, let ThemeProvider handle themes
  useEffect(() => {
    // Add professional workspace class to body for any component styling
    document.body.classList.add('professional-workspace')
    
    console.log('🏢 Professional workspace layout mounted')
    
    return () => {
      document.body.classList.remove('professional-workspace')
      console.log('🏢 Professional workspace layout unmounted')
    }
  }, [])

  return (
    <div className={cn(
      "min-h-screen transition-none",
      "professional-workspace" // This class is for component styling, not theme forcing
    )}>
      {/* Use the modernized ProfessionalWorkspace component */}
      <ProfessionalWorkspace>
        {children}
      </ProfessionalWorkspace>
    </div>
  )
}