"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@/utils/supabase/client';
import CustomerWorkspaceNavigation from "./sidebar/CustomerWorkspaceNavigation ";

export default function CustomerWorkspaceStructure({ children }) {
  const { user, fetchUser } = useUserStore();

  // User authentication effect
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
    // ✅ FOUNDATION: Single scroll architecture
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        
        {/* ✅ SIDEBAR: Fixed position, proper constraints */}
        <div className="flex-shrink-0">
          <CustomerWorkspaceNavigation />
        </div>
        
        {/* ✅ MAIN: Natural scroll, no overflow conflicts */}
        <div className="flex-1 min-w-0">
          <main className="h-full w-full">
            {/* ✅ CONTAINER: Responsive padding, no max-width conflicts */}
            <div className="h-full w-full px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
        
      </div>
    </div>
  );
}