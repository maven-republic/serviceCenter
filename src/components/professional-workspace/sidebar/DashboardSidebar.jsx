"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { 
  LogOut,
  Home,
  Calendar,
  CalendarCheck,  // ✅ NEW - for Bookings
  Users,
  Settings,
  BarChart3,
  Briefcase,
  Activity,
  ClipboardCheck, // ✅ NEW - for Assessments
  Moon,
  Sun
} from "lucide-react"

const iconMap = {
  'flaticon-home': Home,
  'flaticon-dashboard': BarChart3,
  'flaticon-appointment': Calendar,        // Appointments (requests)
  'flaticon-calendar': CalendarCheck,      // ✅ CHANGED - Bookings (confirmed)
  'flaticon-user': Users,
  'flaticon-photo': Users,
  'flaticon-setting': Settings,
  'flaticon-analytics': BarChart3,
  'flaticon-briefcase': Briefcase,
  'flaticon-logout': LogOut,
  'flaticon-clipboard-check': ClipboardCheck, // ✅ NEW - Assessments
}

export default function DashboardSidebar({ items = [], isMobile, isOpen, onOpenChange }) {
  const pathname = usePathname()

  const NavItem = ({ item, isActive, onClick }) => {
    const Icon = iconMap[item.icon] || Activity
    
    if (item.name === "Logout" || item.name === "LOGOUT") {
      return (
        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center h-20 w-full rounded-lg cursor-pointer",
            "hover:bg-accent/50",
            isActive && "bg-primary/10"
          )}
          onClick={() => {
            if (onClick) onClick()
            window.location.href = item.path
          }}
        >
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center mb-1.5",
            "bg-destructive/10 text-destructive"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-destructive">
            {item.name}
          </span>
        </Button>
      )
    }

    return (
      <Link
        href={item.path}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center h-20 w-full rounded-lg cursor-pointer",
          "hover:bg-accent/50 transition-colors",
          isActive && "bg-primary/10"
        )}
      >
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn(
          "text-[10px] font-medium text-center leading-tight",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {item.name}
        </span>
      </Link>
    )
  }

  const MobileNavItem = ({ item, isActive, onClick }) => {
    const Icon = iconMap[item.icon] || Activity
    
    if (item.name === "Logout" || item.name === "LOGOUT") {
      return (
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-4 w-full justify-start px-4 py-3 h-auto rounded-lg",
            "hover:bg-accent text-destructive hover:text-destructive"
          )}
          onClick={() => {
            if (onClick) onClick()
            window.location.href = item.path
          }}
        >
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{item.name}</span>
        </Button>
      )
    }

    return (
      <Link
        href={item.path}
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors",
          "hover:bg-accent",
          isActive && "bg-primary text-primary-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{item.name}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
        )}
      </Link>
    )
  }

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div className="flex flex-col h-full bg-background w-32 border-r">
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavItem 
              key={item.id}
              item={item} 
              isActive={pathname === item.path}
            />
          ))}
        </div>

        <div className="p-4 border-t">
          <button 
            className="flex items-center justify-center h-12 w-full rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => document.documentElement.classList.toggle('dark')}
            aria-label="Toggle theme"
          >
            <Moon className="h-5 w-5 text-muted-foreground dark:hidden" />
            <Sun className="h-5 w-5 text-muted-foreground hidden dark:block" />
          </button>
        </div>
      </div>
    )
  }

  // Mobile sidebar with Sheet
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 bg-background flex flex-col">
        <SheetHeader className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">M</span>
            </div>
            <SheetTitle className="text-base font-semibold">
              maven republic
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {items.map((item) => (
              <MobileNavItem
                key={item.id}
                item={item}
                isActive={pathname === item.path}
                onClick={() => onOpenChange(false)}
              />
            ))}
          </nav>
        </div>

        <div className="border-t bg-muted/30 p-4">
          <button 
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={() => document.documentElement.classList.toggle('dark')}
            aria-label="Toggle theme"
          >
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="h-5 w-5 hidden dark:block" />
            <span className="text-sm font-medium">Toggle Theme</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}