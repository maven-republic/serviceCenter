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
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isActive ? "w-0 overflow-hidden" : "w-64"
        )}>
          <CustomerWorkspaceNavigation />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}