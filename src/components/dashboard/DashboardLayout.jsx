"use client";

import toggleStore from "@/store/toggleStore";
import DashboardHeader from "./header/DashboardHeader";
import DashboardSidebar from "./sidebar/DashboardSidebar";
import DashboardFooter from "./footer/DashboardFooter"; 
import { useUserStore } from "@/store/userStore";
import { getSession } from '../../utils/supabase/client'; // Helper function to get user session
import { useEffect } from "react"; 

export default function DashboardLayout({ children }) {
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
      <DashboardHeader />
      <div className="dashboard_content_wrapper">
        <div
          className={`dashboard dashboard_wrapper pr30 pr0-xl ${
            isActive ? "dsh_board_sidebar_hidden" : ""
          }`}
        >
          <DashboardSidebar />
          <div className="dashboard__main pl0-md">
            {children}
            <DashboardFooter />
          </div>
        </div>
      </div>
    </>
  );
}
