// src/app/(professional-workspace)/professional/layout.jsx
'use client'

import '../professional.css'
import { useUserStore } from '@/store/userStore'
import { cn } from '@/lib/utils' // Add this utility if you don't have it
import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace"

export default function ProfessionalWorkspaceLayout({ children }) {
  const { user } = useUserStore()
  const isProfessional = user?.profile?.professional_id

  return (
    <div className={cn(
      "min-h-screen",
      isProfessional && "professional-workspace dark"
    )}>
      <ProfessionalWorkspace>
        {children}
      </ProfessionalWorkspace>
    </div>
  )
}