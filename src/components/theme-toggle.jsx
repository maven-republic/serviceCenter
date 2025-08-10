// src/components/theme-toggle.jsx
'use client'

import { Moon, Sun, Monitor, Lock } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle({ variant = "dropdown", className, ...props }) {
  const { theme, setTheme, actualTheme, isProfessionalWorkspace, isCustomerWorkspace } = useTheme()

  // 🔒 Simple toggle version (disabled only for customer workspace)
  if (variant === "simple") {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "relative",
          isCustomerWorkspace && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (!isCustomerWorkspace) {
            setTheme(actualTheme === "light" ? "dark" : "light")
          }
        }}
        disabled={isCustomerWorkspace}
        title={
          isCustomerWorkspace 
            ? "Theme switching disabled in customer workspace" 
            : isProfessionalWorkspace
            ? "Professional workspace theme toggle"
            : "Toggle theme"
        }
        {...props}
      >
        {isCustomerWorkspace ? (
          <>
            <Lock className="h-[1.2rem] w-[1.2rem]" />
            <Sun className="absolute h-[1.2rem] w-[1.2rem] opacity-30" />
          </>
        ) : (
          <>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </>
        )}
        <span className="sr-only">
          {isCustomerWorkspace ? "Theme locked to light" : "Toggle theme"}
        </span>
      </Button>
    )
  }

  // 🎨 Advanced dropdown version (disabled only for customer workspace)
  if (isCustomerWorkspace) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn("relative cursor-not-allowed opacity-50", className)}
        disabled={true}
        title="Theme switching disabled in customer workspace"
        {...props}
      >
        <Lock className="h-[1.2rem] w-[1.2rem]" />
        <Sun className="absolute h-[1.2rem] w-[1.2rem] opacity-30" />
        <span className="sr-only">Theme locked to light</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          {...props}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 bg-current rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 bg-current rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 bg-current rounded-full" />
          )}
        </DropdownMenuItem>
        
        {/* Show current applied theme for system mode */}
        {theme === "system" && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
            Currently: {actualTheme}
          </div>
        )}
        
        {/* Show workspace context */}
        {isProfessionalWorkspace && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
            Professional workspace
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 🎯 Professional Workspace Theme Status Component (Updated)
export function ProfessionalThemeStatus({ className, ...props }) {
  const { isProfessionalWorkspace, actualTheme } = useTheme()

  if (!isProfessionalWorkspace) return null

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs",
        "bg-muted/50 border border-border rounded-md",
        "text-muted-foreground",
        className
      )}
      {...props}
    >
      <Monitor className="h-3 w-3" />
      <span>Professional workspace ({actualTheme} theme)</span>
    </div>
  )
}

// 🔄 Theme Sync Hook for components that need theme awareness
export function useThemeSync() {
  const { theme, actualTheme, isProfessionalWorkspace, isCustomerWorkspace } = useTheme()
  
  return {
    theme,
    actualTheme,
    isProfessionalWorkspace,
    isCustomerWorkspace,
    isDark: actualTheme === "dark",
    isLight: actualTheme === "light",
    canChangeTheme: !isCustomerWorkspace, // Only customer workspace is locked
  }
}