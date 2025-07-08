"use client";

import toggleStore from "@/store/toggleStore";
import CustomerWorkspaceNavigation from "./sidebar/CustomerWorkspaceNavigation ";
import { useUserStore } from "@/store/userStore";
import { createClient } from '@/utils/supabase/client';
import { useEffect } from "react";
import GlobalSearch from "@/components/customer-workspace/element/GlobalSearch";
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import Axis from "./header/Axis";

export default function CustomerWorkspaceLayout({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive); 
  const { user, fetchUser } = useUserStore()

  useEffect(() => {    
    async function setUser() {
      const supabase = createClient() // ✅ Create supabase client
      const { data: { session } } = await supabase.auth.getSession() // ✅ Get session properly
      
      if (session?.user) {
        console.log("session.user: ", session.user);
        await fetchUser(session.user, supabase) // ✅ Pass both parameters
      }
    }  

    if (user === null) {
      setUser()  
    }
  }, [user, fetchUser]) // ✅ Add fetchUser to dependencies

  return (
    <div className="dashboard_content_wrapper">
      <div
        className={`dashboard dashboard_wrapper ${
          isActive ? "dsh_board_sidebar_hidden" : ""
        }`}
      >
        {/* Sidebar */}
        <CustomerWorkspaceNavigation />
        
        {/* Main Content Area */}
        <div className="dashboard__main pl0-md">
          {/* Main Content */}
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}