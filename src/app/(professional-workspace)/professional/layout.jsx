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

  // Mobile-first workspace setup
  useEffect(() => {
    // Add professional workspace class for styling
    document.body.classList.add('professional-workspace')
    
    // Add mobile-specific classes
    document.body.classList.add('professional-workspace-mobile')
    
    // Prevent zoom on iOS double-tap
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }
    
    // Add touch-friendly classes
    document.documentElement.style.setProperty('--touch-target-min', '44px')
    document.documentElement.style.setProperty('--touch-target-comfortable', '48px')
    
    console.log('🢠Professional workspace layout mounted (mobile-optimized)')
    
    return () => {
      document.body.classList.remove('professional-workspace', 'professional-workspace-mobile')
      console.log('🢠Professional workspace layout unmounted')
    }
  }, [])

  return (
    <div className={cn(
      "min-h-screen transition-none bg-background",
      "professional-workspace professional-workspace-mobile",
      // Mobile-specific styling
      "touch-manipulation", // Better touch performance
      "overscroll-behavior-none" // Prevent bounce scrolling
    )}>
      {/* Mobile-optimized Professional Workspace */}
      <ProfessionalWorkspace isMobile={true}>
        <div className="w-full max-w-none">
          {children}
        </div>
      </ProfessionalWorkspace>
    </div>
  )
}