"use client"

import { logout } from "@/app/(auth)/logout/actions"
import { professionalNavigation } from "@/data/dashboard"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Search,
  User,
  Clock,
  MessageSquare,
  CreditCard,
  FileText,
  Plus,
  Save
} from "lucide-react"

export default function DashboardSidebar() {
  const pathname = usePathname()

  // Enhanced icon mapping with new semantic names
  const getIconComponent = (iconString) => {
    const iconMap = {
      // Legacy flaticon names (backward compatibility)
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
      
      // New semantic names
      'analytics': BarChart3,
      'calendar': Calendar,
      'profile': User,
      'schedule': Clock,
      'logout': LogOut,
      'search': Search,
      'explore': Search,
      'dashboard': BarChart3,
      'settings': Settings,
      'messages': MessageSquare,
      'notifications': Activity,
      'support': Users,
      'payments': CreditCard,
      'billing': CreditCard,
      'invoices': FileText,
      'add': Plus,
      'create': Plus,
      'save': Save,
      'account': User,
      'stats': BarChart3,
      'reports': FileText,
      'insights': BarChart3
    }
    
    return iconMap[iconString] || Activity
  }

  // Flatten the navigation object into a single array
  const getNavigationItems = () => {
    if (!professionalNavigation) return []
    
    // Handle both old array format and new object format
    if (Array.isArray(professionalNavigation)) {
      return professionalNavigation
    }
    
    // New object format - flatten all sections
    const sections = Object.values(professionalNavigation)
    return sections.flat()
  }

  // Enhanced navigation item component
  const NavItem = ({ item, isActive }) => {
    const IconComponent = getIconComponent(item.icon)
    
    if (item.name === "Logout" || item.action === "logout") {
      return (
        <form className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-11 px-3 font-medium",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent/50 transition-all duration-200",
              "group relative overflow-hidden border shadow-none"
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
          "flex items-center w-full h-11 px-3 rounded-lg font-medium border shadow-none",
          "transition-all duration-200 group relative overflow-hidden",
          "hover:bg-accent/50 hover:text-foreground",
          isActive 
            ? "bg-primary text-primary-foreground" 
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
              "h-5 px-1.5 text-xs ml-2 border shadow-none",
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

  // Group navigation items by section for better organization
  const NavigationSection = ({ title, items }) => {
    if (!items || items.length === 0) return null
    
    return (
      <div className="space-y-1">
        {title && (
          <>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
            <div className="space-y-1">
              {items.map((item, index) => (
                <NavItem 
                  key={item.id || item.path || index} 
                  item={item} 
                  isActive={pathname === item.path}
                />
              ))}
            </div>
            <div className="py-2">
              <Separator />
            </div>
          </>
        )}
        {!title && items.map((item, index) => (
          <NavItem 
            key={item.id || item.path || index} 
            item={item} 
            isActive={pathname === item.path}
          />
        ))}
      </div>
    )
  }

  // Render sections if using new object format, otherwise render flat list
  const renderNavigation = () => {
    if (!professionalNavigation) return null
    
    // Handle old array format
    if (Array.isArray(professionalNavigation)) {
      return (
        <NavigationSection items={professionalNavigation} />
      )
    }
    
    // Handle new object format with sections
    return (
      <>
        {professionalNavigation.dashboard && (
          <NavigationSection 
            title="Dashboard" 
            items={professionalNavigation.dashboard} 
          />
        )}
        {professionalNavigation.account && (
          <NavigationSection 
            title="Account" 
            items={professionalNavigation.account} 
          />
        )}
        {professionalNavigation.settings && (
          <NavigationSection 
            title="Settings" 
            items={professionalNavigation.settings} 
          />
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border shadow-none">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border shadow-none">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
            <p className="text-xs text-muted-foreground">Professional Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          {renderNavigation()}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/50 border shadow-none">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">
            Professional Mode
          </span>
        </div>
      </div>
    </div>
  )
}