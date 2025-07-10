"use client"

import { logout } from "@/app/(auth)/logout/actions"
import { professionalNavigation } from "@/data/dashboard"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  LogOut,
  ChevronRight,
  Home,
  Calendar,
  Users,
  Settings,
  BarChart3,
  Briefcase
} from "lucide-react"

export default function DashboardSidebar() {
  const path = usePathname()

  // Group navigation items for better organization
  const getNavigationGroups = () => {
    const nav = professionalNavigation || []
    return {
      main: nav.slice(0, 8),
      tools: nav.slice(8, 14),
      account: nav.slice(14, 15),
      system: nav.slice(15, 17)
    }
  }

  const groups = getNavigationGroups()

  // Get icon component for better rendering
  const getIconComponent = (iconString) => {
    // Map common icon strings to Lucide components
    const iconMap = {
      'flaticon-dashboard': Home,
      'flaticon-calendar': Calendar,
      'flaticon-user': Users,
      'flaticon-setting': Settings,
      'flaticon-analytics': BarChart3,
      'flaticon-briefcase': Briefcase,
      'flaticon-logout': LogOut,
    }
    
    return iconMap[iconString] || Home
  }

  const NavItem = ({ item, isActive }) => {
    const IconComponent = getIconComponent(item.icon)
    
    // Use shadcn/ui semantic colors
    const baseClasses = "group flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
    const hoverClasses = "hover:bg-accent hover:text-accent-foreground"
    const activeClasses = isActive 
      ? "bg-primary text-primary-foreground shadow-sm" 
      : "text-muted-foreground"

    if (item.name === "Logout") {
      return (
        <form className="w-full">
          <Button
            variant="ghost"
            className={cn(
              baseClasses,
              hoverClasses,
              activeClasses,
              "h-auto justify-start p-0"
            )}
            formAction={logout}
          >
            <div className="flex items-center flex-1">
              <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </Button>
        </form>
      )
    }

    return (
      <Link
        href={item.path}
        className={cn(
          baseClasses,
          hoverClasses,
          activeClasses,
          "no-underline"
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
        {item.badge && (
          <Badge 
            variant="secondary" 
            className="ml-2 h-5 px-1.5 text-xs"
          >
            {item.badge}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity ml-2" />
      </Link>
    )
  }

  const NavGroup = ({ title, items, showSeparator = true }) => (
    <>
      {showSeparator && <Separator className="my-4" />}
      {title && (
        <div className="px-3 mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h4>
        </div>
      )}
      <nav className="space-y-1">
        {items.map((item, index) => (
          <NavItem 
            key={item.path || index} 
            item={item} 
            isActive={path === item.path}
          />
        ))}
      </nav>
    </>
  )

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen w-[280px]",
      "bg-sidebar border-r border-sidebar-border overflow-y-auto hidden lg:block"
    )}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            "bg-sidebar-primary text-sidebar-primary-foreground"
          )}>
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">Workspace</h2>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="p-4 space-y-4 bg-sidebar">
        {/* Main Navigation */}
        <NavGroup 
          items={groups.main} 
          showSeparator={false}
        />

        {/* Tools Section */}
        {groups.tools.length > 0 && (
          <NavGroup 
            title="Tools & Features" 
            items={groups.tools} 
          />
        )}

        {/* Account Section */}
        {groups.account.length > 0 && (
          <NavGroup 
            title="Account" 
            items={groups.account} 
          />
        )}

        {/* System Section */}
        {groups.system.length > 0 && (
          <NavGroup 
            title="System" 
            items={groups.system} 
          />
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center space-x-3 text-xs text-sidebar-foreground/70">
          <div className="h-2 w-2 rounded-full bg-sidebar-primary"></div>
          <span>Professional Mode Active</span>
        </div>
      </div>
    </div>
  )
}