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
  PanelLeftOpen,
  Menu
} from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

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

  // Enhanced navigation item component
  const NavItem = ({ item, isActive }) => {
    const IconComponent = getIconComponent(item.icon)
    
    if (item.name === "Logout") {
      return (
        <form className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "w-full h-11 font-medium",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent/50 transition-all duration-200",
              "group relative overflow-hidden",
              isCollapsed ? "justify-center px-2" : "justify-start px-3"
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
              {!isCollapsed && (
                <span className="text-sm">{item.name}</span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
            )}
          </Button>
        </form>
      )
    }

    return (
      <Link
        href={item.path}
        className={cn(
          "flex items-center w-full h-11 rounded-lg font-medium",
          "transition-all duration-200 group relative overflow-hidden",
          "hover:bg-accent/50 hover:text-foreground",
          isCollapsed ? "justify-center px-2" : "px-3",
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
          {!isCollapsed && (
            <span className="text-sm truncate">{item.name}</span>
          )}
        </div>
        
        {!isCollapsed && item.badge && (
          <Badge 
            variant={isActive ? "outline" : "secondary"} 
            className={cn(
              "h-5 px-1.5 text-xs ml-2",
              isActive && "border-primary-foreground/30 text-primary-foreground"
            )}
          >
            {item.badge}
          </Badge>
        )}
        
        {!isCollapsed && (
          <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground/30 rounded-r" />
        )}
      </Link>
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-[280px]"
    )}>
      {/* Header */}
      <div className="border-b border-border relative">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center p-4" : "justify-between p-6"
        )}>
          {isCollapsed ? (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
                  <p className="text-xs text-muted-foreground">Professional Dashboard</p>
                </div>
              </div>
              
              {/* Theme Toggle in Header (only when expanded) */}
              <ThemeToggle variant="simple" className="h-9 w-9" />
            </>
          )}
        </div>
        
        {/* Desktop Collapse Toggle Button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0",
              "border border-border bg-background shadow-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "rounded-full z-10"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-3 w-3" />
            ) : (
              <PanelLeftClose className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-4">
          {professionalNavigation?.map((item, index) => (
            <NavItem 
              key={item.path || index} 
              item={item} 
              isActive={pathname === item.path}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={cn(
        "border-t border-border transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {isCollapsed ? (
          // Collapsed footer - just theme toggle
          <div className="flex justify-center">
            <ThemeToggle variant="simple" className="h-8 w-8" />
          </div>
        ) : (
          // Expanded footer
          <div className="space-y-3">
            {/* Theme Toggle Dropdown */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Theme</span>
              <ThemeToggle variant="dropdown" className="h-8 w-8" />
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/50">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                Professional Mode
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}