"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import toggleStore from "@/store/toggleStore"
import DashboardSidebar from "./sidebar/DashboardSidebar"
import { useUserStore } from "@/store/userStore"
import { createClient } from '@/utils/supabase/client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, Bell, Search, User } from "lucide-react"
import { professionalNavigation } from '@/data/dashboard'

export default function ProfessionalWorkspace({ children }) {
  const pathname = usePathname()
  const isActive = toggleStore((state) => state.isDasboardSidebarActive)
  const { user, fetchUser } = useUserStore()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // User session management
  useEffect(() => {    
    async function setUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log("Professional session.user: ", session.user)
        await fetchUser(session.user, supabase)
      }
    }  

    if (user === null) {
      setUser()
    }
  }, [user, fetchUser])

  return (
    <div className="professional-workspace min-h-screen bg-background">
      
      {/* MOBILE LAYOUT */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 h-auto"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="relative p-2 h-auto">
                  <Search className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="p-2 h-auto">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile Sidebar - Now using Sheet */}
          <DashboardSidebar 
            items={professionalNavigation}
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onOpenChange={setSidebarOpen}
          />

          {/* Mobile Main Content */}
          <main className="flex-1 w-full bg-background">
            <div className="w-full p-4">
              {children}
            </div>
          </main>
        </div>
      ) : (
        /* DESKTOP LAYOUT */
        <div className="flex min-h-screen">
          
          {/* Desktop Sidebar - Now sticky and fixed to viewport */}
          <div className={cn(
            "sticky top-0 h-screen transition-all duration-300 ease-in-out flex-shrink-0 bg-background",
            isActive ? "w-0 overflow-hidden" : "w-24"
          )}>
            <DashboardSidebar 
              items={professionalNavigation}
              isMobile={false}
              isOpen={false}
              onOpenChange={() => {}}
            />
          </div>
          
          {/* Desktop Main Content */}
          <div className="flex-1 min-h-screen bg-background">
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  )
}