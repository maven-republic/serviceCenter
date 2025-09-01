"use client"

import { useState, useEffect } from "react"
import { logout } from "@/app/(auth)/logout/actions"
import { professionalNavigation } from "@/data/dashboard"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { 
  LogOut,
  Home,
  Calendar,
  Users,
  Settings,
  BarChart3,
  Briefcase,
  ChevronRight,
  Activity,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

export default function DashboardSidebar({ 
  isCollapsed = false, 
  onToggleCollapsed,
  isAnimating = false 
}) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Enhanced icon mapping
  const getIconComponent = (iconString) => {
    const iconMap = {
      'flaticon-home': Home,
      'flaticon-dashboard': BarChart3,
      'flaticon-appointment': Calendar,
      'flaticon-calendar': Calendar,
      'flaticon-user': Users,
      'flaticon-photo': Users,
      'flaticon-setting': Settings,
      'flaticon-analytics': BarChart3,
      'flaticon-briefcase': Briefcase,
      'flaticon-logout': LogOut,
    }
    
    return iconMap[iconString] || Activity
  }

// Replace your NavItem component with this corrected version:

const NavItem = ({ item, isActive, index }) => {
  const IconComponent = getIconComponent(item.icon)
  
  if (item.name === "Logout") {
    return (
      <form className="w-full">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center h-11 rounded-lg font-medium relative overflow-hidden",
"group hover:bg-blue-100 hover:text-blue-900",
            // Fixed width approach - different for collapsed vs expanded
            isCollapsed ? "w-10 mx-auto justify-center px-2" : "mx-2 px-3",
            isActive 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
          formAction={logout}
          title={isCollapsed ? item.name : undefined}
        >
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="p-1.5 rounded-md bg-destructive/10 text-destructive flex-shrink-0">
              <IconComponent className="h-4 w-4" />
            </div>
            
            <span className={cn(
              "text-sm whitespace-nowrap",
              isCollapsed ? "hidden" : "block"
            )}>
              {item.name}
            </span>
          </div>
        </Button>
      </form>
    )
  }

  return (
    <Link
      href={item.path}
      className={cn(
        "flex items-center h-11 rounded-lg font-medium relative overflow-hidden",
        "group hover:bg-blue-500/20 hover:text-foreground",
        // Fixed width approach - key change here
        isCollapsed ? "w-10 mx-auto justify-center px-2" : "mx-2 px-3",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground"
      )}
      title={isCollapsed ? item.name : undefined}
    >
      <div className={cn(
        "flex items-center flex-1",
        isCollapsed ? "justify-center" : "space-x-3"
      )}>
        <div className={cn(
          "p-1.5 rounded-md transition-colors flex-shrink-0",
          isActive 
            ? "bg-primary-foreground/20 text-primary-foreground" 
            : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
        )}>
          <IconComponent className="h-4 w-4" />
        </div>
        
        <span className={cn(
          "text-sm truncate whitespace-nowrap",
          isCollapsed ? "hidden" : "block"
        )}>
          {item.name}
        </span>
      </div>
      
      {item.badge && !isCollapsed && (
        <Badge variant={isActive ? "outline" : "secondary"} className="h-5 px-1.5 text-xs ml-2">
          {item.badge}
        </Badge>
      )}
      
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground/30 rounded-r" />
      )}
    </Link>
  )
}

  

  return (
<div className="flex flex-col h-full transition-colors duration-200 dark:bg-neutral-900 bg-blue-50">

      {/* Header with smooth content transitions */}
      <div className="border-b border-border relative">
        <div className={cn(
          "flex items-center",
          // Smooth header transitions
          isAnimating && "transition-all duration-300 ease-in-out",
          isCollapsed ? "justify-center p-4" : "justify-between p-6"
        )}>
          
          {/* Logo/Brand - Always visible but repositioned */}
          <div className={cn(
            "flex items-center",
            isAnimating && "transition-all duration-300 ease-in-out",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            
            
           </div>
          
          
        </div>
        
        {/* Desktop Collapse Toggle Button with enhanced animations */}
        {!isMobile && onToggleCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0",
              "border border-border bg-background shadow-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "rounded-full z-10",
              // Enhanced button transitions
              "transition-all duration-200 ease-in-out",
              "hover:scale-105 hover:shadow-md active:scale-95"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className={cn(
              "transition-transform duration-200 ease-in-out",
              isAnimating && "transform"
            )}>
              {isCollapsed ? (
                <PanelLeftOpen className="h-3 w-3" />
              ) : (
                <PanelLeftClose className="h-3 w-3" />
              )}
            </div>
          </Button>
        )}
      </div>

      {/* Navigation with staggered animations */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-4">
          {professionalNavigation?.map((item, index) => (
            <NavItem 
              key={item.path || index} 
              item={item} 
              index={index}
              isActive={pathname === item.path}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer with smooth transitions */}
      <div className={cn(
        "border-t border-border",
        // Smooth footer transitions
        isAnimating && "transition-all duration-300 ease-in-out",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {isCollapsed ? (
          // Collapsed footer - centered theme toggle
          <div className="flex justify-center">
            <div className={cn(
              isAnimating && "transition-all duration-200 ease-in-out transform",
              isAnimating && "scale-105"
            )}>
              <ThemeToggle variant="simple" className="h-8 w-8" />
            </div>
          </div>
        ) : (
          // Expanded footer with smooth content reveal
          <div className={cn(
            "space-y-3",
            isAnimating && "transition-all duration-200 ease-in-out",
            isAnimating && "animate-fade-in"
          )}>
            {/* Theme Toggle Dropdown */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Theme</span>
              <ThemeToggle variant="dropdown" className="h-8 w-8" />
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/50">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                Professional Mode
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}