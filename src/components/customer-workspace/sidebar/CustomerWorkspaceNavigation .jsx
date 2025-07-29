// src/components/customer-workspace/sidebar/CustomerWorkspaceNavigation.jsx
"use client";

import { usePathname } from "next/navigation";
import { customerNavigation } from "@/data/dashboard";
import SidebarLogo from "./navigation/SidebarLogo";
import NavigationSection from "./navigation/NavigationSection";
import NavigationItem from "./navigation/NavigationItem";
import LogoutButton from "./navigation/LogoutButton";
import { getIconComponent } from "./navigation/iconMapper";

export default function CustomerWorkspaceNavigation() {
  const pathname = usePathname();

  // Get specific navigation items
  const accountInfoItem = customerNavigation.account?.find(
    item => item.name === "Account Information"
  );
  
  const logoutItem = customerNavigation.settings?.find(
    item => item.name === "Logout"
  );

  // Get account items excluding Account Information (since it's in bottom section)
  const filteredAccountItems = customerNavigation.account?.filter(
    item => item.name !== "Account Information"
  ) || [];

  return (
    <div className="hidden lg:block w-28 bg-white sticky top-0 h-screen z-10 border-r border-gray-200">
      <div className="flex h-full flex-col items-center">
        
        {/* Logo Section */}
        <SidebarLogo variant="default" />

        {/* Main Navigation */}
        <nav className="flex flex-col items-center space-y-3 flex-1 mt-6">
          {/* Workspace Items */}
          <NavigationSection 
            items={customerNavigation.workspace || []}
            variant="default"
            spacing="space-y-3"
          />

          {/* Account Items (excluding Account Information) */}
          <NavigationSection 
            items={filteredAccountItems.slice(0, 2)}
            variant="default" 
            spacing="space-y-3"
          />
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col items-center space-y-3 pb-4">
          {/* Account Information */}
          {accountInfoItem && (
            <NavigationItem
              item={accountInfoItem}
              isActive={pathname === accountInfoItem.path}
              IconComponent={getIconComponent(accountInfoItem.icon)}
              showTooltip={true}
              variant="default"
            />
          )}

          {/* Logout */}
          {logoutItem && (
            <LogoutButton 
              item={logoutItem}
              IconComponent={getIconComponent(logoutItem.icon)}
              variant="default"
            />
          )}
        </div>
      </div>
    </div>
  );
}