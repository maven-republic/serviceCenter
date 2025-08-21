// src/components/customer-workspace/CustomerWorkspaceStructure.jsx
"use client";

import { useState, useEffect } from "react";
import toggleStore from "@/store/toggleStore";
import CustomerWorkspaceNavigation from "./sidebar/CustomerWorkspaceNavigation ";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@/utils/supabase/client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CustomerWorkspaceStructure({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive); 
  const { user, fetchUser } = useUserStore();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // User session management
  useEffect(() => {    
    async function setUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("session.user: ", session.user);
        await fetchUser(session.user, supabase);
      }
    }  

    if (user === null) {
      setUser();
    }
  }, [user, fetchUser]);

  return (
    <div className="customer-workspace min-h-screen bg-background">
      
      {/* 📱 MOBILE LAYOUT */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              {/* Left Side - Navigation */}
              <div className="flex items-center gap-3">
                <CustomerWorkspaceNavigation />
                
              </div>

              {/* Right Side - Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="relative p-2 h-auto">
                  <Search className="h-4 w-4" />
                </Button>
                
                {/* <Button variant="ghost" size="sm" className="relative p-2 h-auto">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    2
                  </Badge>
                </Button>
                 */}
                <Button variant="ghost" size="sm" className="p-2 h-auto">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile Main Content - Full Width */}
          <main className="flex-1 w-full bg-background">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      ) : (
        /* 🖥️ DESKTOP LAYOUT */
        <div className="flex min-h-screen">
          
          {/* Desktop Sidebar */}
          <div className={cn(
            "transition-all duration-300 ease-in-out flex-shrink-0 border-r border-border bg-background",
            isActive ? "w-0 overflow-hidden" : "w-28"
          )}>
            <CustomerWorkspaceNavigation />
          </div>
          
          {/* Desktop Main Content */}
          <div className="flex-1 min-h-screen bg-background">
           
            {/* Desktop Content Container */}
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}