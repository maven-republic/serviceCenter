// CustomerWorkspaceNavigation.jsx 
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { customerNavigation } from "@/data/dashboard";
import { useUserStore } from "@/store/userStore"; // Import user store
import SidebarLogo from "./navigation/SidebarLogo";
import NavigationSection from "./navigation/NavigationSection";
import NavigationItem from "./navigation/NavigationItem";
import LogoutButton from "./navigation/LogoutButton";
import { getIconComponent } from "./navigation/iconMapper";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Home, User, Settings, LogOut, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function CustomerWorkspaceNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get user data from store
  const { user, isLoading } = useUserStore();

  // Get specific navigation items
  const accountInfoItem = customerNavigation.account?.find(
    item => item.name === "Account Information"
  );
  
  const logoutItem = customerNavigation.settings?.find(
    item => item.name === "Logout"
  );

  // Get account items excluding Account Information
  const filteredAccountItems = customerNavigation.account?.filter(
    item => item.name !== "Account Information"
  ) || [];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Get user display information
  const getUserDisplayInfo = () => {
    if (isLoading) {
      return {
        name: "Loading...",
        email: "",
        initials: "...",
        accountType: "Loading account..."
      };
    }

    if (!user || !user.account) {
      return {
        name: "Guest User",
        email: "",
        initials: "GU",
        accountType: "No account"
      };
    }

    const { account, email } = user;
    const firstName = account.first_name || "";
    const lastName = account.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Generate initials
    const initials = firstName && lastName 
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : firstName 
        ? firstName.charAt(0).toUpperCase()
        : email 
          ? email.charAt(0).toUpperCase()
          : "CU";

    return {
      name: fullName || email || "Customer",
      email: email || "",
      initials,
      accountType: "Customer Account",
      avatar: account.profile_picture_url || null
    };
  };

  const userInfo = getUserDisplayInfo();

  // Enhanced Mobile Navigation Item Component
  const MobileNavItem = ({ item, isActive, onClick }) => {
    const IconComponent = getIconComponent(item.icon);
    
    return (
      <Link href={item.path} onClick={onClick}>
        <div className={`
          flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}>
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{item.name}</span>
          {isActive && (
            <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
          )}
        </div>
      </Link>
    );
  };

  // User Info Display Component
  const UserInfoDisplay = () => (
    <div className="flex items-center gap-3 px-2 py-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {userInfo.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {userInfo.name}
          </p>
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {userInfo.accountType}
        </p>
        {userInfo.email && (
          <p className="text-xs text-muted-foreground truncate">
            {userInfo.email}
          </p>
        )}
      </div>
    </div>
  );

  // Mobile Navigation Component with Fixed Header Alignment
  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 p-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0 bg-background flex flex-col">
        {/* FIXED: Better aligned header */}
        <SheetHeader className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            </div>
            <SheetTitle className="text-base font-semibold text-left">
              maven republic
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            
            {/* Workspace Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </h3>
              </div>
              
              <div className="space-y-1">
                {(customerNavigation.workspace || []).map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <MobileNavItem
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      onClick={closeMobileMenu}
                    />
                  );
                })}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Account Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-1 h-4 bg-secondary rounded-full" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </h3>
              </div>
              
              <div className="space-y-1">
                {/* Regular Account Items */}
                {filteredAccountItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <MobileNavItem
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      onClick={closeMobileMenu}
                    />
                  );
                })}
                
                {/* Account Information */}
                {accountInfoItem && (
                  <MobileNavItem
                    item={accountInfoItem}
                    isActive={pathname === accountInfoItem.path}
                    onClick={closeMobileMenu}
                  />
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Section with Real User Data */}
        <div className="border-t bg-muted/30 p-4">
          <div className="space-y-3">
            {/* Real User Info Section */}
            <UserInfoDisplay />
            
            <Separator />
            
            {/* Logout Button */}
            {logoutItem && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-foreground hover:text-destructive"
                onClick={closeMobileMenu}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop User Info (Optional - for consistency)
  const DesktopUserInfo = () => (
    <div className="px-2 py-3">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {userInfo.initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground truncate max-w-20" title={userInfo.name}>
            {userInfo.name}
          </p>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>

      {/* Desktop Navigation - Enhanced with User Info */}
      <div className="hidden lg:block w-28 bg-background sticky top-0 h-screen z-10 border-r border-border">
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

            <Separator className="w-16" />

            {/* Desktop User Info - Now below Account Information */}
            <DesktopUserInfo />

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
    </>
  );
}