"use client";

import toggleStore from "@/store/toggleStore";
import CustomerWorkspaceNavigation from "./sidebar/CustomerWorkspaceNavigation ";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@/utils/supabase/client';
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function CustomerWorkspaceStructure({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive); 
  const { user, fetchUser } = useUserStore();

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
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Container - Dynamic width based on collapsed state */}
        <div className={cn(
          "transition-all duration-300 ease-in-out flex-shrink-0",
          isActive ? "w-16" : "w-64"
        )}>
          <CustomerWorkspaceNavigation />
        </div>
        
        {/* Main Content Area with responsive padding */}
        <div className="flex-1 min-h-screen">
          <main className={cn(
            "transition-all duration-300 ease-in-out",
            isActive ? "p-6" : "p-6"
          )}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}