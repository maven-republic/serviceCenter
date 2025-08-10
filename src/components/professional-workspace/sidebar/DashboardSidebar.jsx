"use client"

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
  Activity
} from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()

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
              "w-full justify-start h-11 px-3 font-medium",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent/50 transition-all duration-200",
              "group relative overflow-hidden"
            )}
            formAction={logout}
          >
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-md bg-destructive/10 text-destructive">
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-sm">{item.name}</span>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
          </Button>
        </form>
      )
    }

    return (
      <Link
        href={item.path}
        className={cn(
          "flex items-center w-full h-11 px-3 rounded-lg font-medium",
          "transition-all duration-200 group relative overflow-hidden",
          "hover:bg-accent/50 hover:text-foreground",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className={cn(
            "p-1.5 rounded-md transition-colors",
            isActive 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
          )}>
            <IconComponent className="h-4 w-4" />
          </div>
          <span className="text-sm truncate">{item.name}</span>
        </div>
        
        {item.badge && (
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
        
        <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground/30 rounded-r" />
        )}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
              <p className="text-xs text-muted-foreground">Professional Dashboard</p>
            </div>
          </div>
          
          {/* Theme Toggle in Header */}
          <ThemeToggle variant="simple" className="h-9 w-9" />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
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

      {/* Footer with Theme Info */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Theme Toggle Dropdown - Alternative placement */}
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
    </div>
  )
}