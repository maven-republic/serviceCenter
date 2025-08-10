// src/components/customer-workspace/CustomerWorkspaceStructure.jsx
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
    // 🎨 CUSTOMER WORKSPACE - Always white background
    <div className="min-h-screen bg-background customer-workspace-container">
      <div className="flex">
        
        {/* Sidebar Container */}
        <div className={cn(
          "transition-all duration-300 ease-in-out flex-shrink-0 border-r border-border",
          isActive ? "w-0 overflow-hidden" : "w-28"
        )}>
          <CustomerWorkspaceNavigation />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-screen bg-background">
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}