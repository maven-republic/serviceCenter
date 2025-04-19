"use client";

import toggleStore from "@/store/toggleStore";
import CustomerSideNavigation from "./sidebar/CustomerSideNavigation";
import { useUserStore } from "@/store/userStore";
import { getSession } from '../../../utils/supabase/client';
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
      const session = await getSession()
      if (session) {
        console.log("session.user: ", session.user);
        fetchUser(session.user) 
      }
    }  

    user === null && 
    setUser()  
  }, [])

  return (
    <>
    <Axis/>
      {/* Dashboard Header with Search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/customer" className="font-bold text-xl text-blue-600">
            {/* ServiceMarket */}
          </Link>
          
          {/* Search */}
         
          
          {/* User Menu
          <div className="flex items-center space-x-4">
            <Link
              href="/customer/notifications"
              className="p-2 text-gray-600 hover:text-blue-600 relative"
            >
              <Bell size={20} />
              Notification indicator
              {user?.notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
            
            <Link
              href="/customer/account"
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <User size={20} />
            </Link>
          </div> */}
        </div>
      </header>

      <div className="dashboard_content_wrapper">
        <div
          className={`dashboard dashboard_wrapper pr30 pr0-xl ${
            isActive ? "dsh_board_sidebar_hidden" : ""
          }`}
        >
          <CustomerSideNavigation />
          <div className="dashboard__main pl0-md">
            {children}
          </div>
          <CustomerSideNavigation />
        </div>
      </div>
    </>
  );
}