"use client";

import { useState } from "react";
import { logout } from "@/app/(auth)/logout/actions";
import { customerNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Settings, 
  LogOut,
  Calendar,
  BarChart3,
  CreditCard,
  Search,
  Home,
  MessageSquare,
  Bell,
  HelpCircle,
  UserCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import toggleStore from "@/store/toggleStore";

// Modern icon mapping for better visual consistency
const iconMap = {
  "flaticon-home": BarChart3,                    // 📊 Analytics - Changed from Home to BarChart3
  "flaticon-search": Search,
  "flaticon-calendar": Calendar,
  "flaticon-user": User,
  "flaticon-photo": UserCircle,                  // 👤 Account Information - Added mapping
  "flaticon-analytics": BarChart3,               // 📊 Analytics - Modern bar chart
  "flaticon-account-info": UserCircle,           // 👤 Account Information - User in circle
  "flaticon-account-information": UserCircle,     // Alternative naming
  "flaticon-credit-card": CreditCard,
  "flaticon-settings": Settings,
  "flaticon-logout": LogOut,
  "flaticon-message": MessageSquare,
  "flaticon-notification": Bell,
  "flaticon-help": HelpCircle,
  "flaticon-appointment": Calendar,              // 📅 Appointments
  // Additional analytics options
  "flaticon-stats": BarChart3,
  "flaticon-dashboard": BarChart3,
  "flaticon-reports": TrendingUp,
  // Additional account options  
  "flaticon-profile": UserCircle,
  "flaticon-my-account": UserCircle,
};

export default function CustomerWorkspaceNavigation() {
  const pathname = usePathname();
  const { isDasboardSidebarActive, dashboardSlidebarToggleHandler } = toggleStore();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const isCollapsed = isDasboardSidebarActive;

  // Get icon component from mapping or fallback
  const getIconComponent = (iconClass) => {
    const IconComponent = iconMap[iconClass] || Home;
    return IconComponent;
  };

  const NavigationItem = ({ item, isActive = false, section }) => {
    const IconComponent = getIconComponent(item.icon);
    const itemKey = `${section}-${item.name}`;
    const isHovered = hoveredItem === itemKey;

    return (
      <Link
        href={item.path}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          "hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive && "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20",
          !isActive && "text-muted-foreground hover:text-foreground",
          isCollapsed && "justify-center px-2"
        )}
        onMouseEnter={() => setHoveredItem(itemKey)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className={cn(
          "flex items-center justify-center transition-all duration-200",
          isActive && "text-primary",
          isHovered && "scale-110"
        )}>
          <IconComponent className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive && "drop-shadow-sm"
          )} />
        </div>
        
        {!isCollapsed && (
          <>
            <span className={cn(
              "flex-1 transition-all duration-200",
              isActive && "font-medium"
            )}>
              {item.name}
            </span>
            
            {/* Optional badge for notifications */}
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {item.badge}
              </Badge>
            )}
            
            {/* Active indicator */}
            {isActive && (
              <div className="w-1 h-1 bg-primary rounded-full" />
            )}
          </>
        )}

        {/* Collapsed mode tooltip */}
        {isCollapsed && (
          <div className={cn(
            "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap",
            isHovered && "opacity-100"
          )}>
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
          </div>
        )}
      </Link>
    );
  };

  const LogoutButton = ({ item, isActive = false }) => {
    const IconComponent = getIconComponent(item.icon);
    const isHovered = hoveredItem === 'logout';

    return (
      <form>
        <Button
          variant="ghost"
          className={cn(
            "group relative w-full justify-start gap-3 h-auto px-3 py-2.5 text-sm font-normal rounded-xl transition-all duration-200",
            "hover:bg-destructive/10 hover:text-destructive hover:scale-[1.02]",
            "text-muted-foreground",
            isCollapsed && "justify-center px-2"
          )}
          formAction={logout}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className={cn(
            "flex items-center justify-center transition-all duration-200",
            isHovered && "scale-110"
          )}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          {!isCollapsed && (
            <span className="flex-1 text-left">
              {item.name}
            </span>
          )}

          {/* Collapsed mode tooltip */}
          {isCollapsed && (
            <div className={cn(
              "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap",
              isHovered && "opacity-100"
            )}>
              {item.name}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
            </div>
          )}
        </Button>
      </form>
    );
  };

  const SectionHeader = ({ title, children }) => (
    <div className="space-y-2">
      {!isCollapsed && (
        <h4 className="text-xs font-semibold text-muted-foreground/70 px-3 uppercase tracking-wider">
          {title}
        </h4>
      )}
      {isCollapsed && (
        <Separator className="mx-2" />
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "hidden lg:block border-r bg-background/95 backdrop-blur-sm sticky top-0 h-screen z-10 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Header with toggle */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-border/50",
          isCollapsed && "justify-center"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Workspace</h2>
                <p className="text-xs text-muted-foreground">Customer Portal</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={dashboardSlidebarToggleHandler}
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-200",
              isCollapsed && "hover:scale-110"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <nav className={cn(
            "p-4 space-y-6",
            isCollapsed && "p-2 space-y-4"
          )}>
            {/* Workspace Section */}
            <SectionHeader title="Workspace">
              {customerNavigation.workspace?.map((item, i) => (
                <NavigationItem
                  key={`workspace-${i}`}
                  item={item}
                  section="workspace"
                  isActive={pathname === item.path}
                />
              ))}
            </SectionHeader>

            {!isCollapsed && <Separator className="opacity-50" />}

            {/* Account Section */}
            <SectionHeader title="Account">
              {customerNavigation.account?.map((item, i) => (
                <NavigationItem
                  key={`account-${i}`}
                  item={item}
                  section="account"
                  isActive={pathname === item.path}
                />
              ))}
            </SectionHeader>

            {!isCollapsed && <Separator className="opacity-50" />}

            {/* Settings Section */}
            <SectionHeader title="Settings">
              {customerNavigation.settings?.map((item, i) => (
                <div key={`settings-${i}`}>
                  {item.name === "Logout" ? (
                    <LogoutButton
                      item={item}
                      isActive={pathname === item.path}
                    />
                  ) : (
                    <NavigationItem
                      item={item}
                      section="settings"
                      isActive={pathname === item.path}
                    />
                  )}
                </div>
              ))}
            </SectionHeader>
          </nav>
        </div>

        {/* Enhanced Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border/50 bg-background/95">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Customer Portal</span>
            </div>
          </div>
        )}
        
        {/* Collapsed footer */}
        {isCollapsed && (
          <div className="p-2 border-t border-border/50">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}